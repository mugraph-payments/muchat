use client::ChatClient;
use commands::ChatCommand;
use error::TransportError;
use response::{ChatInfo, ChatInfoType, ChatResponse, DirectionType};
use std::sync::Arc;

use futures::StreamExt;
use tokio::{
  self,
  signal::{self},
};

pub mod client;
pub mod commands;
pub mod error;
pub mod response;
pub mod utils;

pub async fn process_messages(client: Arc<ChatClient>) {
  let mut response_stream = Box::pin(client.response_stream());

  while let Some(response) = response_stream.next().await {
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
                .send_text::<ChatResponse>(
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
  let client = Arc::new(ChatClient::new().await?);

  let mut response = client
    .send_command::<ChatResponse>(ChatCommand::ShowActiveUser.value().to_string(), None)
    .await?;

  let user = response.as_active_user().unwrap();

  println!(
    "Bot profile: {:?} ({:?})",
    user.profile.display_name, user.profile.full_name
  );

  response = client
    .send_command(ChatCommand::ShowMyAddress.value().to_string(), None)
    .await?;
  let mut address = response.as_user_contact_link();

  if !address.is_some() {
    response = client
      .send_command(ChatCommand::CreateMyAddress.value().to_string(), None)
      .await?;
    address = response.as_contact_link_created();

    println!(
      "🟩 Created new address {:?}",
      address.unwrap_or("undefined".to_string())
    );
  } else {
    println!(
      "🟦 Address {:?}",
      address.unwrap_or("undefined".to_string())
    );
  }

  client
    .send_command::<ChatResponse>(ChatCommand::AddressAutoAccept.value().to_string(), None)
    .await?;

  let client_clone = Arc::clone(&client);
  tokio::spawn(async move {
    process_messages(client_clone).await;
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
    // let client = Arc::new(ChatClient::new().await.unwrap());

    // let response = client
    //   .send_command::<ChatResponse>(ChatCommand::ShowActiveUser.value().to_string(), None)
    //   .await;

    // assert!(
    //   response.is_ok(),
    //   "Command failed with error: {:?}",
    //   response.err()
    // );
  }
}
