use client::ChatClient;
use commands::ChatCommand;
use error::TransportError;
use response::{ChatInfo, ChatInfoType, ChatResponse, DirectionType, ServerResponse};
use std::sync::Arc;

use futures::{pin_mut, Stream, StreamExt};
use tokio::{
  self,
  signal::{self},
};

pub mod client;
pub mod commands;
pub mod error;
pub mod response;
pub mod utils;

pub async fn process_message_stream<S>(client: Arc<ChatClient>, message_stream: S)
where
  S: Stream<Item = ServerResponse> + Unpin,
{
  pin_mut!(message_stream);
  while let Some(response) = message_stream.next().await {
    match response.resp {
      ChatResponse::NewChatItems { chat_items, .. } => {
        for item in chat_items {
          if let ChatInfo::Direct(c_info_direct) = item.chat_info {
            match item.chat_item.chat_dir.direction_type {
              DirectionType::DirectSnd => continue,
              _ => {}
            }

            if let Some(content) = utils::extract_text_content(item.chat_item.content) {
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
            } else {
              println!("🟥 Error extracting message content")
            }
          }
        }
      }
      _ => {}
    }
  }
}

pub async fn squaring_bot() -> Result<(), TransportError> {
  let (client, stream_future) = ChatClient::new().await?;
  let client = Arc::new(client);

  client
    .send_command(ChatCommand::ShowActiveUser.value().to_string(), None)
    .await?;
  client
    .send_command(ChatCommand::AddressAutoAccept.value().to_string(), None)
    .await?;

  let client_clone = Arc::clone(&client);
  let stream = Box::pin(stream_future.await);
  tokio::spawn(async move {
    process_message_stream(client_clone, stream).await;
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
