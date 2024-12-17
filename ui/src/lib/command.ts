export type ChatCommandMessage = {
  corrId: string | null;
  cmd: string;
};

export type ChatCommand =
  | ShowActiveUser
  | CreateActiveUser
  | ListUsers
  | APISetActiveUser
  | APIHideUser
  | APIUnhideUser
  | APIMuteUser
  | APIUnmuteUser
  | APIDeleteUser
  | StartChat
  | APIStopChat
  | SetTempFolder
  | SetFilesFolder
  | SetIncognito
  | APIExportArchive
  | APIImportArchive
  | APIDeleteStorage
  | APIGetChats
  | APIGetChat
  | APISendMessage
  | APIUpdateChatItem
  | APIDeleteChatItem
  | APIDeleteMemberChatItem
  | APIChatRead
  | APIDeleteChat
  | APIClearChat
  | APIAcceptContact
  | APIRejectContact
  | APIUpdateProfile
  | APISetContactAlias
  | APIParseMarkdown
  | NewGroup
  | APIAddMember
  | APIJoinGroup
  | APIRemoveMember
  | APILeaveGroup
  | APIListMembers
  | APIUpdateGroupProfile
  | APICreateGroupLink
  | APIGroupLinkMemberRole
  | APIDeleteGroupLink
  | APIGetGroupLink
  | APIGetUserProtoServers
  | APISetUserProtoServers
  | APIContactInfo
  | APIGroupMemberInfo
  | APIGetContactCode
  | APIGetGroupMemberCode
  | APIVerifyContact
  | APIVerifyGroupMember
  | APIDeleteContact
  | AddContact
  | Connect
  | ConnectSimplex
  | CreateMyAddress
  | DeleteMyAddress
  | ShowMyAddress
  | SetProfileAddress
  | AddressAutoAccept
  | APICreateMyAddress
  | APIDeleteMyAddress
  | APIShowMyAddress
  | APISetProfileAddress
  | APIAddressAutoAccept
  | ReceiveFile
  | CancelFile
  | FileStatus
  | ListContacts;

// not included commands (they are not needed for Websocket clients, and can still be sent as strings):
// APIActivateChat
// APISuspendChat
// ResubscribeAllConnections
// APIGetChatItems - not implemented
// APISendCallInvitation
// APIRejectCall
// APISendCallOffer
// APISendCallAnswer
// APISendCallExtraInfo
// APIEndCall
// APIGetCallInvitations
// APICallStatus
// APIGetNtfToken
// APIRegisterToken
// APIVerifyToken
// APIDeleteToken
// APIGetNtfMessage
// APIMemberRole -- not implemented
// ListContacts
// ListGroups
// APISetChatItemTTL
// APIGetChatItemTTL
// APISetNetworkConfig
// APIGetNetworkConfig
// APISetChatSettings
// ShowMessages
// LastMessages
// SendMessageBroadcast

type ChatCommandTag =
  | "showActiveUser"
  | "createActiveUser"
  | "listUsers"
  | "apiSetActiveUser"
  | "setActiveUser"
  | "apiHideUser"
  | "apiUnhideUser"
  | "apiMuteUser"
  | "apiUnmuteUser"
  | "apiDeleteUser"
  | "startChat"
  | "apiStopChat"
  | "setTempFolder"
  | "setFilesFolder"
  | "setIncognito"
  | "apiExportArchive"
  | "apiImportArchive"
  | "apiDeleteStorage"
  | "apiGetChats"
  | "apiGetChat"
  | "apiSendMessage"
  | "apiUpdateChatItem"
  | "apiDeleteChatItem"
  | "apiDeleteMemberChatItem"
  | "apiChatRead"
  | "apiDeleteChat"
  | "apiClearChat"
  | "apiAcceptContact"
  | "apiRejectContact"
  | "apiDeleteContact"
  | "apiUpdateProfile"
  | "apiSetContactAlias"
  | "apiParseMarkdown"
  | "newGroup"
  | "apiAddMember"
  | "apiJoinGroup"
  | "apiRemoveMember"
  | "apiLeaveGroup"
  | "apiListMembers"
  | "apiUpdateGroupProfile"
  | "apiCreateGroupLink"
  | "apiGroupLinkMemberRole"
  | "apiDeleteGroupLink"
  | "apiGetGroupLink"
  | "apiGetUserProtoServers"
  | "apiSetUserProtoServers"
  | "apiContactInfo"
  | "apiGroupMemberInfo"
  | "apiGetContactCode"
  | "apiGetGroupMemberCode"
  | "apiVerifyContact"
  | "apiVerifyGroupMember"
  | "addContact"
  | "connect"
  | "connectSimplex"
  | "createMyAddress"
  | "deleteMyAddress"
  | "showMyAddress"
  | "setProfileAddress"
  | "addressAutoAccept"
  | "apiCreateMyAddress"
  | "apiDeleteMyAddress"
  | "apiShowMyAddress"
  | "apiSetProfileAddress"
  | "apiAddressAutoAccept"
  | "receiveFile"
  | "cancelFile"
  | "fileStatus"
  | "listContacts";

