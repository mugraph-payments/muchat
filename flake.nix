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
          config.permittedInsecurePackages = [
            "openssl-1.1.1w"
          ];
        };

        inherit (pkgs)
          makeRustPlatform
          mkShell
          rust-bin
          writeShellApplication
          ;

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
            cargoLock.lockFile = ./Cargo.lock;
          };
        } // scripts;

        devShells.default = mkShell {
          inherit (pre-commit-check) shellHook;

          name = "muchat";

          buildInputs = with pkgs; [
            (attrValues scripts)

            rust
            cargo-tauri
            cargo-watch

            nodePackages.pnpm
          ];
        };
      }
    );
}
