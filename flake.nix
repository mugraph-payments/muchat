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
        };

        inherit (pkgs)
          makeRustPlatform
          mkShell
          rust-bin
          writeShellApplication
          ;
        inherit (pkgs.darwin.apple_sdk) frameworks;
        inherit (pkgs.lib) optionals optionalString;
        inherit (pkgs.stdenv) isDarwin isLinux;

        rust = rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
        rustPlatform = makeRustPlatform {
          rustc = rust;
          cargo = rust;
        };

        scripts.muchat-watch = writeShellApplication {
          name = "muchat-watch";
          runtimeInputs = with pkgs; [
            cargo-nextest
            cargo-watch

            rust
          ];
          text = ''
            exec cargo watch -s 'cargo fmt && cargo clippy --all && cargo nextest run'
          '';
        };

        pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;

          hooks = {
            deadnix.enable = true;
            nixfmt-rfc-style.enable = true;

            rustfmt = {
              enable = true;
              packageOverrides.cargo = rust;
            };
          };
        };

        # Fixes a problem where building on Mac would fail for development.
        shell-patch = optionalString isDarwin ''
          export PATH=/usr/bin:$PATH
        '';
      in
      {
        checks = {
          inherit pre-commit-check;
        };

        packages = rec {
          default = muchat;

          muchat = rustPlatform.buildRustPackage {
            name = "muchat";
            src = ./.;

            cargoLock = {
              lockFile = ./Cargo.lock;
              outputHashes = {
                "blade-graphics-0.5.0" = "sha256-j/JI34ZPD7RAHNHu3krgDLnIq4QmmZaZaU1FwD7f2FM";
                "collections-0.1.0" = "sha256-D/arD3BtyHanCltA7fs0rfffADzZmJG+UiPsi3q+ckE=";
                "cosmic-text-0.11.2" = "sha256-TLPDnqixuW+aPAhiBhSvuZIa69vgV3xLcw32OlkdCcM";
                "font-kit-0.14.1" = "sha256-qUKvmi+RDoyhMrZ7T6SoVAyMc/aasQ9Y/okzre4SzXo=";
                "xim-0.4.0" = "sha256-BXyaIBoqMNbzaSJqMadmofdjtlEVSoU6iogF66YP6a4=";
                "xkbcommon-0.7.0" = "sha256-2RjZWiAaz8apYTrZ82qqH4Gv20WyCtPT+ldOzm0GWMo=";
              };
            };

            doCheck = false;
          };
        } // scripts;

        devShells.default = mkShell {
          shellHook = ''
            ${pre-commit-check.shellHook}
            ${shell-patch}
          '';

          name = "muchat";

          buildInputs =
            with pkgs;
            [
              (attrValues scripts)

              rust
              cargo-nextest
              cargo-watch
            ]
            ++ (
              with frameworks;
              optionals isDarwin [
                CoreFoundation
                CoreVideo
                AppKit
                IOSurface
                CoreText
                CoreGraphics
                ApplicationServices
                Security
              ]
            )
            ++ optionals isLinux [
              xorg.libxcb
              libxkbcommon
            ];
        };
      }
    );
}
