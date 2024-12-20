{
  callPackage,
  makeRustPlatform,
  makeWrapper,
  rust-bin,
  stdenv,
  ...
}:
let
  inherit (builtins) readFile;

  lib = {
    src = ./.;

    rustPlatform = makeRustPlatform {
      rustc = rust;
      cargo = rust;
    };

    baseName = name: baseNameOf (toString name);
    loadTOML = path: fromTOML (readFile path);
  };

  rust = rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;

  packages = {
    inherit rust;

    default = stdenv.mkDerivation {
      name = "muchat";

      nativeBuildInputs = [ makeWrapper ];

      dontBuild = true;
      dontUnpack = true;

      installPhase = with packages; ''
        mkdir -p $out/{share/muchat/bin,bin}

        install -m 0755 ${ui}/bin/muchat-ui $out/bin/.muchat-unwrapped
        makeWrapper $out/bin/.muchat-unwrapped $out/bin/muchat \
          --prefix PATH : ${simplex-chat}/bin
      '';
    };

    frontend = callPackage ./ui { muchat = { inherit lib; }; };
    simplex-chat = callPackage ./nix/simplex-chat.nix { };
    ui = callPackage ./ui/src-tauri { muchat = { inherit lib packages; }; };
  };
in
{
  inherit lib packages;
}
