use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalProfile {
    #[serde(rename = "profileId")]
    pub profile_id: u64,
    #[serde(rename = "displayName")]
    pub display_name: String,
    #[serde(rename = "fullName")]
    pub full_name: String,
    #[serde(rename = "localAlias")]
    pub local_alias: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "userId")]
    pub user_id: u64,

    #[serde(rename = "agentUserId")]
    pub agent_user_id: String,

    #[serde(rename = "userContactId")]
    pub user_contact_id: u64,

    #[serde(rename = "localDisplayName")]
    pub local_display_name: String,

    pub profile: LocalProfile,

    #[serde(rename = "fullPreferences")]
    pub full_preferences: SimplePreferences,

    #[serde(rename = "activeUser")]
    pub active_user: bool,

    #[serde(
        rename = "activeOrder",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub active_order: Option<i32>,

    #[serde(rename = "showNtfs")]
    pub show_ntfs: bool,

    #[serde(rename = "sendRcptsContacts")]
    pub send_rcpts_contacts: bool,

    #[serde(rename = "sendRcptsSmallGroups")]
    pub send_rcpts_small_groups: bool,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub view_pwd_hash: Option<String>,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize)]
pub struct ServerResponse {
    #[serde(rename = "corrId")]
    pub corr_id: Option<String>,
    pub resp: ChatResponse,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ChatResponse {
    #[serde(rename = "activeUser")]
    ActiveUser { user: User },

    FullUserResponse {
        user: User,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        active_order: Option<i32>,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        full_preferences: Option<FullPreferences>,
    },

    #[serde(rename = "userContactLink", rename_all = "camelCase")]
    UserContactLink {
        contact_link: AddressPayload,
        user: User,
    },

    #[serde(rename = "chatCmdError", rename_all = "camelCase")]
    ChatCmdError {
        chat_error: ChatError,
        #[serde(rename = "user_")]
        user: Option<User>,
    },

    #[serde(rename = "userContactSubSummary", rename_all = "camelCase")]
    UserContactSubSummary {
        user: User,
        user_contact_subscriptions: Vec<ContactSubscriptions>,
    },
    #[serde(rename = "contactSubSummary", rename_all = "camelCase")]
    ContactSubSummary {
        user: User,
        contact_subscriptions: Vec<ContactSubscriptions>,
    },

    #[serde(rename = "memberSubSummary", rename_all = "camelCase")]
    MemberSubSummary {
        user: User,
        member_subscriptions: Vec<MemberSubStatus>,
    },

    #[serde(rename = "pendingSubSummary", rename_all = "camelCase")]
    PendingSubSummary {
        user: User,
        pending_subscriptions: Vec<PendingSubStatus>,
    },

    #[serde(rename = "userContactLinkCreated", rename_all = "camelCase")]
    UserContactLinkCreated {
        user: User,

        #[serde(rename = "connReqContact")]
        connection_request_contact: String,
    },

    #[serde(rename = "userContactLinkUpdated", rename_all = "camelCase")]
    UserContactLinkUpdated {
        user: User,
        contact_link: ContactLink,
    },

    #[serde(rename = "receivedContactRequest", rename_all = "camelCase")]
    ReceivedContactRequest {
        user: User,
        contact_request: UserContactRequest,
    },

    #[serde(rename = "acceptingContactRequest", rename_all = "camelCase")]
    AcceptingContactRequest { user: User, contact: Contact },

    #[serde(rename = "contactSndReady", rename_all = "camelCase")]
    ContactSndReady { user: User, contact: Contact },

    #[serde(rename = "contactConnected", rename_all = "camelCase")]
    ContactConnected { user: User, contact: Contact },

    #[serde(rename = "newChatItems", rename_all = "camelCase")]
    NewChatItems {
        user: User,
        chat_items: Vec<AChatItem>,
    },

    #[default]
    UnknownMessage,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct ContactSubscriptions {}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct PendingSubStatus {}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct MemberSubStatus {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupMember {
    group_member_id: u64,
    member_id: String,
    member_role: GroupMemberRole,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum GroupMemberRole {
    #[serde(rename = "member")]
    Member,
    #[serde(rename = "admin")]
    Admin,
    #[serde(rename = "owner")]
    Owner,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FullPreferences {
    pub timed_messages: PreferenceSettings,
    pub full_delete: PreferenceSettings,
    pub voice: PreferenceSettings,
    pub calls: PreferenceSettings,
    pub reactions: PreferenceSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimplePreferences {
    pub timed_messages: Preference,
    pub full_delete: Preference,
    pub voice: Preference,
    pub calls: Preference,
    pub reactions: Preference,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimedMessages {
    pub enabled: EnabledSettings,
    pub user_preference: UserPreference,
    #[serde(rename = "contactPreference")]
    pub contact_preference: Preference,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPreference {
    #[serde(rename = "type")]
    pub preference_type: String,
    pub preference: Preference,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnabledSettings {
    pub for_user: bool,
    pub for_contact: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FullDelete {
    pub allow: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reactions {
    pub allow: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Voice {
    pub allow: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Calls {
    pub allow: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Preference {
    pub allow: AllowPreference,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AllowPreference {
    Yes,
    No,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PreferenceSettings {
    pub enabled: EnabledSettings,
    pub user_preference: UserPreference,
    pub contact_preference: Preference,
}

impl ChatResponse {
    pub fn as_user(&self) -> Option<&User> {
        match self {
            ChatResponse::FullUserResponse { user, .. } => Some(user),
            _ => None,
        }
    }

    pub fn as_active_user(&self) -> Option<&User> {
        match self {
            ChatResponse::ActiveUser { user, .. } => Some(user),
            _ => None,
        }
    }

    pub fn as_user_contact_link(&self) -> Option<String> {
        match self {
            ChatResponse::UserContactLink { contact_link, .. } => {
                Some(contact_link.connection_request_contact.clone())
            }
            _ => None,
        }
    }

    pub fn as_create_address(&self) -> Option<String> {
        match self {
            ChatResponse::UserContactLinkCreated {
                connection_request_contact,
                ..
            } => Some(connection_request_contact.clone()),
            _ => None,
        }
    }

    pub fn as_contact_link_created(&self) -> Option<String> {
        match self {
            ChatResponse::UserContactLinkCreated {
                connection_request_contact,
                ..
            } => Some(connection_request_contact.clone()),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AddressPayload {
    #[serde(rename = "connReqContact")]
    connection_request_contact: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatError {
    #[serde(rename = "type")]
    pub error_type: String,
    pub store_error: Option<StoreErrorType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatErrorChat {
    pub error_type: ChatErrorType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatErrorAgent {
    pub agent_error: AgentErrorType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatErrorStore {
    pub store_error: StoreErrorType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChatErrorType {
    CENoActiveUser(CENoActiveUser),
    CEActiveUserExists(CEActiveUserExists),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CENoActiveUser;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CEActiveUserExists;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentErrorType {
    pub error_type: String,
    pub additional_info: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoreErrorType {
    #[serde(rename = "type")]
    pub error_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserContactRequest {
    pub contact_request_id: u64,
    pub local_display_name: String,
    pub profile: LocalProfile,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContactLink {
    auto_accept: AutoAccept,

    #[serde(rename = "connReqContact")]
    connection_request_contact: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AutoAccept {
    accept_incognito: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Contact {
    pub contact_id: u64,
    pub local_display_name: String,
    pub profile: LocalProfile,
    pub active_conn: Connection,
    pub contact_used: bool,
    pub contact_status: String,
    pub chat_settings: ChatSettings,
    pub user_preferences: UserPreferences,
    pub merged_preferences: FullPreferences,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub contact_grp_inv_sent: bool,
    pub chat_deleted: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPreferences {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatSettings {
    pub enable_ntfs: String,
    pub favorite: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Connection {
    pub conn_id: u64,
}

// Chat Messages
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AChatItem {
    pub chat_info: ChatInfo,
    pub chat_item: ChatItem,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatItem {
    pub chat_dir: CIDirection,
    pub meta: CIMeta,
    pub content: CIContent,
    pub formatted_text: Option<Vec<FormattedText>>,
    pub quoted_item: Option<CIQuote>,
    pub reactions: Vec<serde_json::Value>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ChatInfo {
    #[serde(rename = "direct")]
    Direct(CInfoDirect),

    #[serde(rename = "group")]
    Group(CInfoGroup),

    #[serde(rename = "contact")]
    ContactRequest(CInfoContactRequest),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CInfoDirect {
    pub contact: Contact,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CInfoGroup {
    pub group_info: GroupInfo,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CInfoContactRequest {
    pub contact_request: UserContactRequest,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ChatInfoType {
    Direct,
    Group,
    ContactRequest,
}

impl ChatInfoType {
    pub fn value(&self) -> &'static str {
        match self {
            ChatInfoType::Direct => "@",
            ChatInfoType::Group => "#",
            ChatInfoType::ContactRequest => "<@",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIDirection {
    #[serde(rename = "type")]
    pub direction_type: DirectionType,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DirectionType {
    DirectSnd,
    DirectRcv,
    GroupSnd,
    GroupRcv,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum CIContent {
    #[serde(rename = "sndMsgContent")]
    SndMsgContent(CISndMsgContent),

    #[serde(rename = "rcvMsgContent")]
    RcvMsgContent(CIRcvMsgContent),

    #[serde(rename = "sndDeleted")]
    SndDeleted(CISndDeleted),

    #[serde(rename = "rcvDeleted")]
    RcvDeleted(CIRcvDeleted),

    #[serde(rename = "sndFileInvitation")]
    SndFileInvitation(CISndFileInvitation),

    #[serde(rename = "rcvFileInvitation")]
    RcvFileInvitation(CIRcvFileInvitation),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CISndMsgContent {
    pub msg_content: MsgContent,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIRcvMsgContent {
    pub msg_content: MsgContent,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CISndDeleted {
    pub delete_mode: DeleteMode,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIRcvDeleted {
    pub delete_mode: DeleteMode,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CISndFileInvitation {
    pub file_id: u64,
    pub file_path: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIRcvFileInvitation {
    pub rcv_file_transfer: RcvFileTransfer,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedText {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RcvFileTransfer {
    pub file_id: u64,
    pub sender_display_name: String,
    pub chunk_size: usize,
    pub cancelled: bool,
    pub grp_member_id: Option<u64>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIQuote {
    pub chat_dir: Option<CIDirection>,
    pub item_id: Option<u64>,
    pub shared_msg_id: Option<String>,
    pub sent_at: DateTime<Utc>,
    pub content: MsgContent,
    pub formatted_text: Option<Vec<FormattedText>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum DeleteMode {
    Broadcast,
    Internal,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum CIStatus {
    #[serde(rename = "sndNew")]
    SndNew(CISndNew),
    #[serde(rename = "sndSent")]
    SndSent(CISndSent),
    #[serde(rename = "sndErrorAuth")]
    SndErrorAuth(CISndErrorAuth),
    #[serde(rename = "sndError")]
    SndError(CISndError),
    #[serde(rename = "rcvNew")]
    RcvNew(CIRcvNew),
    #[serde(rename = "rcvRead")]
    RcvRead(CIRcvRead),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CISndNew {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CISndSent {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CISndErrorAuth {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CISndError {
    pub agent_error: AgentErrorType,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIRcvNew {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIRcvRead {}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum StatusType {
    SndNew,
    SndSent,
    SndErrorAuth,
    SndError,
    RcvNew,
    RcvRead,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupInfo {
    pub group_id: u64,
    pub local_display_name: String,
    pub group_profile: GroupProfile,
    pub membership: GroupMember,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupProfile {
    pub display_name: String,
    pub full_name: String,
    pub image: Option<String>, // Optional field for base64 image string
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum MsgContent {
    Text(MCText),
    Link(MCLink),
    Image(MCImage),
    File(MCFile),
    Unknown(MCUnknown),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCText {
    pub text: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCLink {
    pub text: String,
    pub preview: LinkPreview,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCImage {
    pub image: String, // Base64-encoded image string
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCFile {
    pub text: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MCUnknown {
    #[serde(rename = "type")]
    pub unknown_type: String,
    pub text: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkPreview {
    pub uri: String,
    pub title: String,
    pub description: String,
    pub image: String,
}

pub type ChatItemId = u64;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CIMeta {
    pub item_id: ChatItemId,
    pub item_ts: DateTime<Utc>,
    pub item_text: String,
    pub item_status: CIStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub item_shared_msg_id: String,
    pub item_deleted: Option<bool>,
    pub item_edited: bool,
    pub editable: bool,
    pub deletable: bool,
}
