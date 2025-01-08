// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use nucleo::{
    pattern::{CaseMatching, Normalization, Pattern},
    Config, Matcher,
};

#[tauri::command]
fn match_array(pattern: String, paths: Vec<String>) -> Vec<String> {
    if paths.is_empty() {
        return vec![];
    }

    let mut matcher = Matcher::new(Config::DEFAULT);
    let matches = Pattern::parse(&pattern, CaseMatching::Ignore, Normalization::Smart)
        .match_list(paths, &mut matcher);

    matches
        .into_iter()
        .map(|(matched_text, _score)| matched_text)
        .collect()
}

#[tokio::main]
async fn main() {
    // let (client, stream_future) = ChatClient::new("ws://localhost:5225".to_string()).await.unwrap();
    // let stream = stream_future.await;
    // tauri::async_runtime::set(tokio::runtime::Handle::current());
    tauri::Builder::default()
        // This is where you pass in your commands
        .invoke_handler(tauri::generate_handler![match_array])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
