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
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
          config.allowUnfree = true;
        };

        inherit (pkgs) makeRustPlatform mkShell rust-bin;

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

        dependencies =
          with pkgs;
          {
            x86_64-linux = [
              openssl
              webkitgtk
              gtk3
              cairo
              gdk-pixbuf
              glib
              dbus
              openssl
              librsvg
              webkitgtk_4_1
            ];

            aarch64-darwin = [

            ];
          }
          .${system};

        packages = rec {
          default = pkgs.stdenv.mkDerivation {
            name = "muchat";

            nativeBuildInputs = [ pkgs.makeWrapper ];

            dontBuild = true;
            dontUnpack = true;

            installPhase = ''
              mkdir -p $out/{share/muchat/bin,bin}

              install -m 0755 ${muchat}/bin/muchat $out/bin/.muchat-unwrapped
              install -m 0755 ${simplex-chat}/bin/simplex-chat $out/share/muchat/bin/simplex-chat

              makeWrapper $out/bin/.muchat-unwrapped $out/bin/muchat \
                --prefix PATH : $out/share/muchat/bin
            '';
          };

          muchat = rustPlatform.buildRustPackage {
            buildInputs = dependencies;
            nativeBuildInputs = with pkgs; [ pkg-config ];

            name = "muchat-ui";
            src = ./.;
            buildFeatures = [ ];
            cargoLock.lockFile = ./Cargo.lock;
            useNextest = true;
          };

          simplex-chat = pkgs.callPackage ./nix/simplex-chat.nix { };
        };
      in
      {
        inherit checks packages;

        devShells.default = mkShell {
          inherit (checks.pre-commit-check) shellHook;

          name = "muchat";

          buildInputs = with pkgs; [
            dependencies
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
