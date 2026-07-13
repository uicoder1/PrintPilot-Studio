export type ThermalMode = "speed" | "hd";

interface ConvertOptions {
  /** 0, 90, 180, or 270 */
  rotateDeg?: number;
  /** "hd" = Floyd–Steinberg dithering (better gradients, slower).
   *  "speed" = plain threshold (crisper text/line art, faster). */
  mode?: ThermalMode;
}

/**
 * Downscales an image in repeated 2x steps (box-filter style) instead of a
 * single large jump. A single drawImage() from e.g. 1500px -> 384px leaves
 * high-frequency noise (skin texture, wall texture, JPEG artifacts) behind
 * that bilinear filtering can't fully remove. That leftover noise is exactly
 * what Floyd-Steinberg later renders as "too many dots". Halving repeatedly
 * lets each step do a proper local average, so noise is smoothed away BEFORE
 * dithering ever sees it. This does not touch brightness/contrast/gamma/
 * threshold - it only changes how the resize itself is performed.
 */
function progressiveDownscale(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  let srcWidth = img.width;
  let srcHeight = img.height;

  let currentCanvas = document.createElement("canvas");
  currentCanvas.width = srcWidth;
  currentCanvas.height = srcHeight;
  const firstCtx = currentCanvas.getContext("2d")!;
  firstCtx.imageSmoothingEnabled = true;
  firstCtx.imageSmoothingQuality = "high";
  firstCtx.drawImage(img, 0, 0, srcWidth, srcHeight);

  // Halve repeatedly until we're within 2x of the target size.
  while (
    currentCanvas.width > targetWidth * 2 &&
    currentCanvas.height > targetHeight * 2
  ) {
    const nextWidth = Math.round(currentCanvas.width / 2);
    const nextHeight = Math.round(currentCanvas.height / 2);

    const nextCanvas = document.createElement("canvas");
    nextCanvas.width = nextWidth;
    nextCanvas.height = nextHeight;

    const nextCtx = nextCanvas.getContext("2d")!;
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = "high";
    nextCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);

    currentCanvas = nextCanvas;
  }

  // Final precise step down to the exact target size.
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext("2d")!;
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = "high";
  finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

  return finalCanvas;
}

/**
 * Edge-preserving smoothing (lightweight bilateral filter) on the grayscale
 * channel, applied right before dithering.
 *
 * Why: after a clean resize, Floyd-Steinberg still faithfully renders any
 * leftover per-pixel noise (skin micro-texture, sensor grain, JPEG
 * blocking) as visible dot noise in flat regions like skin and walls. A
 * plain blur would fix that but also soften real edges (jawline, shoulder,
 * hairline). This filter only averages a pixel with a neighbor if their
 * brightness difference is small (i.e. they're likely the same flat
 * region) - so noise in flat areas gets smoothed away while genuine edges
 * (large brightness jumps) are left untouched and stay crisp.
 *
 * Every neighbor is looked up by explicit (x, y) with bounds checks -
 * this avoids the classic bug where a flat i-4/i+4 index walk silently
 * blends the last pixel of one row into the first pixel of the next row,
 * which produces vertical banding artifacts (this is the likely cause of
 * the "vertical artifacts" seen in earlier blur experiments).
 */
function edgePreserveSmoothGray(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  edgeThreshold: number = 18
): void {
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      gray[y * width + x] = data[(y * width + x) * 4];
    }
  }

  const out = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const center = gray[y * width + x];
      let sum = center;
      let count = 1;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

          const neighbor = gray[ny * width + nx];
          if (Math.abs(neighbor - center) <= edgeThreshold) {
            sum += neighbor;
            count++;
          }
        }
      }

      out[y * width + x] = sum / count;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = out[y * width + x];
      const i = (y * width + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = value;
    }
  }
}

/**
 * Percentile-based levels stretch on the grayscale channel.
 *
 * Why: a photo's mid-tones (skin, walls) sit in a narrow gray band, e.g.
 * 90-190 out of 0-255. Floyd-Steinberg has to represent every one of those
 * mid values as a mix of black/white dots, so a narrow tonal range means a
 * LOT of the image ends up in "heavy dithering" territory. Stretching the
 * histogram so the darkest ~0.5% of pixels become true black and the
 * brightest ~0.5% become true white widens that range - more of the photo
 * lands closer to solid black or solid white, which dithers with far less
 * visible speckle, while true mid-tone gradients (which need dithering)
 * still dither correctly.
 *
 * This is a plain per-pixel lookup table remap - it never reads a
 * neighboring pixel, so (unlike a spatial blur) it cannot produce row/column
 * banding artifacts from an indexing bug.
 */
