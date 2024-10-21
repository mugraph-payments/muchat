use libc::{c_char, c_int, c_uchar};

#[link(name = "libsimplex")]
extern "C" {
    pub fn initChatClient();
    pub fn sendMessage(message: *const c_char);
    pub fn chat_migrate_init(
        path: *const c_char,
        key: *const c_char,
        confirm: *const c_char,
        ctrl: *mut *mut c_char,
    ) -> *const c_char;
    pub fn chat_migrate_init_key(
        path: *const c_char,
        key: *const c_char,
        keep_key: c_int,
        confirm: *const c_char,
        background_mode: c_int,
        ctrl: *mut *mut c_char,
    ) -> *const c_char;
    pub fn chat_close_store(ctrl: *mut c_char) -> *const c_char;
    pub fn chat_reopen_store(ctrl: *mut c_char) -> *const c_char;
    pub fn chat_send_cmd(ctrl: *mut c_char, cmd: *const c_char) -> *const c_char;
    pub fn chat_send_remote_cmd(
        ctrl: *mut c_char,
        rhId: c_int,
        cmd: *const c_char,
    ) -> *const c_char;
    pub fn chat_recv_msg(ctrl: *mut c_char) -> *const c_char;
    pub fn chat_recv_msg_wait(ctrl: *mut c_char, wait: c_int) -> *const c_char;
    pub fn chat_parse_markdown(str: *const c_char) -> *const c_char;
    pub fn chat_parse_server(str: *const c_char) -> *const c_char;
    pub fn chat_password_hash(pwd: *const c_char, salt: *const c_char) -> *const c_char;
    pub fn chat_valid_name(name: *const c_char) -> *const c_char;
    pub fn chat_json_length(str: *const c_char) -> c_int;
    pub fn chat_write_file(
        ctrl: *mut c_char,
        path: *const c_char,
        ptr: *const c_uchar,
        length: c_int,
    ) -> *const c_char;
    pub fn chat_read_file(
        path: *const c_char,
        key: *const c_char,
        nonce: *const c_char,
    ) -> *const c_char;
    pub fn chat_encrypt_file(
        ctrl: *mut c_char,
        from_path: *const c_char,
        to_path: *const c_char,
    ) -> *const c_char;
    pub fn chat_decrypt_file(
        from_path: *const c_char,
        key: *const c_char,
        nonce: *const c_char,
        to_path: *const c_char,
    ) -> *const c_char;
    pub fn chat_encrypt_media(
        ctrl: *mut c_char,
        key: *const c_char,
        frame: *const c_uchar,
        len: c_int,
    ) -> *const c_char;
    pub fn chat_decrypt_media(
        key: *const c_char,
        frame: *const c_uchar,
        len: c_int,
    ) -> *const c_char;
}

#[link(name = "HSrts-ghc9.2.5", kind = "dylib")]
extern "C" {
    pub fn hs_init(argc: *mut c_int, argv: *mut *mut *mut c_char);
    pub fn hs_exit();
}
