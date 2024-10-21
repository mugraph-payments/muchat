{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    process-compose.url = "github:Platonic-Systems/process-compose-flake";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      rust-overlay,
      flake-utils,
      process-compose,
      pre-commit-hooks,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
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
        inherit (pkgs.stdenv) isDarwin;

        rust = rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
        rustPlatform = makeRustPlatform {
          rustc = rust;
          cargo = rust;
        };

        packages = rec {
          muchat = rustPlatform.buildRustPackage {
            name = "muchat";
            src = ./.;
            cargoLock.lockFile = ./Cargo.lock;
            doCheck = false;
          };
          default = muchat;

          muchat-watch = (import process-compose.lib { inherit pkgs; }).makeProcessCompose {
            modules = [
              {
                settings.processes.muchat-mint.command = "${muchat-ci}/bin/muchat-ci";
              }
            ];
          };

          muchat-test = writeShellApplication {
            name = "muchat-test";
            runtimeInputs = with pkgs; [
              rust
              cargo-nextest
            ];
            text = ''
              exec cargo nextest run
            '';
          };

          muchat-ci = writeShellApplication {
            name = "muchat-ci";
            runtimeInputs = with pkgs; [
              cargo-nextest
              cargo-watch

              muchat-test
              rust
            ];
            text = ''
              exec cargo watch -s 'cargo fmt && cargo clippy --all && muchat-test'
            '';
          };

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
        inherit packages;

        checks = {
          inherit pre-commit-check;
        };

        devShells.default = mkShell {
          shellHook = ''
            ${pre-commit-check.shellHook}
            ${shell-patch}
          '';

          name = "muchat";

          buildInputs =
            with pkgs;
            [
              packages.muchat-watch
              packages.muchat-test

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
            );
        };
      }
    );
}
