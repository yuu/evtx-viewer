// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod event;

use evtx::EvtxParser;
use tauri::api::dialog::FileDialogBuilder;
use tauri::Window;

#[tauri::command]
fn open_file_dialog(window: Window) {
    FileDialogBuilder::new()
        .add_filter("evtx", &[&"evtx"])
        .set_title("ファイルを選択してください")
        .pick_file(move |file_path| match file_path {
            Some(file) => {
                let mut parser = EvtxParser::from_path(file).unwrap();
                let mut events: Vec<event::Root> = Vec::new();

                for record in parser.records_json() {
                    if let Ok(r) = record {
                        match serde_json::from_str::<event::Root>(&r.data) {
                            Ok(event) => {
                                events.push(event);
                            }
                            Err(err) => {
                                eprintln!("err: {:?}", err);
                            }
                        }
                    }
                }

                window
                    .emit("evtx-data", &events)
                    .expect("failed to emit event");
            }
            _ => {}
        })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_file_dialog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
