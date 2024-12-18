{
  fetchurl,
  makeWrapper,
  openssl,
  stdenv,
  steam-run,
  lib,
}:
let
  inherit (lib) optionals;
  inherit (stdenv)
    isDarwin
    isLinux
    mkDerivation
    system
    ;
  urlBase = version: "https://github.com/simplex-chat/simplex-chat/releases/download/v${version}";

  target =
    {
      x86_64-linux = {
        filename = "simplex-chat-ubuntu-22_04-x86-64";
        sha256 = "sha256-0pBndadLyb53iVh+PhKZEfQT+WSnpp34UCMlTJ/Nx/U=";
      };
      aarch64-darwin = {
        filename = "simplex-chat-macos-aarch64";
        sha256 = "sha256-P98P46ZJc75zHUvWWskBNy3OSaqXbjF8thOhHjeT6tE=";
      };
    }
    .${system};

  version = "6.2.1";

  src = fetchurl {
    inherit (target) sha256;

    url = "${urlBase version}/${target.filename}";
  };
in
mkDerivation {
  inherit version src;

  name = "simplex-chat";

  buildInputs = optionals isLinux [ steam-run ] ++ optionals isDarwin [ openssl ];

  nativeBuildInputs = [ makeWrapper ];

  dontUnpack = true;
  dontBuild = true;

  installPhase = ''
    mkdir -p $out/bin
    install -m 0755 ${src} $out/bin/.simplex-chat-unwrapped

    ${
      if isLinux then
        ''
          makeWrapper ${steam-run}/bin/steam-run $out/bin/simplex-chat \
            --add-flags "$out/bin/.simplex-chat-unwrapped"
        ''
      else
        ''
          makeWrapper $out/bin/.simplex-chat-unwrapped $out/bin/simplex-chat \
            --prefix DYLD_LIBRARY_PATH : ${openssl.out}/lib
        ''
    }
  '';
}
