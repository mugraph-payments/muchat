use std::{
    ffi::{CStr, CString},
    os::raw::c_uchar,
    ptr,
    sync::Once,
};

use libc::{c_char, c_int};

mod error;
mod external;

pub use error::Error;

static START: Once = Once::new();

pub fn initialize() {
    START.call_once(|| unsafe {
        external::hs_init(ptr::null_mut(), ptr::null_mut());
        external::initChatClient();
    });
}

pub fn send_message(message: &str) -> Result<(), Error> {
    let c_message = CString::new(message)?;

    unsafe {
        external::sendMessage(c_message.as_ptr());
    }

    Ok(())
}

pub fn migrate_init(
    path: &str,
    key: &str,
    confirm: &str,
) -> Result<(*mut c_char, *const c_char), Error> {
    let c_path = CString::new(path)?;
    let c_key = CString::new(key)?;
    let c_confirm = CString::new(confirm)?;
    let mut ctrl: *mut c_char = ptr::null_mut();

    let res = unsafe {
        external::chat_migrate_init(
            c_path.as_ptr(),
            c_key.as_ptr(),
            c_confirm.as_ptr(),
            &mut ctrl,
        )
    };

    Ok((ctrl, res))
}

pub fn migrate_init_key(
    path: &str,
    key: &str,
    keep_key: bool,
    confirm: &str,
    background_mode: bool,
) -> Result<(*mut c_char, *const c_char), Error> {
    let c_path = CString::new(path)?;
    let c_key = CString::new(key)?;
    let c_confirm = CString::new(confirm)?;
    let mut ctrl: *mut c_char = ptr::null_mut();

    let res = unsafe {
        external::chat_migrate_init_key(
            c_path.as_ptr(),
            c_key.as_ptr(),
            keep_key as c_int,
            c_confirm.as_ptr(),
            background_mode as c_int,
            &mut ctrl,
        )
    };

    Ok((ctrl, res))
}

pub fn close_store(ctrl: *mut c_char) -> Result<*const c_char, Error> {
    Ok(unsafe { external::chat_close_store(ctrl) })
}

pub fn reopen_store(ctrl: *mut c_char) -> Result<*const c_char, Error> {
    Ok(unsafe { external::chat_reopen_store(ctrl) })
}

pub fn send_cmd(ctrl: *mut c_char, cmd: &str) -> Result<*const c_char, Error> {
    let c_cmd = CString::new(cmd)?;
    Ok(unsafe { external::chat_send_cmd(ctrl, c_cmd.as_ptr()) })
}

pub fn send_remote_cmd(ctrl: *mut c_char, rh_id: i32, cmd: &str) -> Result<*const c_char, Error> {
    let c_cmd = CString::new(cmd)?;
    Ok(unsafe { external::chat_send_remote_cmd(ctrl, rh_id, c_cmd.as_ptr()) })
}

pub fn recv_msg(ctrl: *mut c_char) -> Result<*const c_char, Error> {
    Ok(unsafe { external::chat_recv_msg(ctrl) })
}

pub fn recv_msg_wait(ctrl: *mut c_char, wait: i32) -> Result<*const c_char, Error> {
    Ok(unsafe { external::chat_recv_msg_wait(ctrl, wait) })
}

pub fn encrypt_media(ctrl: *mut c_char, key: &str, data: &[u8]) -> Result<*const c_char, Error> {
    let c_key = CString::new(key)?;
    let res = unsafe {
        external::chat_encrypt_media(
            ctrl,
            c_key.as_ptr(),
            data.as_ptr() as *const c_uchar,
            data.len() as c_int,
        )
    };
    Ok(res)
}

pub fn decrypt_media(key: &str, data: &[u8]) -> Result<*const c_char, Error> {
    let c_key = CString::new(key)?;
    let res = unsafe {
        external::chat_decrypt_media(
            c_key.as_ptr(),
            data.as_ptr() as *const c_uchar,
            data.len() as c_int,
        )
    };
    Ok(res)
}

pub fn parse_markdown(str: &str) -> Result<*const c_char, Error> {
    let c_str = CString::new(str)?;
    Ok(unsafe { external::chat_parse_markdown(c_str.as_ptr()) })
}

pub fn parse_server(str: &str) -> Result<*const c_char, Error> {
    let c_str = CString::new(str)?;
    Ok(unsafe { external::chat_parse_server(c_str.as_ptr()) })
}

pub fn password_hash(pwd: &str, salt: &str) -> Result<*const c_char, Error> {
    let c_pwd = CString::new(pwd)?;
    let c_salt = CString::new(salt)?;
    Ok(unsafe { external::chat_password_hash(c_pwd.as_ptr(), c_salt.as_ptr()) })
}

pub fn valid_name(name: &str) -> Result<*const c_char, Error> {
    let c_name = CString::new(name)?;
    Ok(unsafe { external::chat_valid_name(c_name.as_ptr()) })
}

pub fn json_length(str: &str) -> Result<i32, Error> {
    let c_str = CString::new(str)?;
    let res = unsafe { external::chat_json_length(c_str.as_ptr()) };
    Ok(res)
}

pub fn write_file(ctrl: *mut c_char, path: &str, data: &[u8]) -> Result<*const c_char, Error> {
    let c_path = CString::new(path)?;
    let res = unsafe {
        external::chat_write_file(
            ctrl,
            c_path.as_ptr(),
            data.as_ptr() as *const c_uchar,
            data.len() as c_int,
        )
    };

    Ok(res)
}

pub fn read_file(path: &str, key: &str, nonce: &str) -> Result<(i32, Vec<u8>), Error> {
    let c_path = CString::new(path)?;
    let c_key = CString::new(key)?;
    let c_nonce = CString::new(nonce)?;

    unsafe {
        let res = external::chat_read_file(c_path.as_ptr(), c_key.as_ptr(), c_nonce.as_ptr())
            as *mut c_uchar;

        if res.is_null() {
            return Err(Error::NullPointer);
        }

        let status = *res as i32;
        let len_bytes: [u8; 4] = std::ptr::read_unaligned(res.offset(1) as *const [u8; 4]);
        let len = u32::from_be_bytes(len_bytes) as usize;

        if status == 0 {
            let mut data = Vec::with_capacity(len);
            std::ptr::copy_nonoverlapping(res.offset(5), data.as_mut_ptr(), len);
            data.set_len(len);

            Ok((status, data))
        } else {
            let error_message = CStr::from_ptr(res.offset(1) as *const c_char)
                .to_str()?
                .to_owned();

            Err(Error::ChatError(error_message))
        }
    }
}

pub fn encrypt_file(
    ctrl: *mut c_char,
    from_path: &str,
    to_path: &str,
) -> Result<*const c_char, Error> {
    let c_from_path = CString::new(from_path)?;
    let c_to_path = CString::new(to_path)?;
    let res =
        unsafe { external::chat_encrypt_file(ctrl, c_from_path.as_ptr(), c_to_path.as_ptr()) };
    Ok(res)
}

pub fn decrypt_file(
    from_path: &str,
    key: &str,
    nonce: &str,
    to_path: &str,
) -> Result<*const c_char, Error> {
    let c_from_path = CString::new(from_path)?;
    let c_key = CString::new(key)?;
    let c_nonce = CString::new(nonce)?;
    let c_to_path = CString::new(to_path)?;

    let res = unsafe {
        external::chat_decrypt_file(
            c_from_path.as_ptr(),
            c_key.as_ptr(),
            c_nonce.as_ptr(),
            c_to_path.as_ptr(),
        )
    };
    Ok(res)
}

pub fn shutdown() {
    unsafe {
        external::hs_exit();
    }
}