function percentileLevelsStretch(
  data: Uint8ClampedArray,
  clipPercent: number = 0.5
): void {
  const histogram = new Uint32Array(256);
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }

  const clipCount = Math.floor((totalPixels * clipPercent) / 100);

  let low = 0;
  let cumulative = 0;
  for (let v = 0; v < 256; v++) {
    cumulative += histogram[v];
    if (cumulative > clipCount) {
      low = v;
      break;
    }
  }

  let high = 255;
  cumulative = 0;
  for (let v = 255; v >= 0; v--) {
    cumulative += histogram[v];
    if (cumulative > clipCount) {
      high = v;
      break;
    }
  }

  if (high <= low) return; // degenerate image (flat color) - skip stretch

  const range = high - low;

  for (let i = 0; i < data.length; i += 4) {
    const value = ((data[i] - low) * 255) / range;
    const clamped = Math.max(0, Math.min(255, value));
    data[i] = data[i + 1] = data[i + 2] = clamped;
  }
}

export async function convertImageToThermal(
  imageSrc: string,
  options: ConvertOptions = {}
): Promise<string> {
  const { rotateDeg = 0, mode = "hd" } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const PRINTER_WIDTH = 384;

      const scale = PRINTER_WIDTH / img.width;

      const resizedWidth = PRINTER_WIDTH;
      const resizedHeight = Math.round(img.height * scale);

      const swapped = rotateDeg % 180 !== 0;

      const canvas = document.createElement("canvas");

      canvas.width = swapped ? resizedHeight : resizedWidth;
      canvas.height = swapped ? resizedWidth : resizedHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      // NEW: resize progressively (in halving steps) instead of one big
      // single-step drawImage. This is the fix for the "too many dots /
      // noisy skin / noisy walls" problem - see progressiveDownscale() above.
      const resizedSource = progressiveDownscale(img, resizedWidth, resizedHeight);

      ctx.save();

      ctx.translate(canvas.width / 2, canvas.height / 2);

      ctx.rotate((rotateDeg * Math.PI) / 180);

      ctx.drawImage(
        resizedSource,
        -resizedWidth / 2,
        -resizedHeight / 2,
        resizedWidth,
        resizedHeight
      );

      ctx.restore();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Brightness / Contrast / Gamma + Grayscale
      // UNCHANGED - same values as before, not re-tuned.

      const IMAGE_SETTINGS = {
        brightness: 8,
        contrast: 38,
        gamma: 0.88,
        threshold: 128,
      };

      const factor =
        (259 * (IMAGE_SETTINGS.contrast + 255)) /
        (255 * (259 - IMAGE_SETTINGS.contrast));

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        r += IMAGE_SETTINGS.brightness;
        g += IMAGE_SETTINGS.brightness;
        b += IMAGE_SETTINGS.brightness;

        // Contrast
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        // Gamma
        r = 255 * Math.pow(r / 255, IMAGE_SETTINGS.gamma);
        g = 255 * Math.pow(g / 255, IMAGE_SETTINGS.gamma);
        b = 255 * Math.pow(b / 255, IMAGE_SETTINGS.gamma);

        // Clamp
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        // Grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      if (mode === "hd") {
        // NEW: widen the tonal range so fewer pixels sit in the "heavy
        // dithering" mid-gray zone. See percentileLevelsStretch() above.
        percentileLevelsStretch(data, 0.5);

        // NEW: smooth flat-region noise (skin, walls) before dithering,
        // while leaving real edges untouched. See edgePreserveSmoothGray()
        // above for why this is safe where plain blur was not.
        edgePreserveSmoothGray(data, width, height, 18);
      }

      if (mode === "hd") {
        // NEW: serpentine (boustrophedon) Floyd-Steinberg. Alternating scan
        // direction each row removes the diagonal "worm" streaking that
        // single-direction FS produces on faces/skin. The threshold and
        // error-diffusion weights themselves are unchanged from before.
        for (let y = 0; y < height; y++) {
          const leftToRight = y % 2 === 0;
          const rowStart = y * width;

          for (let xi = 0; xi < width; xi++) {
            const x = leftToRight ? xi : width - 1 - xi;
            const i = (rowStart + x) * 4;

            const oldPixel = data[i];
            const newPixel = oldPixel > IMAGE_SETTINGS.threshold ? 255 : 0;
            const error = oldPixel - newPixel;

            data[i] = data[i + 1] = data[i + 2] = newPixel;

            const dx = leftToRight ? 1 : -1;

            const spreadError = (px: number, py: number, factor: number) => {
              if (px < 0 || px >= width || py < 0 || py >= height) return;
              const idx = (py * width + px) * 4;
              const value = data[idx] + error * factor;
              const clamped = Math.max(0, Math.min(255, value));
              data[idx] = data[idx + 1] = data[idx + 2] = clamped;
            };

            spreadError(x + dx, y, 7 / 16);
            spreadError(x - dx, y + 1, 3 / 16);
            spreadError(x, y + 1, 5 / 16);
            spreadError(x + dx, y + 1, 1 / 16);
          }
        }
      } else {
        // Plain threshold - faster, no dithering noise. UNCHANGED.
        for (let i = 0; i < data.length; i += 4) {
          const value = data[i] > 128 ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = value;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
      return;
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}