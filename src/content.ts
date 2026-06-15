import fs from "node:fs/promises";
import path from "node:path";
import type { Board } from "./types";
import { normalizeBoard } from "./boardState";

const boardsDir = path.join(process.cwd(), "content", "boards");

export type BoardEntry = {
  slug: string;
  board: Board;
};

export async function getBoardSlugs() {
  await fs.mkdir(boardsDir, { recursive: true });
  const entries = await fs.readdir(boardsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name.replace(/\.json$/i, ""))
    .sort((left, right) => left.localeCompare(right));
}

export async function getBoards(): Promise<BoardEntry[]> {
  const slugs = await getBoardSlugs();
  return Promise.all(slugs.map(async (slug) => ({ slug, board: await getBoard(slug) })));
}

export async function getBoard(slug: string) {
  const filePath = path.join(boardsDir, `${slug}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  return normalizeBoard(JSON.parse(raw));
}