interface IChatCommand {
  type: ChatCommandTag;
}

export interface ListContacts extends IChatCommand {
  type: "listContacts";
  userId: string;
}

export interface ShowActiveUser extends IChatCommand {
  type: "showActiveUser";
}

export interface CreateActiveUser extends IChatCommand {
  type: "createActiveUser";
  profile?: Profile;
  sameServers: boolean;
  pastTimestamp: boolean;
}

export interface ListUsers extends IChatCommand {
  type: "listUsers";
}

export interface APISetActiveUser extends IChatCommand {
  type: "apiSetActiveUser";
  userId: number;
  viewPwd?: string;
}

export interface APIHideUser extends IChatCommand {
  type: "apiHideUser";
  userId: number;
  viewPwd: string;
}

export interface APIUnhideUser extends IChatCommand {
  type: "apiUnhideUser";
  userId: number;
  viewPwd: string;
}

export interface APIMuteUser extends IChatCommand {
  type: "apiMuteUser";
  userId: number;
}

export interface APIUnmuteUser extends IChatCommand {
  type: "apiUnmuteUser";
  userId: number;
}

export interface APIDeleteUser extends IChatCommand {
  type: "apiDeleteUser";
  userId: number;
  delSMPQueues: boolean;
  viewPwd?: string;
}

export interface StartChat extends IChatCommand {
  type: "startChat";
  subscribeConnections?: boolean;
  enableExpireChatItems?: boolean;
  startXFTPWorkers?: boolean;
}

export interface APIStopChat extends IChatCommand {
  type: "apiStopChat";
}

export interface SetTempFolder extends IChatCommand {
  type: "setTempFolder";
  tempFolder: string;
}

export interface SetFilesFolder extends IChatCommand {
  type: "setFilesFolder";
  filePath: string;
}

export interface SetIncognito extends IChatCommand {
  type: "setIncognito";
  incognito: boolean;
}

export interface APIExportArchive extends IChatCommand {
  type: "apiExportArchive";
  config: ArchiveConfig;
}

export interface APIImportArchive extends IChatCommand {
  type: "apiImportArchive";
  config: ArchiveConfig;
}

export interface APIDeleteStorage extends IChatCommand {
  type: "apiDeleteStorage";
}

export interface APIGetChats extends IChatCommand {
  type: "apiGetChats";
  userId: number;
  pendingConnections?: boolean;
}

export interface APIGetChat extends IChatCommand {
  type: "apiGetChat";
  chatType: ChatType;
  chatId: number;
  pagination: ChatPagination;
  search?: string;
}

export interface APISendMessage extends IChatCommand {
  type: "apiSendMessage";
  chatType: ChatType;
  chatId: number;
  messages: ComposedMessage[];
}

export interface ComposedMessage {
  filePath?: string;
  quotedItemId?: ChatItemId;
  msgContent: MsgContent;
}

export interface APIUpdateChatItem extends IChatCommand {
  type: "apiUpdateChatItem";
  chatType: ChatType;
  chatId: number;
  chatItemId: ChatItemId;
  msgContent: MsgContent;
}

