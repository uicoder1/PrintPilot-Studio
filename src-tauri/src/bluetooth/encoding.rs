use crate::bluetooth::protocol::{
    build_packet,
    CMD_PRINT_LINE,
    CMD_RLE_LINE,
    CMD_SPEED,
};

pub fn encode_run(color: u8, mut count: usize) -> Vec<u8> {
    let mut out = Vec::new();

    while count > 127 {
        out.push((color << 7) | 127);
        count -= 127;
    }

    if count > 0 {
        out.push((color << 7) | count as u8);
    }

    out
}

pub fn rle_encode_line(line: &[u8]) -> Vec<u8> {
    if line.is_empty() {
        return Vec::new();
    }

    let mut runs = Vec::new();

    let mut prev = line[0];
    let mut count: usize = 1;

    let mut has_black = prev == 1;

    for &pixel in &line[1..] {
        if pixel == 1 {
            has_black = true;
        }

        if pixel == prev {
            count += 1;
        } else {
            runs.extend(encode_run(prev, count));
            prev = pixel;
            count = 1;
        }
    }

    if has_black {
        runs.extend(encode_run(prev, count));
    }

    if runs.is_empty() {
        runs.extend(encode_run(prev, count));
    }

    runs
}

pub fn pack_line(line: &[u8], lsb_first: bool) -> Vec<u8> {
    let mut out = Vec::new();

    for chunk in line.chunks(8) {
        let mut value: u8 = 0;

        for (bit, &pixel) in chunk.iter().enumerate() {
            if pixel == 1 {
                if lsb_first {
                    value |= 1 << bit;
                } else {
                    value |= 1 << (7 - bit);
                }
            }
        }

        out.push(value);
    }

    out
}

#[derive(Clone, Copy, PartialEq)]
pub enum ImageEncoding {
    TinyRaw,
    TinyRle,
}

pub fn build_line_packets(
    pixels: &[u8],
    width: usize,
    speed: u8,
    encoding: ImageEncoding,
    lsb_first: bool,
) -> Vec<u8> {
    assert!(width % 8 == 0);

    let height = pixels.len() / width;
    let width_bytes = width / 8;

    let mut out = Vec::new();

    for row in 0..height {
        let start = row * width;
        let end = start + width;

        let line = &pixels[start..end];

        match encoding {
            ImageEncoding::TinyRaw => {
                let raw = pack_line(line, lsb_first);
                out.extend(build_packet(CMD_PRINT_LINE, &raw));
            }

            ImageEncoding::TinyRle => {
                let rle = rle_encode_line(line);

                if rle.len() <= width_bytes {
                    out.extend(build_packet(CMD_RLE_LINE, &rle));
                } else {
                    let raw = pack_line(line, lsb_first);
                    out.extend(build_packet(CMD_PRINT_LINE, &raw));
                }
            }
        }

        if (row + 1) % 200 == 0 {
            out.extend(build_packet(CMD_SPEED, &[speed]));
        }
    }

    out
}