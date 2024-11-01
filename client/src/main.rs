mod simplex_client;

use std::{sync::Arc, time::Duration};
use simplex_client::SimplexClient;
use simplex_client::commands::ChatCommand;
use simplex_client::error::TransportError;
use simplex_client::queue::QueueError;
use simplex_client::response::{ChatInfo, ChatInfoType, ChatResponse, DirectionType};
use tokio::{
  self,
  signal::{self},
};

pub async fn process_messages(client: Arc<SimplexClient>) {
  let subscriber_lock = client.message_queue.subscribe().await;
  let mut subscriber = subscriber_lock.lock().await;
  while let Some(_) = subscriber.recv().await {
    match client.message_queue.dequeue().await {
      Ok(response) => match response {
        ChatResponse::NewChatItems { chat_items, .. } => {
          for item in chat_items {
            if let ChatInfo::Direct(c_info_direct) = item.chat_info {
              match item.chat_item.chat_dir.direction_type {
                DirectionType::DirectSnd => continue,
                _ => {}
              }

              if let Some(content) = simplex_client::utils::extract_text_content(item.chat_item.content) {
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
      },
      Err(QueueError::QueueEmpty) => {
        tokio::time::sleep(Duration::from_millis(100)).await;
      }
      Err(_) => {
        // TODO: handle other errors here
      }
    }
  }
}

#[tokio::main]
async fn main() -> Result<(), TransportError> {
  let client = Arc::new(SimplexClient::new().await?);

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
