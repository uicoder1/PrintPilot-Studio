use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};
use image::{
    imageops::{self, FilterType},
    DynamicImage, ImageBuffer, Rgba,
};

const PRINTER_WIDTH: u32 = 384;

/// Fixed print length: 7cm at this printer's 200 DPI vertical resolution
/// (7cm / 2.54 * 200 ≈ 551px). Every image print comes out exactly this
/// long on paper, regardless of the source photo's own aspect ratio.
const PRINTER_HEIGHT: u32 = 551;

pub fn decode_base64_image(data: &str) -> Result<DynamicImage> {
    // Remove data:image/png;base64,... header if present
    let base64 = match data.split_once(",") {
        Some((_, encoded)) => encoded,
        None => data,
    };

    let bytes = general_purpose::STANDARD.decode(base64)?;
    let image = image::load_from_memory(&bytes)?;

    // `.resize()` (not `.resize_exact()`) scales down to fit *within*
    // 384 x 551 while preserving aspect ratio — the whole photo always
    // stays visible, never cropped, same as the "object-contain" preview
    // shown in the UI.
    let fitted = image.resize(PRINTER_WIDTH, PRINTER_HEIGHT, FilterType::Lanczos3);

    // Center the fitted photo on a fixed white 384 x 551 canvas, so the
    // final image handed to the printer is always exactly the printer's
    // fixed 57mm x 7cm print area, whatever the photo's own shape was.
    let mut canvas: ImageBuffer<Rgba<u8>, Vec<u8>> =
        ImageBuffer::from_pixel(PRINTER_WIDTH, PRINTER_HEIGHT, Rgba([255, 255, 255, 255]));

    let x_offset = ((PRINTER_WIDTH - fitted.width()) / 2) as i64;
    let y_offset = ((PRINTER_HEIGHT - fitted.height()) / 2) as i64;

    imageops::overlay(&mut canvas, &fitted.to_rgba8(), x_offset, y_offset);

    Ok(DynamicImage::ImageRgba8(canvas))
}
