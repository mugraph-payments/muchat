{
  cairo,
  dbus,
  gdk-pixbuf,
  glib,
  gnused,
  gtk3,
  lib,
  librsvg,
  muchat,
  openssl,
  pkg-config,
  pnpm,
  stdenv,
  webkitgtk,
  webkitgtk_4_1,
}:
let
  inherit (lib) optionals splitString;
  inherit (muchat.lib) loadTOML rustPlatform src;
  inherit (stdenv) isDarwin isLinux;

  cargoTOML = loadTOML ./Cargo.toml;

  toPatch =
    with builtins;
    path: target:
    let
      content = readFile path;
      lines = splitString "\n" content;
      additions = map (line: "+" + line) lines;
      diffBody = concatStringsSep "\n" additions;
      lineCount = length lines;
    in
    toFile "${target}.patch" ''
      diff --git a/${target} b/${target}
      new file mode 100644
      index 0000000..e69de29
      --- /dev/null
      +++ b/${target}
      @@ -0,0 +1,${toString lineCount} @@
      ${diffBody}
    '';

in
rustPlatform.buildRustPackage {
  inherit (cargoTOML.package) name version;

  src = "${src}/ui/src-tauri";
  cargoLock.lockFile = "${src}/Cargo.lock";

  buildInputs =
    [ ]
    ++ optionals isLinux [
      openssl
      webkitgtk
      gtk3
      cairo
      gdk-pixbuf
      glib
      dbus
      librsvg
      webkitgtk_4_1
    ]
    ++ optionals isDarwin [ ];

  nativeBuildInputs = [
    gnused
    pkg-config
  ];

  useNextest = true;

  patches = [ (toPatch "${src}/Cargo.lock" "Cargo.lock") ];

  patchPhase = ''
    sed -i -e "s;../dist;${muchat.packages.frontend};g" tauri.conf.json
  '';
}
