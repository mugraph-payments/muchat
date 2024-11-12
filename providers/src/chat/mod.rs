use client::ChatClient;
use commands::ChatCommand;
use error::TransportError;
use response::{ChatInfo, ChatInfoType, ChatResponse, DirectionType};
use std::sync::Arc;

use futures::{pin_mut, StreamExt};
use tokio::{
    self,
    signal::{self},
};

pub mod client;
pub mod commands;
pub mod error;
pub mod response;
pub mod utils;

pub async fn process_message_stream(client: Arc<ChatClient>) {
    if !client.stream.is_some() {
        return;
    }
    let stream = client.stream.as_ref().unwrap();
    let stream_lock = stream.lock().await;
    pin_mut!(stream_lock);

    while let Some(response) = stream_lock.next().await {
        println!("{:?}", response);
        match response {
            Ok(message) => match message.resp {
                ChatResponse::NewChatItems { chat_items, .. } => {
                    for item in chat_items {
                        if let ChatInfo::Direct(c_info_direct) = item.chat_info {
                            match item.chat_item.chat_dir.direction_type {
                                DirectionType::DirectSnd => continue,
                                _ => {}
                            }

                            if let Some(content) =
                                utils::extract_text_content(item.chat_item.content)
                            {
                                let number: Result<f64, _> = content.parse();
                                let reply = match number {
                                    Ok(n) => format!("{} * {} = {}", n, n, n * n),
                                    Err(_) => "this is not a number".to_string(),
                                };

                                let _ = client
                                    .send_text(
                                        ChatInfoType::Direct,
                                        c_info_direct.contact.contact_id.clone(),
                                        reply,
                                    )
                                    .await;
                            }
                        }
                    }
                }
                _ => {}
            },
            Err(_) => {}
        }
    }
}

pub async fn squaring_bot() -> Result<(), TransportError> {
    let client = ChatClient::new("ws://localhost:5225".to_string()).await?;
    let client = Arc::new(client);

    client
        .send_command(ChatCommand::CreateMyAddress.value().to_string(), None)
        .await?;
    client
        .send_command(ChatCommand::ShowActiveUser.value().to_string(), None)
        .await?;
    client
        .send_command(ChatCommand::AddressAutoAccept.value().to_string(), None)
        .await?;

    let client_clone = Arc::clone(&client);
    tokio::spawn(async move {
        process_message_stream(client_clone).await;
    });

    signal::ctrl_c().await.expect("Failed to listen for Ctrl+C");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_command() {
        let _ = squaring_bot().await;
    }
}
