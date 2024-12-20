{
  stdenv,
  pkg-config,
  openssl,
  webkitgtk,
  gtk3,
  cairo,
  gdk-pixbuf,
  glib,
  dbus,
  librsvg,
  webkitgtk_4_1,
  muchat,
  lib,
}:
let
  inherit (muchat) rustPlatform;
  inherit (lib) optionals;
  inherit (stdenv) isDarwin isLinux;

  dependencies =
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
in
rustPlatform.buildRustPackage {
  inherit (muchat) cargoLock src;

  buildInputs = dependencies;
  nativeBuildInputs = [ pkg-config ];

  name = "muchat-ui";
  cargoBuildFlags = [ "-p muchat-ui" ];
  useNextest = true;

  postPatch = ''
    cp -rf ${muchat.packages.frontend} ui/dist
  '';
}
