pub const PREFIX: [u8; 2] = [0x51, 0x78];

use crc::{Crc, CRC_8_SMBUS};

const CRC8: Crc<u8> = Crc::<u8>::new(&CRC_8_SMBUS);

pub const CMD_PRINT_LINE: u8 = 0xA2;
pub const CMD_DEVICE_STATE: u8 = 0xA3;
pub const CMD_BLACKENING: u8 = 0xA4;
pub const CMD_STOP_PRINT: u8 = 0xA6;
pub const CMD_ENERGY: u8 = 0xAF;
pub const CMD_SPEED: u8 = 0xBD;
pub const CMD_PRINT_MODE: u8 = 0xBE;
pub const CMD_RLE_LINE: u8 = 0xBF;



/// CRC-8 checksum
pub fn crc8(data: &[u8]) -> u8 {
    let mut digest = CRC8.digest();
    digest.update(data);
    digest.finalize()
}

pub fn build_packet(command: u8, payload: &[u8]) -> Vec<u8> {
    let mut packet = Vec::new();

    packet.extend_from_slice(&PREFIX);

    packet.push(command);

    packet.push(0x00);

    let length = payload.len() as u16;
    packet.push((length & 0xFF) as u8);
    packet.push((length >> 8) as u8);

    packet.extend_from_slice(payload);

    packet.push(crc8(payload));

    packet.push(0xFF);

    packet
}

pub fn blackening_packet(level: u8) -> Vec<u8> {
    let level = level.clamp(1, 5);
    build_packet(CMD_BLACKENING, &[0x30 + level])
}

pub fn speed_packet(speed: u8) -> Vec<u8> {
    build_packet(CMD_SPEED, &[speed])
}

pub fn energy_packet(energy: u16) -> Vec<u8> {
    build_packet(CMD_ENERGY, &energy.to_le_bytes())
}

pub fn device_state_packet() -> Vec<u8> {
    build_packet(CMD_DEVICE_STATE, &[0x00])
}

pub fn stop_print_packet() -> Vec<u8> {
    build_packet(CMD_STOP_PRINT, &[0x05])
}

pub fn print_mode_packet(is_text: bool) -> Vec<u8> {
    build_packet(
        CMD_PRINT_MODE,
        &[if is_text { 1 } else { 0 }],
    )
}

pub fn paper_feed_packet(amount: u16) -> Vec<u8> {
    let mut payload = Vec::new();

    payload.extend_from_slice(&amount.to_le_bytes());

    payload.push(0x11);

    build_packet(0xA1, &payload)
}