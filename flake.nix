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

        muchat = import ./lib.nix pkgs;

        checks.pre-commit-check = pre-commit-hooks.lib.${system}.run {
          src = ./.;

          hooks = {
            deadnix.enable = true;
            nixfmt-rfc-style.enable = true;

            rustfmt = {
              enable = true;
              packageOverrides.cargo = muchat.packages.rust;
            };

            prettier = {
              enable = true;

              excludes = [ "pnpm-lock.yaml" ];
            };
          };
        };

      in
      {
        inherit checks;
        inherit (muchat) packages;

        devShells.default =
          with pkgs;
          mkShell {
            inherit (checks.pre-commit-check) shellHook;

            name = "muchat-shell";
            inputsFrom = attrValues muchat.packages;

            buildInputs = with pkgs; [
              muchat.packages.simplex-chat
              muchat.packages.rust

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
