import { NextResponse } from "next/server";
import { patchProject } from "@/lib/anthropic";
import { validateProject } from "@/lib/project";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { project?: unknown; instruction?: unknown };
    const instruction = typeof body.instruction === "string" ? body.instruction.trim() : "";
    if (instruction.length < 3) {
      return NextResponse.json({ error: "Informe a alteração desejada." }, { status: 400 });
    }
    const project = validateProject(body.project);
    const updated = await patchProject(project, instruction, request.signal);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada ao alterar o projeto.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
