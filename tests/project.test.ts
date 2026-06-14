import { describe, expect, it } from "vitest";
import { extractJson, isSafePath, validateProject } from "../src/lib/project";

const valid = {
  projectName: "demo",
  summary: "Projeto funcional",
  files: [
    { path: "package.json", content: "{}" },
    { path: "index.html", content: "<div id=\"root\"></div>" },
    { path: "src/main.tsx", content: "export {}" },
    { path: "src/App.tsx", content: "export default function App(){return null}" },
  ],
};

describe("segurança de arquivos", () => {
  it("aceita caminhos relativos seguros", () => {
    expect(isSafePath("src/components/Card.tsx")).toBe(true);
  });

  it("bloqueia path traversal e caminhos absolutos", () => {
    expect(isSafePath("../.env")).toBe(false);
    expect(isSafePath("src/../../.env")).toBe(false);
    expect(isSafePath("/etc/passwd")).toBe(false);
    expect(isSafePath("src\\App.tsx")).toBe(false);
  });
});

describe("validação do projeto", () => {
  it("aceita projeto completo", () => {
    expect(validateProject(valid).projectName).toBe("demo");
  });

  it("rejeita arquivo obrigatório ausente", () => {
    expect(() => validateProject({ ...valid, files: valid.files.slice(1) })).toThrow(/package.json/);
  });

  it("rejeita arquivos duplicados", () => {
    expect(() => validateProject({ ...valid, files: [...valid.files, valid.files[0]] })).toThrow(/duplicado/);
  });
});

describe("extração do JSON", () => {
  it("remove cerca markdown quando necessário", () => {
    expect(extractJson('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });
});
