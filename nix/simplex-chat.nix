{
  stdenv,
}:
let
  inherit (stdenv) system mkDerivation;
  urlBase = version: "https://github.com/simplex-chat/simplex-chat/releases/download/v6.2.1";

  releasePath = concatStringsSep (
    {
      x86_64-linux = "simplex-chat-ubuntu-22_04-x86-64";
    }
    ."${system}"
  );
in
mkDerivation rec {
  name = "simplex-chat";
  src = releasePath;
  doBuild = false;
}
