// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tokio::main]
async fn main() {
    // let (client, stream_future) = ChatClient::new("ws://localhost:5225".to_string()).await.unwrap();
    // let stream = stream_future.await;
    // tauri::async_runtime::set(tokio::runtime::Handle::current());
    app_lib::run();
}
