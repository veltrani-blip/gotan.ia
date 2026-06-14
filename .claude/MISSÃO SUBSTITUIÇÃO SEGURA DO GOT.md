# MISSÃO: SUBSTITUIÇÃO SEGURA DO GOTAN.IA PELO NOVO GOTAN VOICE BUILDER

Você atuará como arquiteto principal, engenheiro full-stack, especialista em segurança, Supabase, Stripe, Next.js e deploy na Vercel.

Esta não é uma simples cópia de arquivos. É uma substituição controlada de um produto já publicado por uma versão nova, mais completa e mais fluida.

---

## 1. CONTEXTO DOS PROJETOS

### NOVO PROJETO — FONTE PRINCIPAL E VISUAL

Diretório local:

```text
C:\Users\Veltrani\Projetos\gotan-voice-panel-complete
```

Este projeto é a nova base oficial.

Ele já possui:

* Builder completo;
* layout atual aprovado;
* painel dividido em chat, arquivos, editor e preview;
* geração real via Anthropic;
* alteração de projetos;
* reconhecimento de voz;
* preview Sandpack;
* editor de arquivos;
* download ZIP seguro;
* estados reais de carregamento;
* cancelamento com AbortController;
* tratamento de erros;
* identidade visual Gotan;
* fluxo mais fluido e completo.

### PROJETO ANTIGO — APENAS DOADOR DE INFRAESTRUTURA

Frontend:

```text
https://github.com/veltrani-blip/gotan.ia
```

Backend:

```text
https://github.com/veltrani-blip/gotan.backend
```

O projeto antigo já possui:

* domínio configurado;
* Cloudflare;
* projeto Vercel;
* Supabase;
* login e cadastro;
* autenticação Google;
* Stripe;
* preços e produtos;
* checkout;
* webhook;
* sistema inicial de planos e créditos.

O projeto antigo NÃO deve ser usado como base visual nem funcional do Builder.

---

# 2. DECISÃO ARQUITETURAL

A nova estrutura deve ser:

```text
gotan-voice-panel-complete
        ↓
nova base oficial do Gotan.ia
        +
autenticação, Stripe, Supabase e créditos reaproveitados
        ↓
substitui o código antigo no repositório gotan.ia
```

O layout novo é a fonte da verdade.

Não reconstruir o novo Builder em cima do antigo.

Não transportar o chat antigo para o novo projeto.

Não substituir o `VoiceBuilder` pelo componente `Chat` antigo.

Não substituir o Builder atual pelo `CodingOverlay` antigo.

Não alterar o layout aprovado para fazê-lo parecer com a versão antiga.

---

# 3. REGRA VISUAL ABSOLUTA

Preserve integralmente o layout atual do projeto novo.

Isso inclui:

* dimensões;
* painel lateral;
* chat;
* árvore de arquivos;
* barra superior;
* editor;
* preview;
* botões;
* ícones;
* espaçamentos;
* tipografia;
* cores;
* gradientes;
* branding;
* comportamento mobile;
* comportamento desktop;
* fluxo de geração;
* mensagens de erro;
* botão de ZIP;
* estados de loading;
* posicionamento dos elementos.

Não redesenhe o Builder.

Não “simplifique” a interface.

Não troque classes CSS sem necessidade.

Não renomeie campos, estados ou componentes apenas por preferência pessoal.

Não remova funcionalidades existentes.

As integrações de autenticação, banco e pagamento devem ser inseridas ao redor da interface atual, sem destruir sua estrutura.

Antes de qualquer modificação visual relevante, compare com a versão original.

---

# 4. ARQUIVOS CRÍTICOS QUE DEVEM SER PRESERVADOS

Audite e mantenha principalmente:

```text
src/components/voice/VoiceBuilder.tsx
src/components/voice/icons.tsx
src/hooks/useSpeechRecognition.ts
src/lib/project.ts
src/lib/zip.ts
src/lib/anthropic.ts
src/app/builder/
src/app/api/projects/generate/
src/app/api/projects/patch/
```

Preserve também:

* Sandpack;
* JSZip;
* AbortController;
* geração real;
* patch real;
* preview real;
* edição real;
* ZIP real;
* validação de arquivos;
* bloqueio de segredos no ZIP.

Não usar mocks em produção.

Não usar respostas fixas.

Não usar `setTimeout` para fingir geração.

Não usar porcentagens falsas.

Não mostrar “gerando” depois de uma falha.

---

# 5. ESTRATÉGIA DE GIT E SEGURANÇA

Antes de alterar qualquer arquivo:

1. Verifique se o novo projeto está versionado.
2. Faça um commit de segurança.
3. Crie a branch:

```text
rebuild/gotan-voice-production
```

