import { NextResponse } from "next/server";
import { generateProject } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: unknown;
    };

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (prompt.length < 8) {
      return NextResponse.json(
        {
          error: "Descreva melhor o aplicativo antes de gerar.",
        },
        {
          status: 400,
        },
      );
    }

    if (prompt.length > 12_000) {
      return NextResponse.json(
        {
          error: "O prompt excede o limite de 12.000 caracteres.",
        },
        {
          status: 413,
        },
      );
    }

    const project = await generateProject(
      prompt,
      request.signal,
    );

    return NextResponse.json(project, {
      status: 200,
    });
  } catch (error) {
    console.error("[projects/generate]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Falha inesperada ao gerar o projeto.";

    const status =
      message.includes("Variável obrigatória ausente")
        ? 500
        : message.includes("cancelada")
          ? 499
          : 502;

    return NextResponse.json(
      {
        error: message,
        details:
          process.env.NODE_ENV === "development"
            ? message
            : undefined,
      },
      {
        status,
      },
    );
  }
}
