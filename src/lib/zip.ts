import JSZip from "jszip";
import type { GeneratedProject } from "./project";
import { isSafePath } from "./project";

// .env.example is safe — it contains no real secrets
const ALLOWED_EXACT_NAMES = new Set([".env.example"]);

const BLOCKED_EXACT_NAMES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  ".env.staging",
]);

// Paths that must never enter a user download
const BLOCKED_PATH_PATTERNS: RegExp[] = [
  /(?:^|\/)\.env(?:\.|$)/i,      // .env, .env.local, .env.production, nested/.env
  /(?:^|\/)\.env$/i,             // plain .env at any depth
  /\.pem$/i,
  /\.key$/i,
  /id_rsa/i,
  /id_dsa/i,
  /id_ecdsa/i,
  /(?:^|\/)node_modules(?:\/|$)/,
];

export function isSecretPath(path: string): boolean {
  const lower = path.toLowerCase();
  const parts = lower.split("/");
  const fileName = parts[parts.length - 1];

  if (ALLOWED_EXACT_NAMES.has(fileName)) return false;
  if (BLOCKED_EXACT_NAMES.has(fileName)) return true;
  if (parts.includes("node_modules")) return true;
  return BLOCKED_PATH_PATTERNS.some((re) => re.test(lower));
}

const ENV_EXAMPLE_CONTENT = `# Variáveis de ambiente. Copie este arquivo como .env.local e preencha.
# Nunca comite .env.local no controle de versão.

# (adicione as variáveis do seu projeto aqui)
`;

function buildReadme(project: GeneratedProject): string {
  return `# ${project.projectName}

${project.summary}

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

\`\`\`bash
npm install
cp .env.example .env.local
# Edite .env.local com suas variáveis
\`\`\`

## Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Abra http://localhost:5173 no navegador.

## Build de produção

\`\`\`bash
npm run build
npm run preview
\`\`\`

---

*Gerado pelo Gotan Voice Builder*
`;
}

export function isZipAvailable(status: string, filesLength: number): boolean {
  return status === "ready" && filesLength > 0;
}

export async function buildProjectZip(project: GeneratedProject): Promise<Uint8Array> {
  if (!project.files || project.files.length === 0) {
    throw new Error("Projeto sem arquivos — ZIP não gerado.");
  }

  const zip = new JSZip();
  const includedPaths = new Set<string>();

  for (const file of project.files) {
    if (!isSafePath(file.path) || isSecretPath(file.path)) continue;
    zip.file(file.path, file.content);
    includedPaths.add(file.path);
  }

  if (!includedPaths.has(".env.example")) {
    zip.file(".env.example", ENV_EXAMPLE_CONTENT);
  }
  if (!includedPaths.has("README.md")) {
    zip.file("README.md", buildReadme(project));
  }

  const totalFiles = Object.keys(zip.files).length;
  if (totalFiles === 0) {
    throw new Error("ZIP vazio — nenhum arquivo passou pela validação.");
  }

  return zip.generateAsync({ type: "uint8array" });
}

export function zipFileName(projectName: string): string {
  return `gotan-${projectName.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.zip`;
}
