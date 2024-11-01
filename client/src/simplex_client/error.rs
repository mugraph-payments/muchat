use std::fmt;

use serde::{Deserialize, Serialize};
use tokio_tungstenite::tungstenite::Error as TungsteniteError;
use serde_json::Error as SerdeJsonError;

#[derive(Debug, Serialize, Deserialize)]
pub enum ChatError {
  Error(String)
}

#[derive(Debug)]
pub enum TransportError {
    ConnectionClosed,
    Timeout,
    WebSocket(String),
    InvalidFormat(String),
    GenericError
}

impl From<TungsteniteError> for TransportError {
  fn from(err: TungsteniteError) -> Self {
      TransportError::WebSocket(err.to_string())
  }
}

impl From<SerdeJsonError> for TransportError {
  fn from(err: SerdeJsonError) -> Self {
      TransportError::InvalidFormat(err.to_string())
  }
}

impl fmt::Display for ChatError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
      match self {
          ChatError::Error(msg) => write!(f, "ChatError: {}", msg),
      }
  }
}

impl std::error::Error for ChatError {}