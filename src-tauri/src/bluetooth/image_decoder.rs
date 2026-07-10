use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};
use image::DynamicImage;

pub fn decode_base64_image(data: &str) -> Result<DynamicImage> {
    // Remove data:image/png;base64,... header if present
    let base64 = match data.split_once(",") {
        Some((_, encoded)) => encoded,
        None => data,
    };

    let bytes = general_purpose::STANDARD.decode(base64)?;

    let image = image::load_from_memory(&bytes)?;

    Ok(image)
}