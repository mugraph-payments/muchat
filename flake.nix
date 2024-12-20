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
          mkShell
          rust-bin
          stdenv
          writeShellApplication
          ;

        rust = rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;

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

        rustfmt = stdenv.mkDerivation {
          name = "muchat-rustfmt";
          dontBuild = true;
          dontUnpack = true;
          installPhase = ''
            mkdir -p $out/bin
            ln -s ${rust-bin.nightly.latest.default}/bin/rustfmt $out/bin/rustfmt
            ln -s ${rust-bin.nightly.latest.default}/bin/cargo-fmt $out/bin/cargo-fmt
          '';
        };

        checks.pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;

          hooks = {
            deadnix.enable = true;

            nixfmt-rfc-style = {
              enable = true;
              args = [ "--strict" ];
            };

            prettier = {
              enable = true;

              excludes = [
                "Cargo.lock"
                "flake.lock"
                "pnpm-lock.yaml"
              ];
            };

            rustfmt = {
              enable = true;
              packageOverrides = {
                inherit rustfmt;
                cargo = rust-bin.nightly.latest.default;
              };
            };
          };
        };

        packages.simplex-chat = pkgs.callPackage ./nix/simplex-chat.nix { };
      in
      {
        inherit checks packages;

        devShells.default = mkShell {
          inherit (checks.pre-commit-check) shellHook;

          name = "muchat";

          buildInputs = with pkgs; [
            (attrValues scripts)
            (attrValues packages)

            rust
            rustfmt

            cargo-edit
            cargo-tauri
            cargo-watch
            nodePackages.pnpm
            nodejs
            openssl
            pkg-config

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
        };
      }
    );
}
