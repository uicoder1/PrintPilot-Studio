mod bluetooth;
use bluetooth::{get_adapter, BluetoothState};
use bluetooth::printer::{build_image_print_job, build_test_print_job};
use bluetooth::image_decoder::decode_base64_image;
use bluetooth::renderer::render_test_pattern;
use btleplug::api::{Central, CharPropFlags, Characteristic, Peripheral as _, ScanFilter, WriteType};
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

    use btleplug::api::Central;

if !adapter
    .adapter_info()
    .await
    .map(|_| true)
    .unwrap_or(false)
{
    return Err("Bluetooth is turned off".to_string());
}

    if let Err(e) = adapter.start_scan(ScanFilter::default()).await {
    let msg = e.to_string().to_lowercase();

    if msg.contains("powered")
        || msg.contains("bluetooth")
        || msg.contains("adapter")
        || msg.contains("radio")
    {
        return Err("Bluetooth is turned off".to_string());
    }

    return Err(e.to_string());
}

    sleep(Duration::from_secs(3)).await;

    // Stop scanning to save power / avoid stray results, then read back
    // everything the adapter discovered during the scan window.
    let _ = adapter.stop_scan().await;

    let peripherals = match adapter.peripherals().await {
    Ok(p) => p,
    Err(e) => {
        println!("PERIPHERALS ERROR: {:?}", e);
        return Err(e.to_string());
    }
};

    let mut devices = Vec::new();
    let mut cache = state.peripherals.lock().await;

    for peripheral in peripherals {
        if let Ok(Some(properties)) = peripheral.properties().await {
            let id = peripheral.id().to_string();
            let name = properties
                .local_name
                .unwrap_or_else(|| format!("Unknown ({})", id));
            let lower = name.to_lowercase();

            

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

#[tauri::command]
async fn is_printer_connected(
    state: tauri::State<'_, BluetoothState>,
    id: String,
) -> Result<bool, String> {
    let peripheral = {
        let cache = state.peripherals.lock().await;

        cache
            .get(&id)
            .cloned()
            .ok_or("Printer not found")?
    };

    peripheral
        .is_connected()
        .await
        .map_err(|e| e.to_string())
}
/// Writes `data` to the printer identified by `id`, in CHUNK_SIZE pieces.
///
/// Why this exists: cheap BLE thermal printers commonly drop their
/// connection after a short idle period (e.g. the time between clicking
/// "Connect" and actually clicking "Print"). When that happens, the
/// `Peripheral`/`Characteristic` handles cached at connect-time go stale.
/// On Windows this surfaces as `HRESULT(0x80000013)` / "The object has
/// been closed" the moment you try to write to it - the OS has already
/// torn down the native BLE object out from under btleplug.
///
/// This wraps the write loop with a connectivity check up front, and a
/// one-time reconnect + service/characteristic re-discovery + retry if
/// the write still fails partway through. This does not change anything
/// about how the image/text data itself is built - only how robustly it
/// gets sent once the printer connection may have gone stale.
async fn write_to_printer(
    state: &tauri::State<'_, BluetoothState>,
    id: &str,
    data: &[u8],
) -> Result<(), String> {
    const CHUNK_SIZE: usize = 180;

    async fn reconnect_and_get_char(
        state: &tauri::State<'_, BluetoothState>,
        id: &str,
    ) -> Result<(btleplug::platform::Peripheral, Characteristic, WriteType), String> {
        let peripheral = {
            let cache = state.peripherals.lock().await;
            cache
                .get(id)
                .cloned()
                .ok_or("Printer not found. Please scan again.")?
        };

        peripheral
            .connect()
            .await
            .map_err(|e| e.to_string())?;

        peripheral
            .discover_services()
            .await
            .map_err(|e| e.to_string())?;

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
            chars.insert(id.to_string(), write_char.clone());
        }

        let write_type = if write_char.properties.contains(CharPropFlags::WRITE) {
            WriteType::WithResponse
        } else {
            WriteType::WithoutResponse
        };

        Ok((peripheral, write_char, write_type))
    }

    let peripheral = {
        let cache = state.peripherals.lock().await;
        cache
            .get(id)
            .cloned()
            .ok_or("Printer not connected. Please connect first.")?
    };

    let write_char = {
        let chars = state.write_characteristics.lock().await;
        chars
            .get(id)
            .cloned()
            .ok_or("No writable characteristic. Please connect first.")?
    };

    let already_connected = peripheral.is_connected().await.unwrap_or(false);

    let (peripheral, write_char, write_type) = if !already_connected {
        // Known-stale up front - skip straight to reconnecting instead of
        // wasting a write attempt we already know will fail.
        reconnect_and_get_char(state, id).await?
    } else {
        let write_type = if write_char.properties.contains(CharPropFlags::WRITE) {
            WriteType::WithResponse
        } else {
            WriteType::WithoutResponse
        };
        (peripheral, write_char, write_type)
    };

    let mut reconnected_once = !already_connected; // already reconnected above if true

    let mut chunks = data.chunks(CHUNK_SIZE);
    let mut current = (peripheral, write_char, write_type);

    while let Some(chunk) = chunks.next() {
        let write_result = current.0.write(&current.1, chunk, current.2).await;

        if let Err(e) = write_result {
            if reconnected_once {
                // Already tried recovering once this call - don't loop forever.
                return Err(e.to_string());
            }

            // Likely a stale/closed handle (e.g. RO_E_CLOSED on Windows).
            // Reconnect, re-discover the characteristic, and retry this
            // same chunk once before giving up.
            reconnected_once = true;
            current = reconnect_and_get_char(state, id).await?;

            current
                .0
                .write(&current.1, chunk, current.2)
                .await
                .map_err(|e| e.to_string())?;
        }

        tokio::time::sleep(Duration::from_millis(10)).await;
    }

    Ok(())
}

#[tauri::command]
async fn print_text(
    state: tauri::State<'_, BluetoothState>,
    id: String,
    _text: String,
) -> Result<String, String> {
    let render = render_test_pattern()
        .map_err(|e| e.to_string())?;

    let data = build_test_print_job(&render)
        .map_err(|e| e.to_string())?;

    write_to_printer(&state, &id, &data).await?;

    Ok("Printed".to_string())
}

#[tauri::command]
async fn print_image(
    state: tauri::State<'_, BluetoothState>,
    id: String,
    image: String,
) -> Result<String, String> {
    let image = decode_base64_image(&image)
        .map_err(|e| e.to_string())?;

    let data = build_image_print_job(image)
        .map_err(|e| e.to_string())?;

    write_to_printer(&state, &id, &data).await?;

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
            is_printer_connected,
            print_text,
            print_image
            
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}