# LandingFlow

SaaS multi-tenant para criacao, edicao, versionamento e publicacao de landing pages com:

- `Next.js 15` + App Router
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `Prisma ORM`
- `PostgreSQL`
- `Firebase Authentication` em projeto separado
- `Route Handlers` para APIs internas
- `S3-compatible storage` (R2 recomendado)
- `Vercel` como alvo de deploy

## Arquitetura

O projeto usa uma unica aplicacao multi-tenant. Cada landing page fica armazenada como JSON estruturado no banco:

- `draftContent`: estado editavel
- `publishedVersionId`: versao publicada em producao
- `PageVersion`: snapshots imutaveis para historico e rollback

Camadas principais:

- `www.dominio.com`: marketing site
- `app.dominio.com`: dashboard, editor e area logada
- `admin.dominio.com`: area administrativa
- `cliente.dominio.com`: landing publicada por subdominio

O middleware detecta host/subdominio e reescreve a requisicao para a area correta.

## Modelos principais

O schema Prisma inclui:

- `User`
- `Workspace`
- `Membership`
- `LandingPage`
- `PageVersion`
- `Asset`
- `Lead`
- `Subscription`
- `Domain`
- `AuditLog`

Enums relevantes:

- `MembershipRole`: `owner`, `admin`, `editor`, `viewer`
- `SubscriptionStatus`: `trial`, `active`, `past_due`, `canceled`, `paused`, `suspended`
- `PagePublicationStatus`: `draft`, `published`, `suspended`

## Fluxos implementados

### Auth

- Frontend com Firebase Web SDK
- Backend validando Firebase ID token
- Sessao HTTP-only compartilhada entre subdominios
- Sincronizacao automatica do usuario em `User`
- Criacao automatica do primeiro workspace no primeiro login

### Multi-tenant

- Membership por workspace
- Seletor de workspace ativo no dashboard
- Workspace ativo persistido por cookie
- Controle de acesso por papel

### Builder

- Sidebar esquerda com secoes
- Preview central em tempo real
- Painel direito com SEO, tema e propriedades tipadas por bloco
- Autosave
- Preview desktop/mobile
- Modo avancado em JSON por bloco

Blocos iniciais:

- Hero
- Logos / prova social
- Beneficios
- Features
- Como funciona
- Depoimentos
- CTA
- FAQ
- Formulario de captura
- Footer

### Publicacao

- Publicacao bloqueada quando o billing nao permite
- Nova `PageVersion` a cada publish
- Rollback promovendo uma versao anterior para uma nova versao publicada
- Dominio primario do workspace apontado para a pagina publicada mais recente
- Resolucao publica usando apenas a versao publicada

### Leads

- Formulario nativo por landing
- Leads gravados no banco
- Associacao com workspace e landing page
- Dashboard de leads no app
- Preview bloqueia submissoes

### Billing

- Interface `BillingProvider`
- `MockBillingProvider`
- Estrutura pronta para `MercadoPagoBillingProvider`
- Area admin para alterar status manualmente no MVP

## Estrutura

```txt
src/
  app/
    api/
    app/
    admin/
    _sites/
  components/
    auth/
    builder/
    landing/
    layout/
    marketing/
    ui/
  lib/
    auth/
    billing/
    server/
    storage/
    validators/
  types/
prisma/
  schema.prisma
  seed.ts
```

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar ambiente

Copie `.env.example` para `.env` e preencha os valores.

### 3. Banco

```bash
npm run db:migrate
npm run db:seed
```

### 4. Rodar a aplicacao

```bash
npm run dev
```

Hosts locais uteis:

- `http://localhost:3000`
- `http://app.localhost:3000`
- `http://admin.localhost:3000`
- `http://workspace-demo.localhost:3000`

## Variaveis de ambiente

Consulte `.env.example`.

### Minimas para rodar o app

- `DATABASE_URL`
- `ROOT_DOMAIN`
- `NEXT_PUBLIC_APP_URL`

### Firebase Web

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Storage S3 / R2

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_PUBLIC_URL_BASE`

### Billing

- `BILLING_PROVIDER=mock|mercadopago`

## Deploy

### Vercel

1. Configure o projeto Next.js na Vercel.
2. Adicione as variaveis de ambiente.
3. Aponte `www`, `app`, `admin` e os subdominios dos clientes.
4. Rode migrations com `npm run db:migrate:deploy`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:migrate
npm run db:migrate:deploy
npm run db:seed
npm run db:studio
```

## Observacoes

- O MVP usa billing mock por padrao.
- O upload de assets usa URL assinada para camada S3-compatible.
- Dominio customizado ainda nao foi exposto na UI, mas a modelagem e a resolucao de dominio ja estao preparadas.

## Setup Firebase (login e senha com verificacao de e-mail)

1. Crie um projeto no Firebase Console.
2. Em `Authentication > Sign-in method`, habilite `Email/Password`.
3. Em `Authentication > Settings`, habilite verificacao de e-mail.
4. Em `Project settings > General`, copie as chaves do app web para:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Em `Project settings > Service accounts`, gere chave Admin SDK e preencha:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (com `\n` escapado na variavel)
6. Garanta:
   - `REQUIRE_EMAIL_VERIFICATION=true`
   - `NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION=true`
7. Rode `npm run dev` e teste:
   - `/signup` para criar conta
   - clique no link de verificacao recebido no e-mail
   - `/login` para entrar

## Setup Asaas (checkout inicial por plano)

1. No painel Asaas, crie os links de pagamento para:
   - Basic mensal (`R$ 49`)
   - Basic anual (`R$ 500`)
   - Pleno mensal (`R$ 97`)
   - Pleno anual (`R$ 1000`)
   - Commerce (personalizado)
2. Preencha no `.env.local`:
   - `ASAAS_BASIC_MONTHLY_CHECKOUT_URL`
   - `ASAAS_BASIC_ANNUAL_CHECKOUT_URL`
   - `ASAAS_PLENO_MONTHLY_CHECKOUT_URL`
   - `ASAAS_PLENO_ANNUAL_CHECKOUT_URL`
   - `ASAAS_COMMERCE_CHECKOUT_URL`
3. Defina `BILLING_PROVIDER=asaas`.
4. Configure webhook no Asaas para `POST /api/billing/asaas/webhook`.
5. (Opcional) Defina `ASAAS_WEBHOOK_TOKEN` e envie o mesmo token no header `asaas-access-token` do webhook.
