export type GeneratedFile = {
  path: string;
  content: string;
};

export type GeneratedProject = {
  projectName: string;
  summary: string;
  files: GeneratedFile[];
};

const MAX_FILES = 40;
const MAX_FILE_SIZE = 120_000;
const ALLOWED_PATH = /^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/;

export function isSafePath(path: string): boolean {
  return (
    path.length > 0 &&
    path.length <= 240 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.split("/").includes("..") &&
    ALLOWED_PATH.test(path)
  );
}

export function validateProject(value: unknown): GeneratedProject {
  if (!value || typeof value !== "object") {
    throw new Error("A resposta da IA não contém um projeto válido.");
  }

  const candidate = value as Record<string, unknown>;
  const projectName = typeof candidate.projectName === "string" ? candidate.projectName.trim() : "";
  const summary = typeof candidate.summary === "string" ? candidate.summary.trim() : "";
  const files = candidate.files;

  if (!projectName || projectName.length > 80) {
    throw new Error("Nome do projeto inválido.");
  }
  if (!summary || summary.length > 2_000) {
    throw new Error("Resumo do projeto inválido.");
  }
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) {
    throw new Error(`O projeto deve conter entre 1 e ${MAX_FILES} arquivos.`);
  }

  const seen = new Set<string>();
  const validated = files.map((file, index) => {
    if (!file || typeof file !== "object") {
      throw new Error(`Arquivo ${index + 1} inválido.`);
    }
    const item = file as Record<string, unknown>;
    const path = typeof item.path === "string" ? item.path.trim() : "";
    const content = typeof item.content === "string" ? item.content : "";

    if (!isSafePath(path)) {
      throw new Error(`Caminho de arquivo inseguro: ${path || "(vazio)"}`);
    }
    if (seen.has(path)) {
      throw new Error(`Arquivo duplicado: ${path}`);
    }
    if (content.length > MAX_FILE_SIZE) {
      throw new Error(`Arquivo excede o limite permitido: ${path}`);
    }
    seen.add(path);
    return { path, content };
  });

  const required = ["package.json", "index.html", "src/main.tsx", "src/App.tsx"];
  for (const path of required) {
    if (!seen.has(path)) throw new Error(`Arquivo obrigatório ausente: ${path}`);
  }

  return { projectName, summary, files: validated };
}

export function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("A IA não retornou JSON válido.");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

export function projectFilesToRecord(files: GeneratedFile[]): Record<string, string> {
  return Object.fromEntries(files.map((file) => [`/${file.path}`, file.content]));
}
