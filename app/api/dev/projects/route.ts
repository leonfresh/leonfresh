import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const PROJECTS_PATH = path.join(process.cwd(), "data", "projects.json");

type ProjectJson = {
  id: string;
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
  await fs.writeFile(
    PROJECTS_PATH,
    JSON.stringify(projects, null, 2) + "\n",
    "utf8"
  );
}

function uniqueStrings(values: string[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

export async function POST(req: Request) {
  // Local authoring only. Vercel/production persistence should come from the committed JSON.
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

  const orderedIds = body.orderedIds;
  const removeId = body.removeId;
  const updateProjectId = body.updateProjectId;
  const thumbnailPosition = body.thumbnailPosition;

  const isUpdate = typeof updateProjectId === "string";

  let orderedIdsArray: string[] = [];

  if (!isUpdate) {
    if (
      !Array.isArray(orderedIds) ||
      !orderedIds.every((x) => typeof x === "string")
    ) {
      return NextResponse.json(
        { error: "orderedIds must be string[]" },
        { status: 400 }
      );
    }

    orderedIdsArray = orderedIds;
  }

  if (
    typeof removeId !== "undefined" &&
    (typeof removeId !== "string" || removeId.length === 0)
  ) {
    return NextResponse.json(
      { error: "removeId must be a non-empty string" },
      { status: 400 }
    );
  }

  if (isUpdate) {
    if (
      typeof thumbnailPosition !== "undefined" &&
      (!isRecord(thumbnailPosition) ||
        typeof thumbnailPosition.x !== "number" ||
        typeof thumbnailPosition.y !== "number")
    ) {
      return NextResponse.json(
        { error: "thumbnailPosition must be { x: number, y: number }" },
        { status: 400 }
      );
    }
  }

  const projects = await readProjects();

  const existingById = new Map<string, ProjectJson>();
  for (const p of projects) {
    if (p && typeof p.id === "string") existingById.set(p.id, p);
  }

  if (isUpdate) {
    const target = existingById.get(updateProjectId);
    if (!target) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const next = projects.map((p) => {
      if (p.id !== updateProjectId) return p;
      const updated: ProjectJson = { ...p };
      if (typeof thumbnailPosition !== "undefined") {
        updated.thumbnailPosition = thumbnailPosition;
      }
      return updated;
    });

    await writeProjects(next);
    return NextResponse.json({ ok: true, id: updateProjectId });
  }

  const nextOrderedIds = uniqueStrings(orderedIdsArray).filter((id) =>
    existingById.has(id)
  );

  // Append any projects that were not included in orderedIds (stable).
  for (const p of projects) {
    if (!nextOrderedIds.includes(p.id)) nextOrderedIds.push(p.id);
  }

  let next = nextOrderedIds.map((id) => existingById.get(id)!).filter(Boolean);

  if (typeof removeId === "string") {
    next = next.filter((p) => p.id !== removeId);
  }

  await writeProjects(next);

  return NextResponse.json({ ok: true, ids: next.map((p) => p.id) });
}
