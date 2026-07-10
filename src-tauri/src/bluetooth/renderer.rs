use anyhow::Result;
use image::{ImageBuffer, Luma};

pub const PAPER_WIDTH: u32 = 384;
pub const PAPER_HEIGHT: u32 = 100;

pub struct RenderResult {
    pub image: ImageBuffer<Luma<u8>, Vec<u8>>,
}

pub fn render_test_pattern() -> Result<RenderResult> {
    let mut image =
        ImageBuffer::from_pixel(PAPER_WIDTH, PAPER_HEIGHT, Luma([255]));

    // Draw a solid black rectangle in the center.
    for y in 20..80 {
        for x in 50..334 {
            image.put_pixel(x, y, Luma([0]));
        }
    }

    Ok(RenderResult { image })
}