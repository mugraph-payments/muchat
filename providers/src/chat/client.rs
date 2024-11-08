use futures::SinkExt;
use futures::StreamExt;
use std::collections::HashMap;
use std::sync::atomic::AtomicU16;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::sync::mpsc::Sender;
use tokio::sync::mpsc::{self, Receiver};
use tokio::sync::oneshot;
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};

use super::commands::CommandData;
use super::commands::CommandPayload;
use super::commands::ComposedMessage;
use super::error::TransportError;
use super::queue::Queue;
use super::response::ChatInfoType;
use super::response::ChatResponse;
use super::response::MCText;
use super::response::MsgContent;
use super::response::ServerResponse;

pub struct ChatClient {
  pub message_queue: Arc<Queue<ChatResponse>>,
  sender: Sender<(CommandPayload, oneshot::Sender<ServerResponse>)>,
  corr_id: Arc<AtomicU16>,
}

type ResponseMap = Arc<Mutex<HashMap<String, oneshot::Sender<ServerResponse>>>>;

impl ChatClient {
  pub async fn new() -> Result<Self, TransportError> {
    let url = "ws://localhost:5225";
    let (sender, reader) = mpsc::channel(100);
    let message_queue = Queue::<ChatResponse>::new(100);

    let client = ChatClient {
      sender,
      message_queue: Arc::new(message_queue),
      corr_id: Arc::new(AtomicU16::new(0)),
    };

    let reader_arc = Arc::new(Mutex::new(reader));
    let response_map: ResponseMap = Arc::new(Mutex::new(HashMap::new()));

    tokio::spawn(Self::connection_handler(
      url.to_string(),
      Arc::clone(&reader_arc),
      Arc::clone(&response_map),
      Arc::clone(&client.message_queue),
    ));

    Ok(client)
  }

  async fn create_connection(
    url: &str,
  ) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, TransportError> {
    let (ws_stream, _) = connect_async(url).await.map_err(|e| {
      println!("🟥 Error creating connection: {:?}", e);
      TransportError::WebSocket(e.to_string())
    })?;
    Ok(ws_stream)
  }

  async fn connection_handler(
    url: String,
    reader: Arc<Mutex<Receiver<(CommandPayload, oneshot::Sender<ServerResponse>)>>>,
    response_map: ResponseMap,
    message_queue: Arc<Queue<ChatResponse>>,
  ) -> Result<(), TransportError> {
    loop {
      let ws_stream = tokio::time::timeout(Duration::from_secs(15), Self::create_connection(&url))
        .await
        .map_err(|_| {
          eprintln!("🟥 Connection attempt timed out");
          TransportError::Timeout
        })??;

      println!("🟩 Connected to WebSocket server");
      let (mut write, mut read) = ws_stream.split();

      // Handle incoming messages
      let read_future = tokio::spawn({
        let response_map = Arc::clone(&response_map);
        let message_queue = Arc::clone(&message_queue);
        async move {
          while let Some(message_result) = read.next().await {
            match message_result {
              Ok(msg) => {
                match Self::handle_server_message(msg).await {
                  Ok(response) => {
                    let mut map = response_map.lock().await;
                    let data = response.resp.clone();
                    if let Some(ref corr_id) = response.corr_id {
                      if let Some(sender) = map.remove(corr_id) {
                        let _ = sender.send(response);
                      }
                    }
                    if let Err(e) = message_queue.enqueue(data).await {
                      eprintln!("🟥 Error queuing {:?}", e);
                    }
                  }
                  // Err(e) => println!("🟥 {:?}:\n {:?}", e, msg_clone,),
                  Err(_) => {}
                }
              }
              Err(e) => {
                eprintln!("Error receiving message: {}", e);
                return Err(TransportError::WebSocket(e.to_string()));
              }
            }
          }
          Ok(())
        }
      });

      // Handle outgoing messages
      let write_future = tokio::spawn({
        let reader_clone = Arc::clone(&reader);
        let response_map = Arc::clone(&response_map);
        async move {
          loop {
            let cmd_option = {
              let mut reader_lock = reader_clone.lock().await;
              reader_lock.recv().await
            };

            match cmd_option {
              Some((cmd, response_sender)) => {
                let msg = serde_json::to_string(&cmd)
                  .map_err(|e| TransportError::InvalidFormat(e.to_string()))?;

                if cmd.corr_id.is_some() {
                  let corr_id = cmd.corr_id.unwrap_or("-1".to_string());
                  let mut map = response_map.lock().await;
                  map.insert(corr_id, response_sender);
                }

                write
                  .send(Message::Text(msg))
                  .await
                  .map_err(|e| TransportError::WebSocket(e.to_string()))?;
              }
              None => break,
            }
          }
          Ok::<_, TransportError>(())
        }
      });

      tokio::select! {
          read_result = read_future => {
              read_result.map_err(|e| TransportError::WebSocket(e.to_string()))??
          }
          write_result = write_future => {
              write_result.map_err(|e| TransportError::WebSocket(e.to_string()))??
          }
      }
    }
  }

  async fn handle_server_message(msg: Message) -> Result<ServerResponse, TransportError> {
    match msg {
      Message::Text(text) => {
        let response: ServerResponse =
          serde_json::from_str(&text).map_err(|e| TransportError::InvalidFormat(e.to_string()))?;
        Ok(response)
      }
      Message::Close(_) => {
        println!("🟥 Message::Close");
        return Err(TransportError::ConnectionClosed);
      }
      _ => Err(TransportError::GenericError),
    }
  }

  pub async fn send_command<T: From<ChatResponse>>(
    &self,
    command_text: String,
    corr_id: Option<String>,
  ) -> Result<T, TransportError> {
    let corr_id_string = match corr_id {
      Some(id) => Some(id),
      None => Some(self.corr_id.fetch_add(1, Ordering::SeqCst).to_string()),
    };

    let command = CommandPayload {
      corr_id: corr_id_string,
      cmd: command_text,
    };

    let (response_sender, response_receiver) = oneshot::channel();
    self
      .sender
      .send((command, response_sender))
      .await
      .map_err(|e| TransportError::WebSocket(e.to_string()))?;
    let server_response: ServerResponse = response_receiver
      .await
      .map_err(|e| TransportError::WebSocket(e.to_string()))?;

    Ok(T::from(server_response.resp))
  }

  pub async fn send_text<T: From<ChatResponse>>(
    &self,
    chat_type: ChatInfoType,
    chat_id: u64,
    text: String,
  ) -> Result<T, TransportError> {
    let message = ComposedMessage {
      file_path: None,
      quoted_item_id: None,
      msg_content: MsgContent::Text(MCText { text }),
    };

    let command_data = CommandData {
      chat_type: chat_type.value().to_string(),
      chat_id,
      messages: vec![message],
    };

    let command_string = format!(
      "/_send @{} json {}",
      command_data.chat_id,
      serde_json::to_string(&command_data.messages).unwrap()
    );

    let response: ChatResponse = self.send_command(command_string, None).await?;

    Ok(response.into())
  }
}

#[cfg(test)]
mod tests {
  // use super::*;
  // #[test]
  // fn parses_new_messages() {
  // let data = include_str!("../fixtures/01-chat.json");
  // let response = serde_json::from_str::<ServerResponse>(&data);
  // println!("{:?}", response.unwrap().resp);
  // assert!(response.is_ok());
  // }
}