export interface APIDeleteChatItem extends IChatCommand {
  type: "apiDeleteChatItem";
  chatType: ChatType;
  chatId: number;
  chatItemId: ChatItemId;
  deleteMode: DeleteMode;
}

export interface APIDeleteMemberChatItem extends IChatCommand {
  type: "apiDeleteMemberChatItem";
  groupId: number;
  groupMemberId: number;
  itemId: number;
}

export interface APIChatRead extends IChatCommand {
  type: "apiChatRead";
  chatType: ChatType;
  chatId: number;
  itemRange?: ItemRange;
}

export interface ItemRange {
  fromItem: ChatItemId;
  toItem: ChatItemId;
}

export interface APIDeleteChat extends IChatCommand {
  type: "apiDeleteChat";
  chatType: ChatType;
  chatId: number;
}

export interface APIClearChat extends IChatCommand {
  type: "apiClearChat";
  chatType: ChatType;
  chatId: number;
}

export interface APIAcceptContact extends IChatCommand {
  type: "apiAcceptContact";
  contactReqId: number;
}

export interface APIRejectContact extends IChatCommand {
  type: "apiRejectContact";
  contactReqId: number;
}

export interface APIDeleteContact extends IChatCommand {
  type: "apiDeleteContact";
  contactId: number;
}

export interface APIUpdateProfile extends IChatCommand {
  type: "apiUpdateProfile";
  userId: number;
  profile: Profile;
}

export interface APISetContactAlias extends IChatCommand {
  type: "apiSetContactAlias";
  contactId: number;
  localAlias: string;
}

export interface APIParseMarkdown extends IChatCommand {
  type: "apiParseMarkdown";
  text: string;
}

export interface NewGroup extends IChatCommand {
  type: "newGroup";
  groupProfile: GroupProfile;
}

export interface APIAddMember extends IChatCommand {
  type: "apiAddMember";
  groupId: number;
  contactId: number;
  memberRole: GroupMemberRole;
}

export interface APIJoinGroup extends IChatCommand {
  type: "apiJoinGroup";
  groupId: number;
}

export interface APIRemoveMember extends IChatCommand {
  type: "apiRemoveMember";
  groupId: number;
  memberId: number;
}

export interface APILeaveGroup extends IChatCommand {
  type: "apiLeaveGroup";
  groupId: number;
}

export interface APIListMembers extends IChatCommand {
  type: "apiListMembers";
  groupId: number;
}

export interface APIUpdateGroupProfile extends IChatCommand {
  type: "apiUpdateGroupProfile";
  groupId: number;
  groupProfile: GroupProfile;
}

export interface APICreateGroupLink extends IChatCommand {
  type: "apiCreateGroupLink";
  groupId: number;
  memberRole: GroupMemberRole;
}

export interface APIGroupLinkMemberRole extends IChatCommand {
  type: "apiGroupLinkMemberRole";
  groupId: number;
  memberRole: GroupMemberRole;
}

export interface APIDeleteGroupLink extends IChatCommand {
  type: "apiDeleteGroupLink";
  groupId: number;
}

export interface APIGetGroupLink extends IChatCommand {
  type: "apiGetGroupLink";
  groupId: number;
}

export interface APIGetUserProtoServers extends IChatCommand {
  type: "apiGetUserProtoServers";
  userId: number;
  serverProtocol: ServerProtocol;
}

export interface APISetUserProtoServers extends IChatCommand {
  type: "apiSetUserProtoServers";
  userId: number;
  serverProtocol: ServerProtocol;
  servers: ServerCfg[];
}

export interface ServerCfg {
  server: string;
  preset: boolean;
  tested?: boolean;
  enabled: boolean;
}

export enum ServerProtocol {
  SMP = "smp",
  XFTP = "xftp",
}

export interface APIContactInfo extends IChatCommand {
  type: "apiContactInfo";
  contactId: number;
}

export interface APIGroupMemberInfo extends IChatCommand {
  type: "apiGroupMemberInfo";
  groupId: number;
  memberId: number;
}

