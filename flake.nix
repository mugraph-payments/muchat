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
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      pre-commit-hooks,
      rust-overlay,
      treefmt-nix,
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

        inherit (pkgs) mkShell rust-bin stdenv;

        rust = rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
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

        treefmt =
          (treefmt-nix.lib.evalModule pkgs {
            projectRootFile = "flake.nix";

            settings = {
              allow-missing-formatter = true;
              verbose = 0;

              global.excludes = [
                "*.lock"
                "*.md"
                "LICENSE"
                "pnpm-lock.yaml"
              ];

              formatter = {
                nixfmt.options = [ "--strict" ];
                rustfmt.package = rustfmt;
                shfmt.options = [
                  "--ln"
                  "bash"
                ];
              };
            };

            programs = {
              nixfmt.enable = true;
              prettier.enable = true;
              rustfmt.enable = true;
              shfmt.enable = true;
            };
          }).config.build.wrapper;

        checks.pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;

          hooks = {
            deadnix.enable = true;
            treefmt = {
              enable = true;
              package = treefmt;
            };

            rustfmt = {
              enable = true;
              packageOverrides = {
                inherit rustfmt;
                cargo = rustfmt;
              };
            };
          };
        };

        packages = {
          inherit treefmt;

          simplex-chat = pkgs.callPackage ./nix/simplex-chat.nix { };
        };
      in
      {
        inherit checks packages;

        formatter = treefmt;

        devShells.default = mkShell {
          inherit (checks.pre-commit-check) shellHook;

          name = "muchat";

          buildInputs = with pkgs; [
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
