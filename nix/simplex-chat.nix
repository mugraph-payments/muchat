{
  stdenv,
  fetchurl,
  gmp,
  openssl_1_1,
  makeWrapper,
  steam-run,
}:
let
  inherit (stdenv) system mkDerivation;
  urlBase = version: "https://github.com/simplex-chat/simplex-chat/releases/download/v${version}";

  filename =
    {
      x86_64-linux = "simplex-chat-ubuntu-22_04-x86-64";
    }
    .${system};

  version = "6.2.1";

  src = fetchurl {
    url = "${urlBase version}/${filename}";
    sha256 = "sha256-0pBndadLyb53iVh+PhKZEfQT+WSnpp34UCMlTJ/Nx/U=";
  };
in
mkDerivation {
  inherit version src;

  name = "simplex-chat";

  buildInputs = [
    gmp
    openssl_1_1
  ];

  nativeBuildInputs = [
    makeWrapper
  ];

  dontUnpack = true;
  dontBuild = true;

  installPhase = ''
    mkdir -p $out/bin
    install -m 0755 ${src} $out/bin/.simplex-chat-unwrapped
    makeWrapper ${steam-run}/bin/steam-run $out/bin/simplex-chat \
      --add-flags "$out/bin/.simplex-chat-unwrapped"
  '';
}
