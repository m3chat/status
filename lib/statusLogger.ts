import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "public/status.json");

export async function logStatus(isUp: boolean) {
  let data: Record<string, boolean[]> = {};

  try {
    const file = await fs.readFile(FILE, "utf8");
    data = JSON.parse(file);
  } catch {
    // New file or first run
  }

  const today = new Date().toISOString().split("T")[0];

  if (!data[today]) data[today] = [];
  data[today].push(isUp);

  const keys = Object.keys(data).sort().slice(-14);
  const trimmed = Object.fromEntries(keys.map((k) => [k, data[k]]));

  await fs.writeFile(FILE, JSON.stringify(trimmed, null, 2));
}

export async function getStatusData() {
  const file = await fs.readFile(FILE, "utf8");
  return JSON.parse(file);
}
