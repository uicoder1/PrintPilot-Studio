use anyhow::Result;
use image::{DynamicImage, Luma};

use crate::bluetooth::encoding::{build_line_packets, ImageEncoding};
use crate::bluetooth::renderer::RenderResult;

pub fn build_test_print_job(render: &RenderResult) -> Result<Vec<u8>> {
    let width = render.image.width() as usize;

    let mut pixels = Vec::new();

    for pixel in render.image.pixels() {
        let Luma([value]) = *pixel;

        pixels.push(if value < 128 { 1 } else { 0 });
    }

    let mut job = Vec::new();

    job.extend(build_line_packets(
        &pixels,
        width,
        8,
        ImageEncoding::TinyRaw,
        false,
    ));

    Ok(job)
}

pub fn build_image_print_job(image: DynamicImage) -> Result<Vec<u8>> {
    let image = image.to_luma8();

    let width = image.width() as usize;

    let mut pixels = Vec::new();

    for pixel in image.pixels() {
        let Luma([value]) = *pixel;

        pixels.push(if value < 128 { 1 } else { 0 });
    }

    let mut job = Vec::new();

    job.extend(build_line_packets(
        &pixels,
        width,
        8,
        ImageEncoding::TinyRaw,
        false,
    ));

    Ok(job)
}