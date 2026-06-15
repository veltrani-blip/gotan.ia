# Integração no projeto Gotan existente

## Opção segura: integrar por pastas

Copie para o projeto Gotan:

```text
src/app/builder/
src/app/api/projects/generate/
src/app/api/projects/patch/
src/components/voice/
src/hooks/useSpeechRecognition.ts
src/lib/anthropic.ts
src/lib/project.ts
public/branding/
```

Mescle as regras de `src/app/globals.css` com o CSS atual da Gotan. Não substitua o arquivo inteiro sem revisar, pois o projeto principal já possui seu próprio tema.

Instale:

```powershell
npm install @codesandbox/sandpack-react jszip
```

Configure `.env.local`:

```env
ANTHROPIC_API_KEY=sua-chave
ANTHROPIC_MODEL=id-do-modelo-habilitado-na-sua-conta
ANTHROPIC_TIMEOUT_MS=120000
```

A chave é utilizada somente nas rotas server-side. Não use prefixo `NEXT_PUBLIC_`.

## Rota de entrada

A landing envia o usuário para:

```text
/builder?prompt=DESCRICAO
```

No seu `PromptBox.tsx`, substitua o fluxo mockado por:

```ts
sessionStorage.setItem("gotan:lastPrompt", prompt.trim());
router.push(`/builder?prompt=${encodeURIComponent(prompt.trim())}`);
```

## Autenticação

Esta entrega não inventa um segundo sistema de autenticação. No projeto principal, proteja `/builder` com o middleware/auth já existente. O prompt fica em `sessionStorage` e pode ser retomado após login.

## Persistência

O pacote standalone usa `localStorage` para permitir teste imediato. Ao integrar no SaaS, substitua `persist()` em `VoiceBuilder.tsx` pelos endpoints/tabelas de projetos já existentes. A interface `GeneratedProject` pode ser mantida como contrato.
