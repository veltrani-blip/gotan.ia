// Cliente único do backend. Contrato real do endpoint POST /chat:
//   request:  { prompt: string }     (min 1 char, validado no backend)
//   response: { reply: string }
// Tanto a landing (PromptBox) quanto a área /app (Chat) usam este cliente.

export interface ChatResult {
  reply: string;
}

export class ApiError extends Error {}

// Envia o prompt ao backend. Aceita um AbortSignal para cancelamento real.
export async function generateApp(
  prompt: string,
  signal?: AbortSignal
): Promise<ChatResult> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL não configurada. Defina no .env.local."
    );
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal,
    });
  } catch (err) {
    // Erro de rede ou abort — propaga para o chamador distinguir.
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Falha de conexão com o servidor. Tente novamente.");
  }

  if (!res.ok) {
    // Tenta ler a mensagem real de erro retornada pelo backend (FastAPI: { detail }).
    let detail = `Erro ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // resposta sem corpo JSON — mantém o status
    }
    throw new ApiError(detail);
  }

  const data = (await res.json()) as ChatResult;
  return data;
}

// Chave usada para preservar o prompt entre landing → auth → /app.
export const PENDING_PROMPT_KEY = "gotan:pending-prompt";

// --- Billing (Stripe) ---
// Contrato real: POST {API_URL}/billing/checkout { user_id, email, item } -> { url }
export async function startCheckout(
  item: string,
  user: { id: string; email: string }
): Promise<string> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) throw new ApiError("NEXT_PUBLIC_API_URL não configurada.");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, email: user.email, item }),
    });
  } catch {
    throw new ApiError("Falha de conexão com o servidor.");
  }
  if (!res.ok) {
    let detail = `Erro ${res.status}`;
    try {
      const b = await res.json();
      if (b?.detail) detail = String(b.detail);
    } catch {}
    throw new ApiError(detail);
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}
