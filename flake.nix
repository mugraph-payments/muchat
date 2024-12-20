{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      pre-commit-hooks,
      rust-overlay,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        inherit (builtins) attrValues;

        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
          config.allowUnfree = true;
        };

        inherit (pkgs)
          callPackage
          makeRustPlatform
          makeWrapper
          mkShell
          rust-bin
          stdenv
          ;

        rust = rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
        rustPlatform = makeRustPlatform {
          rustc = rust;
          cargo = rust;
        };

        checks.pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;

          hooks = {
            deadnix.enable = true;
            nixfmt-rfc-style.enable = true;

            rustfmt = {
              enable = true;
              packageOverrides.cargo = rust;
            };

            prettier = {
              enable = true;

              excludes = [ "pnpm-lock.yaml" ];
            };
          };
        };

        packages = rec {
          default = stdenv.mkDerivation {
            name = "muchat";

            nativeBuildInputs = [ makeWrapper ];

            dontBuild = true;
            dontUnpack = true;

            installPhase = ''
              mkdir -p $out/{share/muchat/bin,bin}

              install -m 0755 ${ui}/bin/muchat $out/bin/.muchat-unwrapped
              install -m 0755 ${simplex-chat}/bin/simplex-chat $out/share/muchat/bin/simplex-chat

              makeWrapper $out/bin/.muchat-unwrapped $out/bin/muchat \
                --prefix PATH : $out/share/muchat/bin
            '';
          };

          frontend = callPackage ./ui { };

          ui = callPackage ./ui/src-tauri {
            muchat = {
              inherit packages rust rustPlatform;

              src = ./.;
              cargoLock.lockFile = ./Cargo.lock;
            };
          };

          simplex-chat = pkgs.callPackage ./nix/simplex-chat.nix { };
        };
      in
      {
        inherit checks packages;

        devShells.default = mkShell {
          inherit (checks.pre-commit-check) shellHook;

          name = "muchat";
          inputsFrom = attrValues packages;

          buildInputs = with pkgs; [
            packages.simplex-chat

            rust

            cargo-edit
            cargo-tauri
            cargo-watch
            nodePackages.pnpm
            nodejs
          ];
        };
      }
    );
}