4. Nunca trabalhe diretamente na branch `master`.
5. Nunca faça deploy direto em produção.
6. Nunca apague o projeto antigo antes da validação.
7. Nunca force push.
8. Nunca altere o domínio antes do Preview funcionar.

Não faça merge na branch de produção sem autorização explícita.

---

# 6. AUDITORIA OBRIGATÓRIA

Antes de programar, leia completamente:

### Novo projeto

* `package.json`;
* estrutura `src/`;
* rotas de API;
* Builder;
* estilos;
* tipos;
* testes;
* arquivos de ambiente de exemplo;
* configuração Next.js;
* configuração TypeScript.

### Projeto antigo

Clone os projetos antigos em diretórios separados, somente para referência:

```text
legacy/gotan-frontend
legacy/gotan-backend
```

Não misture os arquivos automaticamente.

Analise no frontend antigo:

* Supabase client;
* Supabase server;
* middleware;
* login;
* cadastro;
* callback OAuth;
* proteção de rotas;
* landing;
* preservação do prompt;
* pricing;
* chamada de checkout.

Analise no backend antigo:

* Stripe Checkout;
* webhook;
* planos;
* preços;
* créditos;
* integração Supabase Service Role;
* Anthropic;
* CORS;
* variáveis de ambiente.

Depois apresente um relatório curto contendo:

* o que será reaproveitado;
* o que será descartado;
* conflitos encontrados;
* dependências necessárias;
* variáveis necessárias;
* migrations necessárias.

Após essa auditoria, prossiga com a implementação.

Não peça confirmação para decisões técnicas pequenas.

Pare apenas antes de ações destrutivas, merge em produção ou alteração do domínio.

---

# 7. AUTENTICAÇÃO SUPABASE

Importe para o projeto novo a autenticação Supabase já existente.

O novo projeto deve possuir:

* login por e-mail e senha;
* cadastro;
* login Google;
* callback OAuth;
* logout;
* sessão persistente;
* leitura do usuário no servidor;
* middleware;
* redirecionamento para login;
* proteção da rota `/builder`;
* proteção das APIs privadas.

Nunca confie em `user_id` ou `email` enviados pelo navegador.

O servidor deve identificar o usuário pela sessão Supabase.

As rotas privadas devem validar a sessão no servidor.

Inclua `/builder` e demais áreas privadas no middleware.

Fluxo desejado:

```text
Landing
→ usuário escreve o prompt
→ sem sessão: prompt é preservado
→ cadastro ou login
→ redirecionamento ao Builder
→ prompt recuperado
→ geração iniciada
```

Não faça o usuário redigitar o prompt.

---

# 8. BANCO DE DADOS

Use o Supabase existente.

Não crie outro projeto Supabase.

Crie migrations versionadas para as tabelas necessárias.

Estrutura mínima recomendada:

```text
profiles
subscriptions
projects
project_files
generations
credit_ledger
stripe_events
```

Cada projeto deve possuir obrigatoriamente um `user_id`.

Cada arquivo deve pertencer a um projeto.

Cada projeto deve pertencer ao usuário autenticado.

Ative RLS.

Crie políticas que impeçam um usuário de acessar projetos de outro usuário.

A Service Role só pode ser usada em código server-side.

Nunca envie `SUPABASE_SERVICE_ROLE_KEY` ao navegador.

Substitua o uso principal de `localStorage` por persistência no Supabase.

O `localStorage` pode ser usado apenas como recuperação temporária de rascunho, nunca como fonte principal dos projetos.

Ao abrir o Builder:

* carregar projeto salvo;
* carregar arquivos;
* carregar histórico;
* carregar saldo;
* permitir continuar a edição.

---

# 9. SISTEMA DE CRÉDITOS

Reaproveite os planos e preços existentes.

Não crie novos produtos Stripe desnecessariamente.

Implemente controle de créditos seguro e atômico.

Regras:

* validar saldo antes de iniciar uma operação paga;
* impedir saldo negativo;
* impedir cobrança duplicada;
* registrar cada movimentação;
* registrar motivo;
* registrar projeto;
* registrar operação;
* registrar data;
* registrar idempotency key.

Operações possíveis:

```text
generation
patch
refund
subscription_credit
credit_pack
admin_adjustment
```

Em erro da Anthropic:

* não consumir crédito definitivamente;
* liberar crédito reservado;
* registrar falha.

Em cancelamento:

* não consumir crédito;
* liberar reserva.

Em sucesso:

* confirmar o débito somente após validar a resposta e os arquivos.

Não simplesmente substituir o saldo ao comprar um pacote.

Créditos avulsos devem ser somados ao saldo existente.

---

# 10. STRIPE

Reaproveite:

* conta Stripe atual;
* produtos atuais;
* Price IDs atuais;
* webhook atual;
* planos Starter, Pro e Business;
* pacote de créditos existente.

