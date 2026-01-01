import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const PROJECTS_PATH = path.join(process.cwd(), "data", "projects.json");

type ProjectJson = {
  id: string;
  images?: string[];
} & Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readProjects(): Promise<ProjectJson[]> {
  const raw = await fs.readFile(PROJECTS_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed as ProjectJson[];
}

async function writeProjects(projects: ProjectJson[]): Promise<void> {
  await fs.mkdir(path.dirname(PROJECTS_PATH), { recursive: true });
  await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2) + "\n", "utf8");
}

export async function POST(req: Request) {
  // This route exists only to support local authoring. On Vercel/production,
  // persistence should come from the committed JSON file.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = body.projectId;
  const images = body.images;

  if (typeof projectId !== "string" || projectId.length === 0) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  if (!Array.isArray(images) || !images.every((x) => typeof x === "string")) {
    return NextResponse.json({ error: "images must be string[]" }, { status: 400 });
  }

  const projects = await readProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) {
    return NextResponse.json({ error: "Unknown projectId" }, { status: 404 });
  }

  const current = Array.isArray(projects[idx]?.images) ? (projects[idx].images as string[]) : [];
  const currentSet = new Set(current);

  // Persist a safe reorder: keep only known images first, then append any new ones.
  const next: string[] = [];
  for (const img of images) {
    if (currentSet.has(img) && !next.includes(img)) next.push(img);
  }
  for (const img of current) {
    if (!next.includes(img)) next.push(img);
  }

  projects[idx] = { ...projects[idx], images: next };
  await writeProjects(projects);

  return NextResponse.json({ ok: true, images: next });
}
