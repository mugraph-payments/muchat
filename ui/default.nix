{
  nodejs,
  pnpm,
  stdenv,
}:
let
  inherit (builtins) fromJSON readFile;
  inherit (stdenv) mkDerivation;

  package-json = fromJSON (readFile ./package.json);
in
mkDerivation (final: {
  inherit (package-json) version;
  pname = package-json.name;

  src = ./.;

  nativeBuildInputs = [
    nodejs
    pnpm.configHook
  ];

  buildPhase = ''
    runHook preBuild

    pnpm build

    runHook postBuild
  '';

  installPhase = ''
    mkdir -p $out
    cp -r dist/* $out/
  '';

  pnpmDeps = pnpm.fetchDeps {
    inherit (final) pname version src;
    hash = "sha256-YIy2dICdyQj+v0lqOZGS95oPKdGmNHUSY4e4WzK/xSw=";
  };
})