Não crie outro Stripe.

Não exponha `STRIPE_SECRET_KEY`.

Não exponha `STRIPE_WEBHOOK_SECRET`.

O checkout deve ser criado no servidor.

O servidor deve obter usuário e e-mail pela sessão autenticada.

Não aceite `user_id` arbitrário do frontend.

Implemente webhook com:

* verificação de assinatura;
* idempotência;
* armazenamento do `event_id`;
* prevenção de processamento duplicado;
* tratamento de `checkout.session.completed`;
* tratamento de atualização de assinatura;
* tratamento de cancelamento;
* tratamento de falha de pagamento quando aplicável;
* atualização correta do plano;
* atualização correta dos créditos;
* preservação do saldo extra comprado.

Não altere Price IDs existentes sem necessidade.

---

# 11. ANTHROPIC

O novo projeto deve continuar usando as rotas atuais de geração e patch.

Não voltar para o contrato antigo:

```text
POST /chat
{ prompt } → { reply }
```

O contrato novo deve gerar um projeto estruturado com arquivos reais.

Use variáveis de ambiente:

```text
ANTHROPIC_API_KEY
ANTHROPIC_MODEL
ANTHROPIC_TIMEOUT_MS
```

Não fixe a chave no código.

Não envie a chave ao frontend.

Mantenha:

* timeout;
* tratamento de rate limit;
* tratamento de saldo insuficiente;
* erros claros;
* validação do JSON;
* validação dos arquivos;
* proteção contra caminhos perigosos;
* limite de tamanho;
* AbortController.

A rota de geração deve responder apenas quando o projeto estiver validado.

A rota de patch deve atualizar somente os arquivos necessários.

---

# 12. BUILDER

O Builder atual deve continuar funcional.

Fluxo esperado:

```text
prompt
→ geração
→ arquivos
→ preview
→ edição
→ pedido de alteração
→ atualização
→ download ZIP
```

Funcionalidades obrigatórias:

* chat com histórico;
* geração real;
* reconhecimento de voz;
* cancelamento;
* árvore de arquivos;
* seleção de arquivo;
* edição manual;
* preview Sandpack;
* desktop/mobile;
* patch;
* persistência;
* ZIP;
* bloqueio de segredos;
* mensagens honestas;
* tratamento de erro;
* tentar novamente.

O botão ZIP só pode ser ativado quando:

```text
state === "ready"
```

e existirem arquivos válidos.

O ZIP nunca deve conter:

```text
.env
.env.local
.pem
.key
id_rsa
node_modules
.next
chaves
tokens
segredos
```

Permitir `.env.example`.

---

# 13. LANDING PAGE

O Builder novo é intocável visualmente.

Para a landing, escolha a solução com menor risco:

* preservar a landing do projeto novo, caso já esteja completa;
* importar somente seções realmente necessárias da landing antiga;
* adaptar login, cadastro e preços ao mesmo design do projeto novo.

Não deixe duas identidades visuais diferentes.

Não coloque a landing antiga inteira dentro do novo projeto sem adaptação.

O site inteiro deve parecer um único produto.

Mantenha os ativos de branding existentes:

```text
public/branding/
```

Confirme os caminhos corretos das imagens antes de alterar componentes.

---

# 14. DEPENDÊNCIAS

Não substitua o `package.json` cegamente.

Faça merge consciente.

Preserve as dependências do novo projeto, especialmente:

* Next.js;
* React;
* Sandpack;
* JSZip;
* Anthropic SDK;
* bibliotecas já usadas pelo Builder.

Adicione apenas o necessário para:

* Supabase;
* Stripe;
* autenticação;
* testes.

Remova dependências antigas somente quando confirmar que não são utilizadas.

Não copie:

```text
node_modules
.next
.git
.env
```

---

# 15. VARIÁVEIS DE AMBIENTE

Crie ou atualize `.env.example`, sem valores reais.

Variáveis esperadas:

```text
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_TIMEOUT_MS=120000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_BUSINESS=
STRIPE_PRICE_CREDITS_60=

NEXT_PUBLIC_APP_URL=
```

Audite se alguma variável antiga ainda é necessária.

Nunca copie segredos reais do terminal para arquivos versionados.

Nunca mostrar chaves nos logs.

---

# 16. SUBSTITUIÇÃO DO REPOSITÓRIO ANTIGO

Depois que o novo projeto estiver integrado e testado:

1. Prepare-o para substituir o conteúdo do repositório:

```text
veltrani-blip/gotan.ia
```

2. Preserve o histórico Git.
3. Trabalhe em branch separada.
4. Não altere `master` ainda.
5. Não desconecte a Vercel.
6. Não altere o domínio.
7. Não altere registros Cloudflare.
8. Envie a branch para gerar um Preview Deployment.
9. Valide o Preview.
10. Somente após autorização, faça merge.

