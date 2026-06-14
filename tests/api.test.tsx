import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateApp, ApiError } from "@/lib/api";

const OLD_ENV = process.env.NEXT_PUBLIC_API_URL;

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("generateApp (contrato real /chat)", () => {
  it("envia { prompt } e retorna { reply }", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "estrutura do app" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await generateApp("Um CRM");
    expect(res.reply).toBe("estrutura do app");

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/chat");
    expect(JSON.parse(opts.body)).toEqual({ prompt: "Um CRM" });
  });

  it("propaga o detail de erro do backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 504,
        json: async () => ({ detail: "A geração demorou demais. Tente de novo." }),
      })
    );
    await expect(generateApp("x")).rejects.toThrow("A geração demorou demais. Tente de novo.");
  });

  it("converte falha de rede em ApiError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
    await expect(generateApp("x")).rejects.toBeInstanceOf(ApiError);
  });

  it("repassa AbortError ao cancelar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"))
    );
    await expect(generateApp("x")).rejects.toMatchObject({ name: "AbortError" });
  });

  it("falha cedo sem NEXT_PUBLIC_API_URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    await expect(generateApp("x")).rejects.toBeInstanceOf(ApiError);
  });
});
