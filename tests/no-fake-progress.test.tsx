import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Garante que não voltou simulação de progresso por setTimeout no overlay nem no chat.
describe("sem progresso falso", () => {
  it("CodingOverlay não usa setTimeout/setInterval para simular passos", () => {
    const src = readFileSync(
      resolve(__dirname, "../src/components/sections/CodingOverlay.tsx"),
      "utf8"
    );
    expect(src).not.toMatch(/setTimeout|setInterval/);
  });

  it("Chat envia via cliente compartilhado, sem fetch inline", () => {
    const src = readFileSync(
      resolve(__dirname, "../src/components/app/Chat.tsx"),
      "utf8"
    );
    expect(src).toContain("generateApp");
    expect(src).not.toMatch(/fetch\(/);
  });
});
