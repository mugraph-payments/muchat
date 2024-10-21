use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Invalid input string")]
    InvalidString,
    #[error("Null Pointer Exception")]
    NullPointer,
    #[error("UTF-8 Error: {0}")]
    Utf8Error(std::str::Utf8Error),
    #[error("I/O Error: {0}")]
    IoError(std::io::Error),
    #[error("FFI Error: {0}")]
    ChatError(String),
}

impl From<std::ffi::NulError> for Error {
    fn from(_: std::ffi::NulError) -> Self {
        Error::InvalidString
    }
}

impl From<std::str::Utf8Error> for Error {
    fn from(error: std::str::Utf8Error) -> Self {
        Error::Utf8Error(error)
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Error::IoError(error)
    }
}
