use serde::{Deserialize, Serialize};

use super::response::MsgContent;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandPayload {
    pub corr_id: Option<String>,
    pub cmd: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChatCommand {
    ShowActiveUser,
    CreateActiveUser,
    ListUsers,
    APISetActiveUser,
    ShowMyAddress,
    CreateMyAddress,

    AddressAutoAccept,
}

impl ChatCommand {
    pub fn value(&self) -> &str {
        match self {
            Self::ShowActiveUser => "/u",
            Self::ShowMyAddress => "/show_address",
            Self::CreateMyAddress => "/address",
            Self::AddressAutoAccept => "/auto_accept on", // TODO: Handle arguments
            _ => "",
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AutoAccept {
    pub accept_incognito: bool,
    pub auto_reply: Option<MsgContent>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkPreview {
    pub uri: String,
    pub title: String,
    pub description: String,
    pub image: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ComposedMessage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub quoted_item_id: Option<u64>,
    pub msg_content: MsgContent,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandData {
    // pub command_type: String,
    pub chat_type: String,
    pub chat_id: u64,
    pub messages: Vec<ComposedMessage>,
}
