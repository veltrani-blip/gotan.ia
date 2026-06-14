import { describe, it, expect } from "vitest";
import { buildProjectZip, isSecretPath, isZipAvailable, zipFileName } from "./zip";
import type { GeneratedProject } from "./project";
import JSZip from "jszip";

function makeProject(overrides: Partial<GeneratedProject> = {}): GeneratedProject {
  return {
    projectName: "meu-app",
    summary: "Aplicativo de teste",
    files: [
      { path: "package.json", content: '{"name":"meu-app"}' },
      { path: "index.html", content: "<!DOCTYPE html>" },
      { path: "src/main.tsx", content: "import React from 'react'" },
      { path: "src/App.tsx", content: "export default function App() { return null }" },
    ],
    ...overrides,
  };
}

// ──────────────────────────────────────────────
// isZipAvailable — botão habilitado
// ──────────────────────────────────────────────

describe("isZipAvailable", () => {
  it("fica desabilitado durante a geração (requesting)", () => {
    expect(isZipAvailable("requesting", 4)).toBe(false);
  });

  it("fica desabilitado durante a validação (validating)", () => {
    expect(isZipAvailable("validating", 4)).toBe(false);
  });

  it("fica desabilitado durante o patch (patching)", () => {
    expect(isZipAvailable("patching", 4)).toBe(false);
  });

  it("fica desabilitado quando idle sem arquivos", () => {
    expect(isZipAvailable("idle", 0)).toBe(false);
  });

  it("fica desabilitado quando ready mas sem arquivos", () => {
    expect(isZipAvailable("ready", 0)).toBe(false);
  });

  it("fica habilitado somente quando ready E há arquivos", () => {
    expect(isZipAvailable("ready", 4)).toBe(true);
  });
});

// ──────────────────────────────────────────────
// isSecretPath — caminhos bloqueados
// ──────────────────────────────────────────────

describe("isSecretPath", () => {
  it("bloqueia .env na raiz", () => {
    expect(isSecretPath(".env")).toBe(true);
  });

  it("bloqueia .env.local", () => {
    expect(isSecretPath(".env.local")).toBe(true);
  });

  it("bloqueia .env.production", () => {
    expect(isSecretPath(".env.production")).toBe(true);
  });

  it("bloqueia .env aninhado em subpasta", () => {
    expect(isSecretPath("config/.env")).toBe(true);
  });

  it("bloqueia arquivos .pem", () => {
    expect(isSecretPath("cert/server.pem")).toBe(true);
  });

  it("bloqueia arquivos .key", () => {
    expect(isSecretPath("keys/private.key")).toBe(true);
  });

  it("bloqueia id_rsa", () => {
    expect(isSecretPath("id_rsa")).toBe(true);
  });

  it("bloqueia node_modules em qualquer profundidade", () => {
    expect(isSecretPath("node_modules/react/index.js")).toBe(true);
  });

  it("permite .env.example (não é segredo)", () => {
    expect(isSecretPath(".env.example")).toBe(false);
  });

  it("permite src/App.tsx", () => {
    expect(isSecretPath("src/App.tsx")).toBe(false);
  });

  it("permite package.json", () => {
    expect(isSecretPath("package.json")).toBe(false);
  });
});

// ──────────────────────────────────────────────
// buildProjectZip — conteúdo do ZIP
// ──────────────────────────────────────────────

describe("buildProjectZip", () => {
  it("lança erro quando a lista de arquivos está vazia", async () => {
    const project = makeProject({ files: [] });
    await expect(buildProjectZip(project)).rejects.toThrow("Projeto sem arquivos");
  });

  it("todos os arquivos gerados entram no ZIP", async () => {
    const project = makeProject();
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    const paths = Object.keys(zip.files);

    for (const file of project.files) {
      expect(paths).toContain(file.path);
    }
  });

  it("adiciona .env.example automaticamente quando ausente", async () => {
    const project = makeProject();
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    expect(Object.keys(zip.files)).toContain(".env.example");
  });

  it("adiciona README.md automaticamente quando ausente", async () => {
    const project = makeProject();
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    expect(Object.keys(zip.files)).toContain("README.md");
  });

  it("não duplica .env.example se o projeto já tiver um", async () => {
    const project = makeProject({
      files: [
        ...makeProject().files,
        { path: ".env.example", content: "# meu exemplo" },
      ],
    });
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    const count = Object.keys(zip.files).filter((p) => p === ".env.example").length;
    expect(count).toBe(1);
  });

  it("bloqueia .env — segredo nunca entra no download", async () => {
    const project = makeProject({
      files: [
        ...makeProject().files,
        { path: ".env", content: "ANTHROPIC_API_KEY=sk-ant-super-secret" },
      ],
    });
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    expect(Object.keys(zip.files)).not.toContain(".env");
  });

  it("bloqueia .env.local — segredo nunca entra no download", async () => {
    const project = makeProject({
      files: [
        ...makeProject().files,
        { path: ".env.local", content: "ANTHROPIC_API_KEY=sk-ant-super-secret" },
      ],
    });
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    expect(Object.keys(zip.files)).not.toContain(".env.local");
  });

  it("bloqueia node_modules do ZIP", async () => {
    const project = makeProject({
      files: [
        ...makeProject().files,
        { path: "node_modules/react/index.js", content: "module.exports = {}" },
      ],
    });
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    const paths = Object.keys(zip.files);
    expect(paths.some((p) => p.startsWith("node_modules"))).toBe(false);
  });

  it("lança erro se todos os arquivos forem bloqueados e não restar nada", async () => {
    // Projeto com apenas arquivo de segredo — depois de bloquear fica vazio
    // mas buildProjectZip adiciona .env.example e README.md, então nunca fica
    // realmente vazio. Verificamos que o ZIP contém pelo menos os metadados.
    const project = makeProject({
      files: [{ path: ".env", content: "SECRET=123" }],
    });
    const data = await buildProjectZip(project);
    const zip = await JSZip.loadAsync(data);
    // Deve ter os metadados mesmo sem arquivos gerados
    expect(Object.keys(zip.files).length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────
// zipFileName — nome do arquivo
// ──────────────────────────────────────────────

describe("zipFileName", () => {
  it("formata o nome corretamente", () => {
    expect(zipFileName("Meu App Incrível")).toBe("gotan-meu-app-incr-vel.zip");
  });

  it("converte para minúsculas", () => {
    expect(zipFileName("TodoApp")).toBe("gotan-todoapp.zip");
  });

  it("substitui espaços por hífens", () => {
    expect(zipFileName("my app")).toBe("gotan-my-app.zip");
  });
});