A intenção é manter o projeto Vercel, domínio e Cloudflare existentes, trocando apenas o código publicado.

---

# 17. VERCEL E CLOUDFLARE

Não faça mudanças iniciais no Cloudflare.

Não remova o domínio atual.

Não crie outro domínio.

Não mude DNS antes da validação.

Na Vercel:

* manter o projeto existente sempre que possível;
* configurar as novas variáveis;
* gerar Preview Deployment;
* verificar build;
* verificar rotas;
* verificar funções server-side;
* verificar limite de tempo;
* verificar webhook Stripe;
* verificar callback Supabase;
* verificar domínio de autenticação.

Não publicar produção automaticamente.

---

# 18. TESTES OBRIGATÓRIOS

Execute testes reais.

### Build

```text
npm run build
```

O build deve terminar sem:

* erro TypeScript;
* erro ESLint bloqueante;
* import inexistente;
* rota duplicada;
* variável obrigatória ignorada.

### Auth

* cadastro;
* login;
* login Google;
* logout;
* redirecionamento;
* rota protegida;
* sessão expirada.

### Builder

* prompt gera projeto;
* arquivos aparecem;
* preview abre;
* arquivo pode ser editado;
* patch funciona;
* cancelamento funciona;
* erro encerra loading;
* tentar novamente funciona;
* voz funciona em navegador compatível;
* ZIP baixa;
* segredos não entram no ZIP.

### Persistência

* projeto salvo no Supabase;
* projeto carregado novamente;
* usuário A não acessa projeto do usuário B;
* arquivos pertencem ao projeto correto.

### Créditos

* saldo é validado;
* sucesso debita;
* erro não debita;
* cancelamento não debita;
* pacote soma créditos;
* webhook duplicado não duplica saldo.

### Stripe

* checkout cria sessão;
* usuário correto é associado;
* webhook valida assinatura;
* plano é atualizado;
* cancelamento é refletido;
* evento duplicado é ignorado.

---

# 19. CRITÉRIOS DE ACEITAÇÃO VISUAL

Antes e depois da integração, gere screenshots do Builder.

Compare:

* layout;
* dimensões;
* espaçamento;
* cores;
* botões;
* cabeçalho;
* árvore de arquivos;
* chat;
* preview;
* editor.

A integração só será aceita se o Builder continuar visualmente equivalente ao projeto novo original.

Mudanças visuais pequenas causadas pela autenticação devem ser justificadas.

---

# 20. ENTREGA FINAL

Ao concluir, apresente:

```text
1. Resumo do que foi feito
2. Arquivos adicionados
3. Arquivos modificados
4. Arquivos removidos
5. Dependências adicionadas
6. Dependências removidas
7. Migrations criadas
8. Políticas RLS criadas
9. Variáveis necessárias
10. Integração Stripe realizada
11. Integração Supabase realizada
12. Sistema de créditos implementado
13. Testes executados
14. Resultado do npm run build
15. Branch criada
16. URL do Preview Deployment
17. Riscos restantes
18. Passos manuais inevitáveis
```

Não esconda falhas.

Não declare que algo funciona sem testar.

Não use dados falsos para afirmar sucesso.

---

# 21. PROIBIÇÕES ABSOLUTAS

Não:

* sobrescrever o Builder com a versão antiga;
* mudar o layout atual;
* trabalhar direto em produção;
* apagar o repositório antigo;
* apagar o projeto Vercel;
* alterar Cloudflare prematuramente;
* criar novo Stripe;
* criar novo Supabase sem necessidade;
* confiar em `user_id` do frontend;
* expor Service Role;
* expor chave Anthropic;
* expor segredo Stripe;
* commitar `.env`;
* usar mock em produção;
* usar loading falso;
* usar `setTimeout` como geração;
* substituir arquivos sem backup;
* remover funcionalidades para fazer o build passar;
* ignorar erros TypeScript;
* fazer merge em `master` sem autorização.

---

# 22. ORDEM FINAL DE EXECUÇÃO

Execute nesta ordem:

```text
1. Auditoria
2. Backup e commit
3. Branch
4. Supabase Auth
5. Middleware
6. Banco e RLS
7. Persistência de projetos
8. Créditos
9. Stripe
10. Integração com o Builder
11. Testes
12. Build
13. Screenshots comparativos
14. Push da branch
15. Preview da Vercel
16. Relatório
17. Aguardar autorização para produção
```

Comece agora pela auditoria dos projetos.

O projeto novo é a fonte principal.

O layout atual deve ser mantido.

A infraestrutura antiga deve ser reaproveitada sem trazer o código visual antigo de volta.
