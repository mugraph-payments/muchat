use async_stream::try_stream;
use futures::stream::SplitSink;
use futures::stream::SplitStream;
use futures::Future;
use futures::SinkExt;
use futures::Stream;
use futures::StreamExt;

use std::sync::atomic::AtomicU16;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::sync::mpsc::Sender;
use tokio::sync::mpsc::{self, Receiver};
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};

use super::commands::CommandData;
use super::commands::CommandPayload;
use super::commands::ComposedMessage;
use super::error::TransportError;
use super::response::ChatInfoType;
use super::response::MCText;
use super::response::MsgContent;
use super::response::ServerResponse;

pub struct ChatClient {
  command_sender: Sender<CommandPayload>,
  command_reader: Arc<Mutex<Receiver<CommandPayload>>>,
  corr_id: Arc<AtomicU16>,
}

pub type StreamMessage = Result<ServerResponse, TransportError>;

impl ChatClient {
  pub async fn new(
    url: String,
  ) -> Result<
    (
      Self,
      impl Future<Output = impl Stream<Item = StreamMessage>>,
    ),
    TransportError,
  > {
    let (command_sender, command_reader) = mpsc::channel(100);
    let client = ChatClient {
      command_sender,
      command_reader: Arc::new(Mutex::new(command_reader)),
      corr_id: Arc::new(AtomicU16::new(0)),
    };

    let ws_stream = tokio::time::timeout(Duration::from_secs(15), Self::create_connection(&url))
      .await
      .map_err(|_| TransportError::Timeout)??;
    let (write, read) = ws_stream.split();

    tokio::spawn(Self::write_server_messages(
      Arc::clone(&client.command_reader),
      write,
    ));

    let stream = Self::read_server_messages(read);
    Ok((client, stream))
  }

  async fn create_connection(
    url: &str,
  ) -> Result<WebSocketStream<MaybeTlsStream<TcpStream>>, TransportError> {
    let (ws_stream, _) = connect_async(url)
      .await
      .map_err(|e| TransportError::WebSocket(e.to_string()))?;
    Ok(ws_stream)
  }

  async fn write_server_messages(
    command_reader: Arc<Mutex<Receiver<CommandPayload>>>,
    mut server_writer: SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>,
  ) -> Result<(), TransportError> {
    loop {
      let command_payload = {
        let mut reader = command_reader.lock().await;
        reader.recv().await
      };

      match command_payload {
        Some(command) => {
          let msg = serde_json::to_string(&command)
            .map_err(|e| TransportError::InvalidFormat(e.to_string()))?;
          server_writer
            .send(Message::Text(msg))
            .await
            .map_err(|e| TransportError::WebSocket(e.to_string()))?;
        }
        None => break,
      }
    }
    Ok(())
  }

  async fn read_server_messages(
    mut read: SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>,
  ) -> impl Stream<Item = StreamMessage> {
    try_stream! {
        loop {
          if let Some(Ok(message)) = read.next().await {
            if let Ok(response) = Self::handle_server_message(message).await {
              yield response;
            }
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
      Message::Close(_) => Err(TransportError::ConnectionClosed),
      _ => Err(TransportError::GenericError),
    }
  }

  pub async fn send_command(
    &self,
    command_text: String,
    corr_id: Option<String>,
  ) -> Result<(), TransportError> {
    let corr_id_string = match corr_id {
      Some(id) => Some(id),
      None => Some(self.corr_id.fetch_add(1, Ordering::SeqCst).to_string()),
    };

    let command = CommandPayload {
      corr_id: corr_id_string,
      cmd: command_text,
    };

    self
      .command_sender
      .send(command)
      .await
      .map_err(|e| TransportError::WebSocket(e.to_string()))?;

    Ok(())
  }

  pub async fn send_text(
    &self,
    chat_type: ChatInfoType,
    chat_id: u64,
    text: String,
  ) -> Result<(), TransportError> {
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

    self.send_command(command_string, None).await
  }
}
