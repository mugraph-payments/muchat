use crate::response::{CIContent, MsgContent};

pub fn extract_text_content(content: CIContent) -> Option<String> {
  match content {
    CIContent::SndMsgContent(msg) => extract_text_from_msg_content(msg.msg_content),
    CIContent::RcvMsgContent(msg) => extract_text_from_msg_content(msg.msg_content),
    _ => None,
  }
}

pub fn extract_text_from_msg_content(msg_content: MsgContent) -> Option<String> {
  match msg_content {
    MsgContent::Text(mc_text) => Some(mc_text.text),
    MsgContent::Link(mc_link) => Some(mc_link.text),
    MsgContent::File(mc_file) => Some(mc_file.text),
    MsgContent::Unknown(mc_unknown) => Some(mc_unknown.text),
    MsgContent::Image(_) => None,
  }
}