export interface APIGetContactCode extends IChatCommand {
  type: "apiGetContactCode";
  contactId: number;
}

export interface APIGetGroupMemberCode extends IChatCommand {
  type: "apiGetGroupMemberCode";
  groupId: number;
  groupMemberId: number;
}

export interface APIVerifyContact extends IChatCommand {
  type: "apiVerifyContact";
  contactId: number;
  connectionCode: string;
}

export interface APIVerifyGroupMember extends IChatCommand {
  type: "apiVerifyGroupMember";
  groupId: number;
  groupMemberId: number;
  connectionCode: string;
}

export interface AddContact extends IChatCommand {
  type: "addContact";
}

export interface Connect extends IChatCommand {
  type: "connect";
  connReq: string;
}

export interface ConnectSimplex extends IChatCommand {
  type: "connectSimplex";
}

export interface CreateMyAddress extends IChatCommand {
  type: "createMyAddress";
}

export interface DeleteMyAddress extends IChatCommand {
  type: "deleteMyAddress";
}

export interface ShowMyAddress extends IChatCommand {
  type: "showMyAddress";
}

export interface SetProfileAddress extends IChatCommand {
  type: "setProfileAddress";
  includeInProfile: boolean;
}

export interface AddressAutoAccept extends IChatCommand {
  type: "addressAutoAccept";
  autoAccept?: AutoAccept;
}

export interface APICreateMyAddress extends IChatCommand {
  type: "apiCreateMyAddress";
  userId: number;
}

export interface APIDeleteMyAddress extends IChatCommand {
  type: "apiDeleteMyAddress";
  userId: number;
}

export interface APIShowMyAddress extends IChatCommand {
  type: "apiShowMyAddress";
  userId: number;
}

export interface APISetProfileAddress extends IChatCommand {
  type: "apiSetProfileAddress";
  userId: number;
  includeInProfile: boolean;
}

export interface APIAddressAutoAccept extends IChatCommand {
  type: "apiAddressAutoAccept";
  userId: number;
  autoAccept?: AutoAccept;
}

export interface AutoAccept {
  acceptIncognito: boolean;
  autoReply?: MsgContent;
}

export interface ReceiveFile extends IChatCommand {
  type: "receiveFile";
  fileId: number;
  filePath?: string;
}

export interface CancelFile extends IChatCommand {
  type: "cancelFile";
  fileId: number;
}

export interface FileStatus extends IChatCommand {
  type: "fileStatus";
  fileId: number;
}

interface NewUser {
  profile?: Profile;
  sameServers: boolean;
  pastTimestamp: boolean;
}

export interface Profile {
  displayName: string;
  fullName: string; // can be empty string
  image?: string;
  contactLink?: string;
  // preferences?: Preferences
}

export interface LocalProfile {
  profileId: number;
  displayName: string;
  fullName: string;
  image?: string;
  contactLink?: string;
  // preferences?: Preferences
  localAlias: string;
}

export enum ChatType {
  Direct = "@",
  Group = "#",
  ContactRequest = "<@",
}

export type ChatPagination =
  | { count: number } // count from the last item in case neither after nor before specified
  | { count: number; after: ChatItemId }
  | { count: number; before: ChatItemId };

export type ChatItemId = number;

type MsgContentTag = "text" | "link" | "image" | "file";

export type MsgContent = MCText | MCLink | MCImage | MCFile | MCUnknown;

interface MC {
  type: MsgContentTag;
  text: string;
}

interface MCText extends MC {
  type: "text";
  text: string;
}

interface MCLink extends MC {
  type: "link";
  text: string;
  preview: LinkPreview;
}

interface MCImage extends MC {
  type: "image";
  image: string; // image preview as base64 encoded data string
}

interface MCFile extends MC {
  type: "file";
  text: string;
}

interface MCUnknown {
  type: string;
  text: string;
}

interface LinkPreview {
  uri: string;
  title: string;
  description: string;
  image: string;
}

export enum DeleteMode {
  Broadcast = "broadcast",
  Internal = "internal",
}

