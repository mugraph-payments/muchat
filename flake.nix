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

        simplex-ci = writeShellApplication {
          name = "simplex-ci";
          runtimeInputs = with pkgs; [
            rust
            cargo-watch
            cargo-nextest
          ];
          text = ''
            cargo watch -s 'cargo fmt && cargo clippy --all && cargo nextest run --release'
          '';
        };

        packages = {
          default = rustPlatform.buildRustPackage {
            name = "simplex";
            src = ./.;
            cargoLock.lockFile = ./Cargo.lock;
            doCheck = false;
          };

          simplex-watch = (import process-compose.lib { inherit pkgs; }).makeProcessCompose {
            modules = [
              {
                settings.processes.simplex-mint.command = "${simplex-ci}/bin/simplex-ci";
              }
            ];
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

        shell-patch = optionalString isDarwin ''
          # Prioritize system clang
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

          name = "simplex";

          buildInputs =
            with pkgs;
            [
              packages.simplex-watch

              rust
              rustfmt
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
