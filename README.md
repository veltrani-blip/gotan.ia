# Gotan Voice Builder — reconstrução funcional

Reconstrução do protótipo `Painel de Voz.zip`, removendo geração simulada e conectando voz, IA, arquivos, preview, edição e download.

## O que funciona

- Prompt por texto.
- Ditado real via Web Speech API quando o navegador oferece suporte.
- Anexação de contexto TXT/MD/JSON/CSV.
- Geração server-side pela API da Anthropic.
- Manifesto JSON validado e proteção contra path traversal.
- Árvore de arquivos, editor e preview executável com Sandpack.
- Alterações reais solicitadas por texto ou voz.
- Cancelamento com `AbortController`.
- Download do projeto em ZIP.
- Persistência local para continuar o teste após recarregar.
- Estados honestos; nenhum `setTimeout` simula geração.

## Instalação

```powershell
npm install
Copy-Item .env.example .env.local
```

Preencha `.env.local` e execute:

```powershell
npm run dev
```

Abra `http://localhost:3000`.

## Testes e build

```powershell
npm test
npm run build
```

## Limite consciente

O ZIP original não continha o código do projeto Gotan principal, autenticação nem banco. Por isso esta entrega é um módulo standalone completo e uma base pronta para integração. As instruções estão em `docs/INTEGRACAO-GOTAN.md`.

## Resultado da validação desta entrega

```text
npm test       6/6 aprovado
npm run build  aprovado
npm audit      0 vulnerabilidades
```