interface ArchiveConfig {
  archivePath: string;
  disableCompression?: boolean;
  parentTempDirectory?: string;
}

export enum GroupMemberRole {
  GRMember = "member",
  GRAdmin = "admin",
  GROwner = "owner",
}

interface GroupProfile {
  displayName: string;
  fullName: string; // can be empty string
  image?: string;
}

export const commands: Record<ChatCommand["type"], string> = {
  showActiveUser: "/u",
  createActiveUser: "/_create user",
  listUsers: "/users",
  apiSetActiveUser: "/_user",
  apiHideUser: "/_hide user",
  apiUnhideUser: "/_unhide user",
  apiMuteUser: "/_mute user",
  apiUnmuteUser: "/_unmute user",
  apiDeleteUser: "/_delete user",
  startChat: "/_start",
  apiStopChat: "/_stop",
  setTempFolder: "/_temp_folder",
  setFilesFolder: "/_files_folder",
  setIncognito: "/incognito",
  apiExportArchive: "/_db export",
  apiImportArchive: "/_db import",
  apiDeleteStorage: "/_db delete",
  apiGetChats: "/_get chats",
  apiGetChat: "/_get chat",
  apiSendMessage: "/_send",
  apiUpdateChatItem: "/_update item",
  apiDeleteChatItem: "/_delete item",
  apiDeleteMemberChatItem: "/_delete member item",
  apiChatRead: "/_read chat",
  apiDeleteChat: "/_delete",
  apiClearChat: "/_clear chat",
  apiAcceptContact: "/_accept",
  apiRejectContact: "/_reject",
  apiUpdateProfile: "/_profile",
  apiSetContactAlias: "/_set alias",
  apiParseMarkdown: "/_parse",
  newGroup: "/_group",
  apiAddMember: "/_add",
  apiJoinGroup: "/_join",
  apiRemoveMember: "/_remove",
  apiLeaveGroup: "/_leave",
  apiListMembers: "/_members",
  apiUpdateGroupProfile: "/_group_profile",
  apiCreateGroupLink: "/_create link",
  apiGroupLinkMemberRole: "/_set link role",
  apiDeleteGroupLink: "/_delete link",
  apiGetGroupLink: "/_get link",
  apiGetUserProtoServers: "/_servers",
  apiSetUserProtoServers: "/_servers",
  apiContactInfo: "/_info",
  apiGroupMemberInfo: "/_info",
  apiGetContactCode: "/_get code",
  apiGetGroupMemberCode: "/_get code",
  apiVerifyContact: "/_verify code",
  apiVerifyGroupMember: "/_verify code",
  apiDeleteContact: "/_delete",
  addContact: "/connect",
  connect: "/connect",
  connectSimplex: "/simplex",
  createMyAddress: "/address",
  deleteMyAddress: "/delete_address",
  showMyAddress: "/show_address",
  setProfileAddress: "/profile_address",
  addressAutoAccept: "/auto_accept",
  apiCreateMyAddress: "/_address",
  apiDeleteMyAddress: "/_delete_address",
  apiShowMyAddress: "/_show_address",
  apiSetProfileAddress: "/_profile_address",
  apiAddressAutoAccept: "/_auto_accept",
  receiveFile: "/freceive",
  cancelFile: "/fcancel",
  fileStatus: "/fstatus",
  listContacts: "/contacts",
};

