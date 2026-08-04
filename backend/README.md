# KomissX — Backend

API do KomissX, construída com [NestJS](https://nestjs.com/) e TypeScript. Responsável por autenticação de contexto, regras de comissão, relatórios, permissões e integrações externas (Hubsoft e Metabase).

## Requisitos

- Node.js 18+
- npm

## Setup

```bash
npm install
```

Crie um arquivo `.env` na raiz do `backend` com as variáveis necessárias. O `ConfigModule` carrega nessa ordem:

1. `.env`

### Variáveis principais


| Variável                      | Uso                                                 |
| ----------------------------- | --------------------------------------------------- |
| `PORT`                        | Porta da API (padrão: `3000`)                       |
| `HUB_URL`                     | URL base da API Hubsoft                             |
| `HUB_CLIENT_ID`               | OAuth Hubsoft                                       |
| `HUB_CLIENT_SECRET`           | OAuth Hubsoft                                       |
| `HUB_GRANT_TYPE`              | Tipo de grant OAuth                                 |
| `HUB_USERNAME`                | Usuário Hubsoft                                     |
| `HUB_PASSWORD`                | Senha Hubsoft                                       |
| `METABASE_INSTALACAO_TECNICO` | Endpoint público Metabase (relatório de instalação) |


> O TypeORM / Postgres está preparado no `AppModule`, mas ainda comentado. Quando for habilitar, configure também `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_DATABASE`.

## Banco de dados (TypeORM + PostgreSQL)

O TypeORM está configurado no `AppModule` com `synchronize: false`.
O schema é gerenciado por migrations.

### Subir o Postgres (Docker)

```bash
docker compose up -d
```

# desenvolvimento (watch)
npm run start:dev

# produção
npm run build
npm run start:prod
```

A API sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

## Testes

```bash
# unitários
npm run test

# watch
npm run test:watch

# cobertura
npm run test:cov

# e2e
npm run test:e2e
```



## Estrutura do projeto

```text
backend/src
├── main.ts                 # Bootstrap da aplicação
├── app.module.ts           # Módulo raiz (registra todos os módulos)
├── common/                 # Enums, interfaces e utilitários compartilhados
├── integrations/           # Integrações externas (Hubsoft, Metabase)
├── module/
│   └── configuracoes/      # Módulo de configurações (equipe, hierarquia, etc.)
├── users/
├── roles/
├── permissions/
├── reports/
├── commissions/
├── commission_rule/
└── commission_engine/
```



## Padrão de arquitetura

Cada funcionalidade segue o fluxo:

```text
Controller → Service → Repository
         ↘ DTO ↗
```


| Camada         | Responsabilidade                                                           |
| -------------- | -------------------------------------------------------------------------- |
| **Controller** | Recebe a requisição HTTP, valida entrada e devolve a resposta              |
| **Service**    | Contém a regra de negócio e o mapeamento para DTOs de resposta             |
| **Repository** | Isola o acesso a dados (banco ou API externa, como Hubsoft)                |
| **DTO**        | Define o contrato de entrada (`Create` / `Update`) e de saída (`Response`) |




### Exemplo de pasta de um módulo

user/
├── controller/
│   └── index.controller.ts
├── service/
│   └── index.service.ts
├── dto/
│   ├── create.user.dto.ts
│   ├── update.user.dto
│   ├── repository/
│   └── index.user
└── index.module.ts

## (!) ATENÇÃO (!)

- Caso tenho mais de um arquivo na pasta; Uso o exemplo seguinte.

user/
├── service/
    └── user.service.ts
    └── user.gateway.service.ts

- Só vamos usar INDEX quando tiver somente UM arquivo na pasta.



### Regras importantes

- O **Controller** não fala com Hubsoft/banco diretamente — só chama o Service.
- O **Service** não monta chamada HTTP crua — usa o Repository.
- O **Repository** não aplica regra de negócio — só busca, cria, atualiza ou remove.
- Módulos novos devem ser registrados no `AppModule`.
- Integrações compartilhadas (ex.: `HubsoftService`) ficam em `integrations/` e são exportadas pelo `IntegrationsModule` para outros módulos importarem.



### Barrel `index.ts`

Quando uma pasta tiver muitos arquivos (ex.: `dto/`, `service/`, `controller/`), crie um `index.ts` nela para centralizar os exports.

Assim, em vez de importar arquivo por arquivo, você importa tudo pela pasta:

```ts
──dto/
  ├── create.user.dto.ts
  ├── update.user.dto.ts

// dto/index.ts
export * from './index.create.user.dto.ts
export * from './index.update.user.dto.ts
```



### Integrações

- **Hubsoft**: autenticação OAuth + chamadas à API (vendedores, tickets, supervisores, etc.).
- **Metabase**: consulta de cards públicos para relatórios (ex.: instalação técnica).



## Scripts úteis


| Script              | Descrição                |
| ------------------- | ------------------------ |
| `npm run start:dev` | Sobe a API em modo watch |
| `npm run build`     | Compila para `dist/`     |
| `npm run lint`      | Roda o ESLint            |
| `npm run test`      | Testes unitários         |
| `npm run test:e2e`  | Testes end-to-end        |




## Contato / dúvidas

Para dúvidas sobre o backend, falar com:

- **Matheus Raposo**
- **Yan Oliveira**
