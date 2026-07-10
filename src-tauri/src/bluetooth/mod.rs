pub mod encoding;
pub mod protocol;
pub mod renderer;
pub mod printer;
pub mod image_decoder;

use btleplug::api::{Characteristic, Manager as _};
use btleplug::platform::{Adapter, Manager, Peripheral};
use std::collections::HashMap;
use tokio::sync::Mutex;

/// Shared Bluetooth state, kept alive for the whole lifetime of the app.
///
/// This is the piece that was missing before: previously every command
/// created its own `Manager`/`Adapter` and threw them away when it
/// returned, so `connect_printer` could never find what `scan_printers`
/// had just discovered. Now the Manager, Adapter, discovered Peripherals,
/// and (once connected) each printer's writable Characteristic all live
/// here, in Tauri-managed state, so they persist between command calls.
pub struct BluetoothState {
    pub manager: Mutex<Option<Manager>>,
    pub adapter: Mutex<Option<Adapter>>,
    pub peripherals: Mutex<HashMap<String, Peripheral>>,
    pub write_characteristics: Mutex<HashMap<String, Characteristic>>,
}

impl Default for BluetoothState {
    fn default() -> Self {
        Self {
            manager: Mutex::new(None),
            adapter: Mutex::new(None),
            peripherals: Mutex::new(HashMap::new()),
            write_characteristics: Mutex::new(HashMap::new()),
        }
    }
}

/// Returns the shared Bluetooth adapter, creating the Manager/Adapter the
/// first time this is called and reusing them on every call after that.
pub async fn get_adapter(state: &BluetoothState) -> Result<Adapter, String> {
    let mut manager_guard = state.manager.lock().await;
    if manager_guard.is_none() {
        let manager = Manager::new().await.map_err(|e| e.to_string())?;
        *manager_guard = Some(manager);
    }
    let manager = manager_guard.as_ref().expect("manager was just initialized");

    let mut adapter_guard = state.adapter.lock().await;
    if adapter_guard.is_none() {
        let adapters = manager.adapters().await.map_err(|e| e.to_string())?;
        let adapter = adapters
            .into_iter()
            .next()
            .ok_or("No Bluetooth adapter found")?;
        *adapter_guard = Some(adapter);
    }

    Ok(adapter_guard
        .as_ref()
        .expect("adapter was just initialized")
        .clone())
}