export function cmdString(cmd: ChatCommand): string {
  const baseCommand = commands[cmd.type];

  switch (cmd.type) {
    case "showActiveUser":
      return baseCommand;
    case "createActiveUser": {
      const user: NewUser = {
        profile: cmd.profile,
        sameServers: cmd.sameServers,
        pastTimestamp: cmd.pastTimestamp,
      };
      return `${baseCommand} ${JSON.stringify(user)}`;
    }
    case "listUsers":
      return baseCommand;
    case "apiSetActiveUser":
      return `${baseCommand} ${cmd.userId} ${maybeJSON(cmd.viewPwd)}`;
    case "apiHideUser":
      return `${baseCommand} ${cmd.userId} ${JSON.stringify(cmd.viewPwd)}`;
    case "apiUnhideUser":
      return `${baseCommand} ${cmd.userId} ${JSON.stringify(cmd.viewPwd)}`;
    case "apiMuteUser":
      return `${baseCommand} ${cmd.userId}`;
    case "apiUnmuteUser":
      return `${baseCommand} ${cmd.userId}`;
    case "apiDeleteUser":
      return `${baseCommand} ${cmd.userId} del_smp=${onOff(cmd.delSMPQueues)}${maybeJSON(cmd.viewPwd)}`;
    case "startChat":
      return `${baseCommand} subscribe=${cmd.subscribeConnections ? "on" : "off"} expire=${cmd.enableExpireChatItems ? "on" : "off"}`;
    case "apiStopChat":
      return baseCommand;
    case "setTempFolder":
      return `${baseCommand} ${cmd.tempFolder}`;
    case "setFilesFolder":
      return `${baseCommand} ${cmd.filePath}`;
    case "setIncognito":
      return `${baseCommand} ${onOff(cmd.incognito)}`;
    case "apiExportArchive":
      return `${baseCommand} ${JSON.stringify(cmd.config)}`;
    case "apiImportArchive":
      return `${baseCommand} ${JSON.stringify(cmd.config)}`;
    case "apiDeleteStorage":
      return "${baseCommand} delete";
    case "apiGetChats":
      return `${baseCommand} ${cmd.userId}`; /*pcc=${onOff(cmd.pendingConnections)}*/
    case "apiGetChat":
      return `${baseCommand} ${cmd.chatType}${cmd.chatId}${paginationStr(cmd.pagination)}`;
    case "apiSendMessage":
      return `${baseCommand} ${cmd.chatType}${cmd.chatId} json ${JSON.stringify(cmd.messages)}`;
    case "apiUpdateChatItem":
      return `${baseCommand} ${cmd.chatType}${cmd.chatId} ${cmd.chatItemId} json ${JSON.stringify(cmd.msgContent)}`;
    case "apiDeleteChatItem":
      return `${baseCommand} ${cmd.chatType}${cmd.chatId} ${cmd.chatItemId} ${cmd.deleteMode}`;
    case "apiDeleteMemberChatItem":
      return `${baseCommand} #${cmd.groupId} ${cmd.groupMemberId} ${cmd.itemId}`;
    case "apiChatRead": {
      const itemRange = cmd.itemRange
        ? ` from=${cmd.itemRange.fromItem} to=${cmd.itemRange.toItem}`
        : "";
      return `${baseCommand} ${cmd.chatType}${cmd.chatId}${itemRange}`;
    }
    case "apiDeleteChat":
      return `${baseCommand} ${cmd.chatType}${cmd.chatId}`;
    case "apiClearChat":
      return `${baseCommand} ${cmd.chatType}${cmd.chatId}`;
    case "apiAcceptContact":
      return `${baseCommand} ${cmd.contactReqId}`;
    case "apiRejectContact":
      return `${baseCommand} ${cmd.contactReqId}`;
    case "apiUpdateProfile":
      return `${baseCommand} ${cmd.userId} ${JSON.stringify(cmd.profile)}`;
    case "apiSetContactAlias":
      return `${baseCommand} @${cmd.contactId} ${cmd.localAlias.trim()}`;
    case "apiParseMarkdown":
      return `${baseCommand} ${cmd.text}`;
    case "newGroup":
      return `${baseCommand} ${JSON.stringify(cmd.groupProfile)}`;
    case "apiAddMember":
      return `${baseCommand} #${cmd.groupId} ${cmd.contactId} ${cmd.memberRole}`;
    case "apiJoinGroup":
      return `${baseCommand} #${cmd.groupId}`;
    case "apiRemoveMember":
      return `${baseCommand} #${cmd.groupId} ${cmd.memberId}`;
    case "apiLeaveGroup":
      return `${baseCommand} #${cmd.groupId}`;
    case "apiListMembers":
      return `${baseCommand} #${cmd.groupId}`;
    case "apiUpdateGroupProfile":
      return `${baseCommand} #${cmd.groupId} ${JSON.stringify(cmd.groupProfile)}`;
    case "apiCreateGroupLink":
      return `${baseCommand} #${cmd.groupId} ${cmd.memberRole}`;
    case "apiGroupLinkMemberRole":
      return `${baseCommand} #${cmd.groupId} ${cmd.memberRole}`;
    case "apiDeleteGroupLink":
      return `${baseCommand} #${cmd.groupId}`;
    case "apiGetGroupLink":
      return `${baseCommand} #${cmd.groupId}`;
    case "apiGetUserProtoServers":
      return `${baseCommand} ${cmd.userId} ${cmd.serverProtocol}`;
    case "apiSetUserProtoServers":
      return `${baseCommand} ${cmd.userId} ${cmd.serverProtocol} ${JSON.stringify({ servers: cmd.servers })}`;
    case "apiContactInfo":
      return `${baseCommand} @${cmd.contactId}`;
    case "apiGroupMemberInfo":
      return `${baseCommand} #${cmd.groupId} ${cmd.memberId}`;
    case "apiGetContactCode":
      return `${baseCommand} @${cmd.contactId}`;
    case "apiGetGroupMemberCode":
      return `${baseCommand} #${cmd.groupId} ${cmd.groupMemberId}`;
    case "apiVerifyContact":
      return `${baseCommand} @${cmd.contactId}${maybe(cmd.connectionCode)}`;
    case "apiVerifyGroupMember":
      return `${baseCommand} #${cmd.groupId} ${cmd.groupMemberId}${maybe(cmd.connectionCode)}`;
    case "addContact":
      return baseCommand;
    case "apiDeleteContact":
      return `${baseCommand} @${cmd.contactId}`;
    case "connect":
      return `${baseCommand} ${cmd.connReq}`;
    case "connectSimplex":
      return baseCommand;
    case "createMyAddress":
      return baseCommand;
    case "deleteMyAddress":
      return baseCommand;
    case "showMyAddress":
      return baseCommand;
    case "setProfileAddress":
      return `${baseCommand} ${onOff(cmd.includeInProfile)}`;
    case "addressAutoAccept":
      return `${baseCommand} ${autoAcceptStr(cmd.autoAccept)}`;
    case "apiCreateMyAddress":
      return `${baseCommand} ${cmd.userId}`;
    case "apiDeleteMyAddress":
      return `${baseCommand} ${cmd.userId}`;
    case "apiShowMyAddress":
      return `${baseCommand} ${cmd.userId}`;
    case "apiSetProfileAddress":
      return `${baseCommand} ${cmd.userId} ${onOff(cmd.includeInProfile)}`;
    case "apiAddressAutoAccept":
      return `${baseCommand} ${cmd.userId} ${autoAcceptStr(cmd.autoAccept)}`;
    case "receiveFile":
      return `${baseCommand} ${cmd.fileId}${cmd.filePath ? " " + cmd.filePath : ""}`;
    case "cancelFile":
      return `${baseCommand} ${cmd.fileId}`;
    case "fileStatus":
      return `${baseCommand} ${cmd.fileId}`;
    case "listContacts":
      return `${baseCommand}`; /*${cmd.userId}*/
  }
}

function paginationStr(cp: ChatPagination): string {
  const base =
    "after" in cp
      ? ` after=${cp.after}`
      : "before" in cp
        ? ` before=${cp.before}`
        : "";
  return base + ` count=${cp.count}`;
}

function maybe<T>(value: T | undefined): string {
  return value ? ` ${value}` : "";
}

function maybeJSON<T>(value: T | undefined): string {
  return value ? ` json ${JSON.stringify(value)}` : "";
}

function onOff<T>(value: T | undefined): string {
  return value ? "on" : "off";
}

function autoAcceptStr(autoAccept: AutoAccept | undefined): string {
  if (!autoAccept) return "off";
  const msg = autoAccept.autoReply;
  return (
    "on" +
    (autoAccept.acceptIncognito ? " incognito=on" : "") +
    (msg ? " json " + JSON.stringify(msg) : "")
  );
}
