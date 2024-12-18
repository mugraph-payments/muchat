import { path } from "@tauri-apps/api";
import { SimplexServerDetails } from "./client";
import { exists } from "@tauri-apps/plugin-fs";
import { Child, Command, TerminatedPayload } from "@tauri-apps/plugin-shell";
import { DATABASE_DISPLAY_NAME, HOST, PORT } from "@/config";
import { SimplexError } from "@/useSimplexCli";

export type SimplexCliArgs = {
  serverDetails?: SimplexServerDetails;
  initDisplayName?: string;
  databaseFilename?: string;
  databaseDirectory?: string;
};

export type SpawnArgs = {
  onClose: (data: TerminatedPayload, error?: SimplexError) => void;
  onReady: () => void;
};

class SimplexCli {
  private static instance: SimplexCli;
  process?: Child;
  options: SimplexCliArgs;
  error?: SimplexError;
  callbacks?: SpawnArgs;
  readyTimeout?: NodeJS.Timeout;

  private constructor(options?: SimplexCliArgs) {
    this.options = {
      serverDetails: {
        host: options?.serverDetails?.host ?? HOST,
        port: options?.serverDetails?.port ?? PORT,
      },
      initDisplayName: options?.initDisplayName ?? DATABASE_DISPLAY_NAME,
      databaseFilename: options?.databaseFilename ?? "muchat-server.db_chat.db",
    };
  }

  public static getInstance() {
    if (!SimplexCli.instance) {
      SimplexCli.instance = new SimplexCli();
    }
    return SimplexCli.instance;
  }

  public async spawn(callbacks: SpawnArgs) {
    clearTimeout(this.readyTimeout);
    this.callbacks = callbacks;
    if (!this.process) {
      // Kill lingering process when manually reloading
      const oldPid = sessionStorage.getItem("simplex-pid");
      if (oldPid) {
        const oldChild = new Child(parseInt(oldPid));
        await oldChild.kill();
      }

      const dbPath = await this.getDatabasePath();
      const command = Command.create("simplex-chat", [
        "-p",
        this.options.serverDetails?.port ?? PORT,
        "-d",
        dbPath,
      ]);
      this.process = await command.spawn();

      command.on("close", (data) => {
        this.process = undefined;
        this.callbacks?.onClose(data, this.error ?? undefined);
      });
      command.on("error", (error) => {
        console.error(`command error: "${error}"`);
      });
      command.stdout.on(
        "data",
        (line) => this.process && this.handleSimplexData(this.process, line),
      );
      command.stderr.on("data", (line) => this.handleSimplexStderr(line));
      console.log(`🟦 Spawned process with PID ${this.process.pid}`);
    }

    sessionStorage.setItem("simplex-pid", `${this.process?.pid}`);

    // TODO: find a more reliable way to emit ready event
    this.readyTimeout = setTimeout(() => this.callbacks?.onReady(), 1000);
    return this.process;
  }

  async handleSimplexData(process: Child, line: string) {
    console.log(`> ${line}`);
    if (line.match("No user profiles found, it will be created now.")) {
      console.log(`🟨 Initializing local database`);
      await process.write(this.options.initDisplayName + "\n");
    }
  }

  async handleSimplexStderr(line: string) {
    if (line.match("Address already in use")) {
      this.error = SimplexError.AddressInUse;
      this.handlePortInUse();
    }
  }

  async handlePortInUse() {
    // Update port and try again
    this.options.serverDetails = {
      host: this.options.serverDetails?.host ?? HOST,
      port: (parseInt(this.options.serverDetails?.port ?? PORT) + 1).toString(),
    };

    this.process?.kill();
    this.process = undefined;
    this.spawn(this.callbacks!);
  }

  public async getBaseDirectory() {
    let directory = this.options?.databaseDirectory;
    if (!directory) {
      directory = `${await path.appDataDir()}`;
    }
    return directory;
  }

  public async getDatabasePath() {
    return `${await this.getBaseDirectory()}/${this.options?.databaseFilename ?? "muchat-server.db_chat.db"}`;
  }

  public async checkSimplexDatabase() {
    const dbPath = await this.getDatabasePath();
    return exists(dbPath);
  }
}

export default SimplexCli;
