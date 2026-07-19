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

    // NEW: this printer expects LSB-first bit packing within each byte.
    // With lsb_first=false, the first pixel of every 8-pixel group landed
    // on bit 7 and the last on bit 0 - so each ~1.7mm chunk printed with
    // its pixels reversed in place (chunk order was still correct, which
    // is why large-scale layout looked right but fine detail/text came
    // out wavy and locally mirrored). A solid test rectangle can't reveal
    // this, since every bit in a solid fill is identical either way.
    job.extend(build_line_packets(
        &pixels,
        width,
        8,
        ImageEncoding::TinyRaw,
        true,
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

    // NEW: see matching note in build_test_print_job above - same bit-order
    // fix applied here since this is the path your real photo prints go
    // through.
    job.extend(build_line_packets(
        &pixels,
        width,
        8,
        ImageEncoding::TinyRaw,
        true,
    ));

    Ok(job)
}