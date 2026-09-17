import fs from "fs/promises";
import path from "path";

export interface GameEntry {
  appid: number;
  name: string;
  likedBy: string[];
  purchased: boolean;
}

export interface StoreData {
  users: string[];
  games: Record<string, GameEntry>;
}

const STORE_PATH = path.join(process.cwd(), "src/data/store.json");

// encadeia as escritas para evitar que duas pessoas clicando ao mesmo tempo
// corrompam o arquivo (uma escrita só começa depois que a anterior terminou)
let writeQueue: Promise<unknown> = Promise.resolve();

export async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { users: [], games: {} };
  }
}

export async function writeStore(data: StoreData): Promise<void> {
  writeQueue = writeQueue.then(() =>
    fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8")
  );
  return writeQueue as Promise<void>;
}