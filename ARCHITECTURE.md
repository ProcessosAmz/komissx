# Arquitetura do KomissX

> Documento baseado na estrutura e nos arquivos versionados na branch \`main\`. Fluxos dependentes de variáveis de ambiente, serviços externos ou estado do servidor devem ser confirmados no ambiente de execução.

## 1. Visão geral

O KomissX é uma aplicação web dividida em dois projetos Node.js independentes:

- **Frontend:** React 19 + TypeScript, Vite, React Router, TanStack Query e Axios. O build gera arquivos estáticos servidos pelo Nginx.
- **Backend:** NestJS 11 + TypeScript, Express, TypeORM e PostgreSQL. Redis é integrado por serviço próprio; autenticação usa Better Auth.
- **Infraestrutura:** Docker Compose, GHCR, Traefik v3.1 e GitHub Actions para CI/deploy blue-green.
- **Integrações funcionais:** Metabase nos serviços de relatórios; variáveis de configuração também indicam fluxos com Google Sheets/Google Cloud.

Estrutura principal:

\`\`\`text
/
├── .github/workflows/       # CI e deploy
├── backend/
│   ├── src/
│   │   ├── main.ts          # bootstrap HTTP
│   │   ├── app.module.ts    # composição de módulos
│   │   ├── database/        # TypeORM, pool e migrations
│   │   ├── integrations/redis/
│   │   └── module/          # domínios de negócio
│   └── docker/              # Dockerfile, Compose, Traefik e deploy
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # rotas SPA
│   │   ├── pages/           # páginas
│   │   ├── components/      # componentes
│   │   ├── hooks/           # hooks de domínio
│   │   ├── service/         # clientes API
│   │   ├── lib/             # Axios, Query Client, auth client
│   │   └── guards/          # proteção de rotas
│   └── docker/              # build Nginx e Compose
└── documents/               # documentos técnicos/funcionais em PDF
\`\`\`

## 2. Arquitetura e fluxos de dados

### 2.1 Requisição web/API

1. O navegador carrega a SPA servida pelo Nginx.
2. React Router seleciona a página e aplica os guards de navegação.
3. Hooks e serviços consultam a API via Axios. A base é \`VITE_API_URL\` ou, por padrão, \`/api\`; cookies são enviados com \`withCredentials: true\` e timeout de 10 segundos.
4. Em produção, Traefik na porta de frontend (8080) encaminha \`/api/*\` ao backend e as demais rotas ao frontend.
5. NestJS aplica prefixo global \`/api\`, guards globais e \`ValidationPipe\`. Controllers delegam a use cases, services e repositories.
6. TypeORM acessa PostgreSQL; Redis fornece integração de cache/estado operacional. Relatórios consultam fontes externas, incluindo Metabase.
7. A resposta HTTP retorna ao cliente; TanStack Query administra cache e ciclo de vida das consultas.

### 2.2 Autenticação e autorização

- O bootstrap registra \`cookie-parser\`, CORS com credenciais e handler Better Auth em \`/api/auth/{*any}\`.
- \`AuthModule\` registra \`AuthGuard\` e \`RolesGuard\` globalmente via \`APP_GUARD\`.
- \`GET /api/me\` retorna o usuário da sessão autenticada.
- \`@Public()\` permite endpoints públicos; \`@Roles(ADMIN_ROLE)\` restringe operações administrativas.
- O frontend contém \`authClient\`, hooks/serviços de autenticação e guards \`GuestRoute\`, \`PrivateRoute\`, \`PermissionRoute\` e \`RootRedirect\`. Guards de SPA não substituem autorização no backend.
- CORS depende de \`CORS_ORIGINS\`; o bootstrap registra aviso quando a variável está vazia.

### 2.3 Relatórios

Os controllers expõem consultas de vendas de autônomos, retiradas e instalações técnicas. Services/use cases transformam parâmetros e resultados; o fluxo de instalações técnicas usa Metabase e consulta usuários cadastrados para associar/restringir resultados. Credenciais e identificadores externos são configurados por ambiente e não devem ser documentados com valores secretos.

### 2.4 Persistência e migrations

- Banco primário: PostgreSQL (\`postgres:16-alpine\` no Compose).
- ORM: TypeORM 0.3; entidades carregadas automaticamente. \`synchronize: false\` e \`migrationsRun: false\` indicam que sincronização e execução automática de migrations estão desativadas.
- Migrations ficam em \`backend/src/migrations/\`; existem migrations Better Auth em \`backend/better-auth_migrations/\`.
- Redis 7 usa AOF e senha configurada por ambiente; \`RedisModule\` fornece serviço global.

## 3. Backend NestJS

### 3.1 Inicialização

- \`backend/src/main.ts\`: cria aplicação Nest/Express; registra shutdown hooks, cookie parser, CORS, parsers JSON/form, handler Better Auth, prefixo \`api\`, validação global e Swagger.
- \`backend/src/app.module.ts\`: carrega configuração de ambiente, configura PostgreSQL/TypeORM e compõe os módulos. \`SKIP_DATABASE=true\` omite banco e módulos de domínio dependentes; Logger, Redis e Health permanecem.
- \`backend/src/database/data-source.ts\` e \`postgresPool.config.ts\`: datasource, migrations e pool.
- \`backend/src/config/swagger.config.ts\`: configura Swagger; a UI é montada em \`/api\` na configuração atual.

### 3.2 Módulos de domínio

| Módulo | Responsabilidade identificada |
|---|---|
| \`auth\` | Better Auth, sessão, guards, decorators e endpoint do usuário atual. |
| \`users\` | CRUD/desativação e listagem hierárquica; vínculos de cargos/permissões e entidades de autenticação. |
| \`roles\` | Consulta/filtro de cargos e relações cargo-permissão. |
| \`permissions\` | Entidades e DTOs de permissões; integração com autorização. |
| \`empresas\` | Listagem de empresas ativas para filtros. |
| \`unidades\` | Listagem de unidades e filtros. |
| \`localidade\` | Consulta de estados/localidades. |
| \`commissions\` | CRUD de regras de comissão com use cases e repository TypeORM. |
| \`reports\` | Relatórios de instalações técnicas, retiradas e vendas de autônomos; Metabase. |
| \`health\` | Liveness e health check de Redis/shutdown. |
| \`logger\` | Logging em arquivo/volume. |
| \`integrations/redis\` | Serviço Redis global. |
| \`configuracoes\` | Módulo existente; composição e endpoints próprios devem ser verificados antes de assumir rotas. |

### 3.3 Padrão interno

\`\`\`text
HTTP Controller
  → DTO / validação
  → Use case (quando aplicável)
  → Service ou Repository
  → TypeORM/PostgreSQL ou integração externa
  → resposta HTTP
\`\`\`

Nem todos os módulos usam todas as camadas: empresas/unidades, por exemplo, delegam diretamente a services. DTOs são processados pelo \`ValidationPipe\` global, que remove campos desconhecidos e rejeita payloads não permitidos.

## 4. Mapeamento de rotas

### 4.1 API HTTP

O prefixo global NestJS é \`/api\`. Rotas confirmadas nos controllers inspecionados:

| Método | Rota | Descrição |
|---|---|---|
| \`*\` | \`/api/auth/*\` | Handler Better Auth. |
| \`GET\` | \`/api/me\` | Usuário da sessão; exige autenticação. |
| \`GET\` | \`/api/health/live\` | Liveness público usado por health checks. |
| \`GET\` | \`/api/health\` | Verifica shutdown e conectividade Redis. |
| \`GET\` | \`/api/users\` | Lista usuários/hierarquia com filtros. |
| \`POST\` | \`/api/users\` | Cria usuário; administrador. |
| \`PATCH\` | \`/api/users/:id\` | Atualiza usuário por UUID; administrador. |
| \`DELETE\` | \`/api/users/:id\` | Desativa usuário por UUID; administrador. |
| \`GET\` | \`/api/roles\` | Lista/filtra cargos. |
| \`GET\` | \`/api/empresas\` | Lista empresas ativas. |
| \`GET\` | \`/api/unidades\` | Lista unidades ativas com filtros. |
| \`GET\` | \`/api/estados\` | Lista estados ativos. |
| \`GET\` | \`/api/commissions/rules\` | Lista catálogo de regras de comissão. |
| \`POST\` | \`/api/commissions/rules\` | Cria regra; administrador. |
| \`PATCH\` | \`/api/commissions/rules/:id\` | Atualiza regra; administrador. |
| \`DELETE\` | \`/api/commissions/rules/:id\` | Desativa regra; administrador. |
| \`GET\` | \`/api/reports/vendas-autonomos\` | Consulta vendas de autônomos. |
| \`GET\` | \`/api/reports/retiradas\` | Consulta retiradas entregues/conciliadas. |
| \`GET\` | \`/api/reports/tecnicos-instalacao\` | Consulta instalações do fechamento semanal de técnicos. |

A tabela reflete os controllers verificados, não necessariamente todas as rotas possíveis de módulos adicionais ou bibliotecas. Para inventário completo, conferir Swagger no ambiente de execução.

### 4.2 Rotas da SPA React

As rotas estão em \`frontend/src/App.tsx\`.

| Rota | Página/comportamento | Proteção |
|---|---|---|
| \`/\` | Redireciona para login. | Pública |
| \`LOGIN_ROUTE\` (valor em \`src/const/auth.ts\`) | Login. | \`GuestRoute\` |
| \`/admin\` | Layout principal; índice usa \`RootRedirect\`. | \`PrivateRoute\` |
| \`/admin/dashboard\` | Dashboard. | Módulo \`producao\` |
| \`/admin/academy\` | Academia/treinamento. | Módulo \`academy\` |
| \`/admin/fechamentos\` | Hub de fechamentos. | Módulo \`fechamento\` |
| \`/admin/fechamentos/semanal/tecnicos\` | Fechamento semanal de técnicos. | \`fechamento\` |
| \`/admin/fechamentos/semanal/retirada\` | Fechamento de retiradas. | \`fechamento\` |
| \`/admin/fechamentos/semanal/autonomos\` | Fechamento de autônomos. | \`fechamento\` |
| \`/admin/fechamentos/mensal/comercial\` | Fechamento mensal comercial. | \`fechamento\` |
| \`/admin/fechamentos/mensal/producao\` | Fechamento mensal de produção. | \`fechamento\` |
| \`/admin/fechamentos/mensal/comercial-pj\` | Fechamento comercial PJ. | \`fechamento\` |
| \`/admin/fechamentos/mensal/cobranca\` | Fechamento mensal de cobrança. | \`fechamento\` |
| \`/admin/configuracoes\` | Painel; índice apresenta equipes. | \`PrivateRoute\` |
| \`/admin/configuracoes/equipes\` | Equipes. | \`PrivateRoute\` |
| \`/admin/configuracoes/semanal\` | Relatório semanal. | \`PrivateRoute\` |
| \`FORBIDDEN_ROUTE\` | Tela de acesso negado. | Erro |
| \`*\` | Tela não encontrada. | Fallback |

Os caminhos \`LOGIN_ROUTE\` e \`FORBIDDEN_ROUTE\` são constantes; consultar \`frontend/src/const/auth.ts\` para os valores efetivos.

## 5. Frontend React

### 5.1 Inicialização e dados

- \`src/main.tsx\`: React Strict Mode, \`QueryClientProvider\` e sistema de toast.
- \`src/App.tsx\`: rotas, layouts e guards.
- \`src/lib/axios.ts\`: Axios usa \`VITE_API_URL ?? "/api"\`, JSON, timeout de 10 s e cookies.
- \`src/lib/queryClient.ts\`: cliente TanStack Query.
- \`src/lib/authClient.ts\`: cliente React do Better Auth.
- \`src/hooks/\` e \`src/service/\`: operações de usuários, cargos, empresas, unidades, comissões e relatórios.
- \`src/stores/\`: estado de interface/domínio, incluindo regras; \`src/engine/\`: avaliação de condições e ações de regras.

### 5.2 Organização visual/funcional

- \`pages/\`: páginas principais e subpáginas.
- \`components/layout/\` e \`layouts/\`: header, sidebar, footer e layouts de administração/dashboard.
- \`components/ui/\`: primitives/componentes base inspirados em Radix/shadcn.
- \`features/academy/\`: telas, hooks, tipos e serviços da academia.
- \`components/painel-configuracoes/\`: configuração e hierarquia organizacional.
- \`pages/Fechamentos/\`: fluxos semanais/mensais de técnicos, retiradas, autônomos, comercial, produção e cobrança.
- \`types/\`, \`utils/\`, \`errors/\`: tipos, validações e tratamento de falhas.

### 5.3 Dependências principais

**Runtime:** React/React DOM, React Router, TanStack Query, Axios, Better Auth, Zustand, React Hook Form, Zod, Radix UI, date-fns, Framer Motion, jsPDF e react-pdf.

**Build/dev:** Vite, TypeScript, ESLint, Tailwind CSS, PostCSS e plugin React do Vite.

## 6. Infraestrutura e deploy

### 6.1 Containers

\`backend/docker/docker-compose.prod.yml\` define a rede Docker \`komissx\`, PostgreSQL, Redis, Traefik e slots \`backend-blue\`/\`backend-green\`. \`frontend/docker/docker-compose.prod.yml\` conecta-se à mesma rede externa e define \`frontend-blue\`/\`frontend-green\`.

- **Backend:** Node 22 Alpine; \`npm ci\`, build NestJS e \`npm run start:prod\`.
- **Frontend:** build multi-stage Node 22 Alpine + Vite, seguido por Nginx 1.27 Alpine servindo \`dist\`.
- **PostgreSQL:** volume \`postgres_data\`, health check \`pg_isready\`.
- **Redis:** volume \`redis_data\`, AOF, senha e health check.
- **Health checks:** backend \`/api/health/live\`; frontend \`/health\`, respondido pelo Nginx.
- **Timezone:** \`America/Manaus\` no backend.

### 6.2 Traefik e roteamento

Traefik usa provider de arquivos dinâmicos em \`backend/docker/traefik/dynamic/\` e duas entrypoints:

- **Porta 3000 / \`web\`:** \`PathPrefix("/")\` encaminha para o backend selecionado em \`backend.yml\`.
- **Porta 8080 / \`frontend\`:** \`PathPrefix("/api")\` tem prioridade maior e encaminha à API; \`PathPrefix("/")\` encaminha o restante ao frontend.
- Dashboard do Traefik desabilitado na configuração versionada.

**Atenção:** os arquivos dinâmicos verificados apontam para slots específicos: \`backend.yml\` aponta para \`komissx_backend_green\`; \`frontend.yml\` aponta para \`komissx_backend_blue\` e \`komissx_frontend_blue\`. Os scripts blue-green atualizam slots/arquivos. O destino real depende do estado desses arquivos no host após o deploy.

### 6.3 CI/CD

- \`.github/workflows/ci.yml\`: em pull requests, configura Node 22, instala dependências do backend e executa build NestJS.
- \`.github/workflows/deploy.yml\`: em push para \`main\`, constrói imagens backend/frontend e publica no GHCR; runner self-hosted gera arquivos de ambiente, inicia infraestrutura, executa deploy blue-green e coleta status/logs.
- \`backend/docker/deploy-blue-green.sh\` e o script correspondente do frontend controlam a troca de slots.
- O ambiente de produção usa Docker Compose e runner self-hosted. Segredos e valores operacionais vêm de GitHub Secrets/Variables e arquivos \`.env\`; não devem ser commitados.

## 7. Dependências e relações

\`\`\`text
Browser
  └─ React SPA (React Router + guards)
      ├─ hooks/services → Axios (/api)
      └─ TanStack Query / Zustand
             │
             ▼
Traefik :8080 ── /api/* ──► NestJS / Express
      │                         ├─ Better Auth + guards
      │                         ├─ Controllers → use cases/services
      │                         ├─ TypeORM ──► PostgreSQL
      │                         ├─ RedisService ──► Redis
      │                         └─ Reports ──► Metabase / fontes externas
      └─ /* ──► Nginx ──► arquivos estáticos da SPA

GitHub Actions → GHCR → runner self-hosted → Docker Compose
                                        └─ Traefik + slots blue/green
\`\`\`

## 8. Variáveis de ambiente relevantes

Nomes observados no código/configuração; valores não são incluídos.

| Variável | Uso |
|---|---|
| \`VITE_API_URL\` | URL base da API compilada no frontend. |
| \`CORS_ORIGINS\` | Origens CORS separadas por vírgula. |
| \`PORT_NEST\`, \`HOST_NAME\`, \`APP_VERSION\` | Porta, hostname para logs e versão. |
| \`DB_HOST\`, \`DB_PORT\`, \`DB_USERNAME\`, \`DB_PASSWORD\`, \`DB_DATABASE\` | Conexão PostgreSQL. |
| \`REDIS_HOST\`, \`REDIS_PORT\`, \`REDIS_PASSWORD\` | Conexão Redis. |
| \`SKIP_DATABASE\` | Desabilita configuração de banco/módulos dependentes. |
| \`BACKEND_IMAGE\`, \`FRONTEND_IMAGE\` | Imagens implantadas. |
| Variáveis \`METABASE_*\` e \`GOOGLE_*\` | Integrações de relatórios/planilhas. |

## 9. Operação, testes e pontos de atenção

- Backend: \`npm run build\`, \`npm test\`, \`npm run test:e2e\`, \`npm run migration:show\`, \`npm run migration:run\`.
- Frontend: \`npm run dev\`, \`npm run build\`, \`npm run lint\`, \`npm run preview\`.
- O CI versionado executa apenas build do backend em pull requests; não há etapa equivalente de build/lint do frontend nesse workflow.
- **Exposição de portas:** o Compose publica PostgreSQL (\`5432\`) e Redis (\`6379\`) em \`0.0.0.0\`. Em ambientes expostos, prefira rede interna ou bind restrito se o acesso externo não for necessário.
- Revisar CORS, domínio público, HTTPS e atributos de cookies em produção.
- Confirmar que os arquivos dinâmicos Traefik apontam para os slots ativos depois de cada deploy blue-green.
- Confirmar endpoints via Swagger no ambiente de execução.
- Manter credenciais/chaves/tokens exclusivamente em secrets e arquivos de ambiente protegidos.
- Os PDFs em \`documents/\` complementam esta análise baseada no código; este documento não substitui especificações de requisitos.

## 10. Fontes do repositório

- \`backend/src/main.ts\`, \`backend/src/app.module.ts\`
- \`backend/src/module/**\`, \`backend/src/database/**\`, \`backend/src/config/swagger.config.ts\`
- \`backend/package.json\`, \`frontend/package.json\`
- \`frontend/src/App.tsx\`, \`frontend/src/main.tsx\`, \`frontend/src/lib/**\`
- \`backend/docker/**\`, \`frontend/docker/**\`
- \`.github/workflows/ci.yml\`, \`.github/workflows/deploy.yml\`
