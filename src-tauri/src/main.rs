// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod event;

use evtx::EvtxParser;
use log::{info, LevelFilter};
use tauri::{AppHandle, Manager, Window};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_log::{RotationStrategy, Target, TargetKind, TimezoneStrategy};

#[tauri::command(rename_all = "snake_case")]
async fn open_file_dialog(app: AppHandle, window: Window) {
    app.dialog()
        .file()
        .add_filter("evtx", &["evtx"])
        .set_title("ファイルを選択してください")
        .pick_file(move |file_path| match file_path {
            Some(file) => {
                let mut parser = EvtxParser::from_path(file.path).unwrap();
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::LogDir { file_name: None }),
                ])
                .timezone_strategy(TimezoneStrategy::UseLocal)
                .rotation_strategy(RotationStrategy::KeepAll)
                .level(LevelFilter::Debug)
                .level_for("evtx", LevelFilter::Warn)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![open_file_dialog])
        .setup(|app| {
            info!("App Start");

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
