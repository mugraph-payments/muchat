{
  description = "nix flake for simplex-chat";

  inputs = {
    haskell-nix.url = "github:input-output-hk/haskell.nix";
    flake-utils.url = "github:numtide/flake-utils";

    nixpkgs.follows = "haskell-nix/nixpkgs-unstable";

    hackage = {
      url = "github:input-output-hk/hackage.nix";
      flake = false;
    };

    simplex-chat = {
      url = "github:simplex-chat/simplex-chat";
      flake = false;
    };
  };

  outputs =
    {
      haskell-nix,
      flake-utils,
      simplex-chat,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import haskell-nix {
          inherit system;
        };
        inherit (pkgs.haskell-nix) haskellLib project;

        simplex-chat-lib = project {
          compiler-nix-name = "ghc963";
          index-state = "2023-12-12T00:00:00Z";
          projectFileName = "cabal.project";

          src = haskellLib.cleanGit {
            name = "simplex-chat";
            src = simplex-chat;
          };
          sha256map = import "${simplex-chat}/scripts/nix/sha256map.nix";
          modules = [
            # (
            #   { pkgs, lib, ... }:
            #   lib.mkIf (!pkgs.stdenv.hostPlatform.isWindows) {
            #     # This patch adds `dl` as an extra-library to direct-sqlciper, which is needed
            #     # on pretty much all unix platforms, but then blows up on windows
            #     packages.direct-sqlcipher.patches = [ ./scripts/nix/direct-sqlcipher-2.3.27.patch ];
            #   }
            # )
            # (
            #   { pkgs, lib, ... }:
            #   lib.mkIf (pkgs.stdenv.hostPlatform.isAndroid) {
            #     packages.simplex-chat.components.library.ghcOptions = [ "-pie" ];
            #   }
            # )
          ];
        };

      in
      {
        packages.default = simplex-chat-lib;
      }
    );
}
