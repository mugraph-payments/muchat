fn main() {
    // Directory where `libchatcore.so` is located
    let haskell_lib_dir = "../path/to/haskell/libs";

    println!("cargo:rustc-link-search=native={}", haskell_lib_dir);
    println!("cargo:rustc-link-lib=dylib=chatcore");
    println!("cargo:rerun-if-changed={}/libchatcore.so", haskell_lib_dir);

    // For the Haskell runtime system (RTS) library
    let ghc_version = "9.2.5";
    let hs_rts_lib = format!("HSrts-ghc{}", ghc_version);
    println!("cargo:rustc-link-lib=dylib={}", hs_rts_lib);
}
