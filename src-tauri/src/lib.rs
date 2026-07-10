
mod bluetooth;
use bluetooth::{get_adapter, BluetoothState};
use bluetooth::printer::{build_image_print_job, build_test_print_job};
use bluetooth::image_decoder::decode_base64_image;
use bluetooth::renderer::render_test_pattern;
use btleplug::api::{Central, CharPropFlags, Peripheral as _, ScanFilter, WriteType};
use serde::Serialize;
use tokio::time::{sleep, Duration};

#[derive(Serialize)]
struct PrinterDevice {
    id: String,
    name: String,
}

/// Scans for nearby BLE printers and remembers them in shared state so
/// that `connect_printer` can find them afterwards.
#[tauri::command]
async fn scan_printers(
    state: tauri::State<'_, BluetoothState>,
) -> Result<Vec<PrinterDevice>, String> {
    let adapter = get_adapter(&state).await?;

    adapter
        .start_scan(ScanFilter::default())
        .await
        .map_err(|e| e.to_string())?;

    sleep(Duration::from_secs(3)).await;

    // Stop scanning to save power / avoid stray results, then read back
    // everything the adapter discovered during the scan window.
    let _ = adapter.stop_scan().await;

    let peripherals = adapter.peripherals().await.map_err(|e| e.to_string())?;

    let mut devices = Vec::new();
    let mut cache = state.peripherals.lock().await;

    for peripheral in peripherals {
        if let Ok(Some(properties)) = peripheral.properties().await {
            let id = peripheral.id().to_string();
            let name = properties
                .local_name
                .unwrap_or_else(|| format!("Unknown ({})", id));

            devices.push(PrinterDevice {
                id: id.clone(),
                name,
            });

            // This is the key fix: keep the live Peripheral handle around
            // instead of letting it drop when this function returns.
            cache.insert(id, peripheral);
        }
    }

    Ok(devices)
}

/// Connects to a printer that was previously found by `scan_printers`,
/// discovers its services, and locates its writable characteristic so
/// `print_text` can send data to it later.
#[tauri::command]
async fn connect_printer(
    state: tauri::State<'_, BluetoothState>,
    id: String,
) -> Result<String, String> {
    let peripheral = {
        let cache = state.peripherals.lock().await;
        cache
            .get(&id)
            .cloned()
            .ok_or("Printer not found. Please scan again.")?
    };

    let already_connected = peripheral.is_connected().await.unwrap_or(false);
    if !already_connected {
        peripheral.connect().await.map_err(|e| e.to_string())?;
    }

    peripheral
        .discover_services()
        .await
        .map_err(|e| e.to_string())?;

    // Thermal printers accept ESC/POS data over a single writable
    // characteristic. Rather than hardcoding a UUID (which varies between
    // printer models/vendors), find whichever characteristic actually
    // supports WRITE or WRITE_WITHOUT_RESPONSE.
    let characteristics = peripheral.characteristics();

    let write_char = characteristics
        .iter()
        .find(|c| c.properties.contains(CharPropFlags::WRITE_WITHOUT_RESPONSE))
        .or_else(|| {
            characteristics
                .iter()
                .find(|c| c.properties.contains(CharPropFlags::WRITE))
        })
        .cloned()
        .ok_or("No writable characteristic found on this printer")?;

    {
        let mut chars = state.write_characteristics.lock().await;
        chars.insert(id, write_char);
    }

    Ok("Connected".to_string())
}

#[tauri::command]
async fn disconnect_printer(
    state: tauri::State<'_, BluetoothState>,
    id: String,
) -> Result<String, String> {
    let peripheral = {
        let cache = state.peripherals.lock().await;
        cache
            .get(&id)
            .cloned()
            .ok_or("Printer not found")?
    };

    if peripheral.is_connected().await.unwrap_or(false) {
        peripheral
            .disconnect()
            .await
            .map_err(|e| e.to_string())?;
    }

    {
        let mut chars = state.write_characteristics.lock().await;
        chars.remove(&id);
    }

    Ok("Disconnected".to_string())
}
/// Sends the built-in test pattern to the printer.
#[tauri::command]
async fn print_text(
    state: tauri::State<'_, BluetoothState>,
    id: String,
    _text: String,
) -> Result<String, String> {
    let peripheral = {
        let cache = state.peripherals.lock().await;
        cache
            .get(&id)
            .cloned()
            .ok_or("Printer not connected. Please connect first.")?
    };

    let write_char = {
        let chars = state.write_characteristics.lock().await;
        chars
            .get(&id)
            .cloned()
            .ok_or("No writable characteristic. Please connect first.")?
    };

    let write_type = if write_char.properties.contains(CharPropFlags::WRITE) {
        WriteType::WithResponse
    } else {
        WriteType::WithoutResponse
    };

    let render = render_test_pattern()
        .map_err(|e| e.to_string())?;

    let data = build_test_print_job(&render)
        .map_err(|e| e.to_string())?;

    const CHUNK_SIZE: usize = 180;

    for chunk in data.chunks(CHUNK_SIZE) {
        peripheral
            .write(&write_char, chunk, write_type)
            .await
            .map_err(|e| e.to_string())?;

        tokio::time::sleep(Duration::from_millis(10)).await;
    }

    Ok("Printed".to_string())
}

#[tauri::command]
async fn print_image(
    state: tauri::State<'_, BluetoothState>,
    id: String,
    image: String,
) -> Result<String, String> {
    let peripheral = {
        let cache = state.peripherals.lock().await;
        cache
            .get(&id)
            .cloned()
            .ok_or("Printer not connected. Please connect first.")?
    };

    let write_char = {
        let chars = state.write_characteristics.lock().await;
        chars
            .get(&id)
            .cloned()
            .ok_or("No writable characteristic. Please connect first.")?
    };

    let write_type = if write_char.properties.contains(CharPropFlags::WRITE) {
        WriteType::WithResponse
    } else {
        WriteType::WithoutResponse
    };

    let image = decode_base64_image(&image)
        .map_err(|e| e.to_string())?;

    let data = build_image_print_job(image)
        .map_err(|e| e.to_string())?;

    const CHUNK_SIZE: usize = 180;

    for chunk in data.chunks(CHUNK_SIZE) {
        peripheral
            .write(&write_char, chunk, write_type)
            .await
            .map_err(|e| e.to_string())?;

        tokio::time::sleep(Duration::from_millis(10)).await;
    }

    Ok("Printed".to_string())
}
        #[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(BluetoothState::default())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_printers,
            connect_printer,
            disconnect_printer,
            print_text,
            print_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

