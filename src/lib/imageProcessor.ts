export async function convertImageToThermal(
  imageSrc: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray =
          0.299 * data[i] +
          0.587 * data[i + 1] +
          0.114 * data[i + 2];

        const oldPixel = gray;
        const newPixel = oldPixel > 128 ? 255 : 0;
        const error = oldPixel - newPixel;

        data[i] = newPixel;
        data[i + 1] = newPixel;
        data[i + 2] = newPixel;

        const spreadError = (index: number, factor: number) => {
          if (index < 0 || index >= data.length) return;

          const value = data[index] + error * factor;

          data[index] = Math.max(0, Math.min(255, value));
          data[index + 1] = data[index];
          data[index + 2] = data[index];
        };

        spreadError(i + 4, 7 / 16);
        spreadError(i + canvas.width * 4 - 4, 3 / 16);
        spreadError(i + canvas.width * 4, 5 / 16);
        spreadError(i + canvas.width * 4 + 4, 1 / 16);
      }

      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.src = imageSrc;
  });
}