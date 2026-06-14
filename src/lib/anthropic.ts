import { extractJson, validateProject, type GeneratedProject } from "@/lib/project";

const API_URL = "https://api.anthropic.com/v1/messages";

function env(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value;
}

function generationSystemPrompt(): string {
  return `Você é o motor de geração da Gotan. Gere um projeto React + TypeScript + Vite funcional e visualmente refinado.

Responda SOMENTE com JSON válido neste formato:
{
  "projectName": "nome-curto",
  "summary": "resumo objetivo",
  "files": [
    { "path": "package.json", "content": "conteúdo completo" }
  ]
}

Regras obrigatórias:
- Inclua package.json, index.html, src/main.tsx, src/App.tsx e src/index.css.
- Não use markdown, comentários fora do JSON ou conteúdo truncado.
- Todo arquivo deve conter conteúdo completo.
- Use somente dependências compatíveis com Vite/React disponíveis no package.json gerado.
- Não use imagens remotas obrigatórias; prefira CSS, SVG inline e gradientes.
- O app deve funcionar sem backend, com dados locais realistas e interações úteis.
- Evite placeholders vazios, botões mortos e TODOs.
- Interface responsiva e acessível.
- Máximo de 24 arquivos.`;
}

function patchSystemPrompt(): string {
  return `Você é o editor de projetos da Gotan. Receberá um projeto React existente e uma alteração solicitada.
Retorne SOMENTE o projeto completo atualizado em JSON, no mesmo formato:
{"projectName":"...","summary":"...","files":[{"path":"...","content":"..."}]}
Não retorne diffs. Não use markdown. Preserve o que não precisa mudar. Garanta que o projeto continue funcional.`;
}

type AnthropicResponse = {
  content?: Array<{ type?: string; text?: string }>;
  error?: { message?: string };
};

async function callAnthropic(system: string, user: string, signal?: AbortSignal): Promise<GeneratedProject> {
  const apiKey = env("ANTHROPIC_API_KEY");
  const model = env("ANTHROPIC_MODEL");
  const timeoutMs = Number(process.env.ANTHROPIC_TIMEOUT_MS || 120_000);
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);
  const abort = () => timeoutController.abort();
  signal?.addEventListener("abort", abort, { once: true });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 16_000,
        temperature: 0.2,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: timeoutController.signal,
      cache: "no-store",
    });

    const data = (await response.json()) as AnthropicResponse;
    if (!response.ok) {
      throw new Error(data.error?.message || `Anthropic respondeu HTTP ${response.status}.`);
    }

    const text = data.content?.find((block) => block.type === "text")?.text;
    if (!text) throw new Error("A Anthropic não retornou conteúdo textual.");
    return validateProject(extractJson(text));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A geração foi cancelada ou excedeu o tempo limite.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export async function generateProject(prompt: string, signal?: AbortSignal): Promise<GeneratedProject> {
  return callAnthropic(generationSystemPrompt(), `Crie este aplicativo:\n\n${prompt}`, signal);
}

export async function patchProject(project: GeneratedProject, instruction: string, signal?: AbortSignal): Promise<GeneratedProject> {
  const serialized = JSON.stringify(project);
  return callAnthropic(
    patchSystemPrompt(),
    `ALTERAÇÃO SOLICITADA:\n${instruction}\n\nPROJETO ATUAL:\n${serialized}`,
    signal,
  );
}
