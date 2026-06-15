# Auditoria do arquivo “Painel de Voz.zip”

## 1. Estrutura recebida

O ZIP original continha um protótipo em `Painel Gotan.dc.html`, um runtime gerado (`support.js`), imagens e screenshots. Não era um projeto Next.js/React instalável e não possuía `package.json`, backend, variáveis de ambiente, testes ou persistência.

## 2. Partes funcionais do protótipo

- Alternância visual entre Hero Prompt e Hero Voz.
- Campo de texto e preenchimento por sugestões.
- Abas Preview/Código e alternância desktop/mobile.
- Navegação interna entre Hero e Builder.

## 3. Mocks e cascas encontrados

- `toggleMic`: não usava microfone. Após 2,2 segundos, escolhia uma frase aleatória de `TRANSCRIPTS`.
- `submit`: detectava palavras-chave e escolhia um tema fixo de `THEMES`.
- `runSteps`: progresso totalmente simulado com `setTimeout`.
- Preview: exibia templates estáticos predefinidos, não código gerado.
- `sendChange`: aguardava 1,5 segundo e respondia “Feito”, sem alterar arquivo algum.
- Código exibido: conteúdo decorativo, sem compilação real.
- Sem chamada de API, autenticação, banco, logs, cancelamento, tratamento de erro real ou download.

## 4. Riscos

- Usuário era levado a acreditar que o sistema estava gerando e publicando um app.
- Não havia distinção visual entre progresso real e animação.
- Não existia proteção de chave, porque não existia backend.
- O formato `.dc.html` dependia de runtime proprietário e não era adequado para integração direta no projeto Gotan em Next.js.

## 5. Decisão de reconstrução

O protótipo foi mantido apenas como referência visual. A entrega nova foi reconstruída em Next.js + TypeScript com:

- reconhecimento de voz real pelo navegador;
- API server-side para Anthropic;
- resposta JSON validada;
- arquivos reais;
- editor simples;
- preview compilado com Sandpack;
- alterações reais via segunda chamada à IA;
- cancelamento via `AbortController`;
- download ZIP;
- persistência local;
- testes de segurança do manifesto.
