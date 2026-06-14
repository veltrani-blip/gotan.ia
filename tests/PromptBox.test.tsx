import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks dos módulos reais usados pelo PromptBox.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

const generateAppMock = vi.fn();
vi.mock("@/lib/api", () => ({
  generateApp: (...args: unknown[]) => generateAppMock(...args),
  ApiError: class ApiError extends Error {},
  PENDING_PROMPT_KEY: "gotan:pending-prompt",
}));

const getSessionMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getSession: getSessionMock } }),
}));

import { PromptBox } from "@/components/sections/PromptBox";

function type(text: string) {
  const ta = screen.getByPlaceholderText(/descreva o aplicativo/i);
  fireEvent.change(ta, { target: { value: text } });
}

describe("PromptBox (fluxo real)", () => {
  beforeEach(() => {
    pushMock.mockReset();
    generateAppMock.mockReset();
    getSessionMock.mockReset();
    sessionStorage.clear();
  });

  it("prompt vazio não chama a API nem redireciona", async () => {
    render(<PromptBox />);
    fireEvent.click(screen.getByLabelText("Gerar App"));
    expect(generateAppMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("sem sessão: guarda o prompt e redireciona para /signup", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    render(<PromptBox />);
    type("Um CRM para clínicas");
    fireEvent.click(screen.getByLabelText("Gerar App"));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/signup"));
    expect(sessionStorage.getItem("gotan:pending-prompt")).toBe("Um CRM para clínicas");
    expect(generateAppMock).not.toHaveBeenCalled();
  });

  it("com sessão: chama generateApp e mostra a resposta real", async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: {} } } });
    generateAppMock.mockResolvedValue({ reply: "Estrutura: telas, modelo, stack." });
    render(<PromptBox />);
    type("Loja com checkout");
    fireEvent.click(screen.getByLabelText("Gerar App"));
    await waitFor(() =>
      expect(generateAppMock).toHaveBeenCalledWith("Loja com checkout", expect.anything()),
      { timeout: 8000 }
    );
    expect(await screen.findByText(/Estrutura: telas/, {}, { timeout: 8000 })).toBeDefined();
  }, 15000);

  it("erro do backend aparece e o prompt é preservado", async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: {} } } });
    const { ApiError } = await import("@/lib/api");
    generateAppMock.mockRejectedValue(new (ApiError as typeof Error)("Limite de uso atingido."));
    render(<PromptBox />);
    type("App de agendamento");
    fireEvent.click(screen.getByLabelText("Gerar App"));
    expect(await screen.findByText("Limite de uso atingido.")).toBeDefined();
    // prompt preservado no textarea
    expect((screen.getByPlaceholderText(/descreva o aplicativo/i) as HTMLTextAreaElement).value).toBe(
      "App de agendamento"
    );
  });
});
