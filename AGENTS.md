AGENTS.md — KomissX
1. Objetivo

Este arquivo define as instruções de trabalho para agentes de IA que atuam no repositório KomissX.

O objetivo é permitir implementações seguras, consistentes e verificáveis, reduzindo redescoberta de contexto, alterações desnecessárias, retrabalho e erros de integração.

Estas instruções se aplicam ao repositório inteiro, incluindo frontend, backend, testes, documentação, infraestrutura e CI/CD.

Antes de implementar uma tarefa, leia estas instruções e consulte os arquivos relevantes do projeto. Não presuma que a documentação substitui a verificação do código atual.

2. Regras fundamentais
Entenda o problema e o comportamento esperado antes de alterar código.
Inspecione a implementação existente antes de propor uma nova.
Prefira a menor alteração que resolva corretamente o problema.
Preserve a arquitetura, os padrões e as convenções já estabelecidos.
Não crie abstrações, camadas, dependências ou arquivos sem necessidade concreta.
Não reescreva módulos inteiros quando uma alteração localizada for suficiente.
Não altere funcionalidades fora do escopo solicitado.
Não invente comandos, endpoints, variáveis de ambiente, dependências ou comportamentos.
Não declare testes, builds ou deploys bem-sucedidos sem evidências de execução.
Não esconda erros, avisos relevantes, limitações ou verificações pendentes.
Se houver ambiguidade que possa causar uma alteração destrutiva, insegura ou incompatível, explique o risco e peça esclarecimento antes de prosseguir.
Para decisões reversíveis e de baixo risco, use as convenções existentes e registre as premissas relevantes.
3. Contexto da arquitetura

O KomissX possui dois projetos Node.js independentes.

Frontend
React 19 e TypeScript.
Vite e React Router.
TanStack Query para consultas e cache de dados remotos.
Axios para comunicação HTTP.
Better Auth para integração de autenticação.
Zustand para estado de interface/domínio.
React Hook Form e Zod para formulários e validações, conforme os padrões existentes.
Build estático servido pelo Nginx.

Diretórios relevantes:

frontend/src/pages/: páginas.
frontend/src/components/: componentes.
frontend/src/hooks/: hooks.
frontend/src/service/: serviços de API.
frontend/src/lib/: Axios, Query Client e cliente de autenticação.
frontend/src/guards/: proteção de rotas.
frontend/src/features/: funcionalidades organizadas por domínio.
frontend/src/stores/: estado compartilhado.
frontend/src/engine/: avaliação de condições e ações de regras.
frontend/src/App.tsx: composição de rotas.
frontend/src/main.tsx: inicialização da aplicação.
Backend
NestJS 11, TypeScript e Express.
TypeORM 0.3 e PostgreSQL.
Redis por meio de integração própria.
Better Auth para autenticação.
Guards e decorators para autenticação e autorização.
DTOs e ValidationPipe global para validação de requisições.
Integrações externas utilizadas principalmente nos relatórios.

Diretórios e arquivos relevantes:

backend/src/main.ts: bootstrap HTTP.
backend/src/app.module.ts: composição dos módulos.
backend/src/module/: módulos de domínio.
backend/src/database/: configuração de banco e datasource.
backend/src/migrations/: migrations da aplicação.
backend/better-auth_migrations/: migrations relacionadas ao Better Auth.
backend/src/integrations/redis/: integração Redis.
backend/src/config/: configurações.
backend/src/migrations/: histórico de alterações de banco.
Infraestrutura
Docker Compose.
Traefik v3.1.
PostgreSQL e Redis.
Imagens publicadas no GHCR.
GitHub Actions.
Runner self-hosted.
Deploy blue-green de frontend e backend.

Arquivos importantes:

.github/workflows/ci.yml
.github/workflows/deploy.yml
backend/docker/
frontend/docker/

Consulte architecture.md ou o documento de arquitetura existente no repositório para detalhes adicionais. Se o caminho ou o nome do documento for diferente, localize o arquivo antes de utilizá-lo.

4. Fluxo de trabalho obrigatório

Para cada tarefa, siga este processo proporcional ao risco e à complexidade da mudança.

Etapa 1 — Entender
Identifique o objetivo e os critérios de aceitação.
Localize os arquivos envolvidos.
Leia as implementações, tipos, testes e dependências relevantes.
Consulte a documentação de arquitetura quando a tarefa envolver estrutura, integração ou infraestrutura.
Identifique impactos no frontend, backend, banco, autenticação e integrações externas.

Não leia o repositório inteiro indiscriminadamente. Busque contexto suficiente para a tarefa e aprofunde a investigação quando necessário.

Etapa 2 — Planejar

Antes de alterações relevantes, defina:

Causa provável do problema ou comportamento a implementar.
Arquivos e módulos que precisam mudar.
Compatibilidade com contratos existentes.
Testes ou verificações necessários.
Riscos de segurança, dados, autorização e deploy.

Para tarefas pequenas e de baixo risco, o planejamento pode ser breve.

Para mudanças estruturais, migrações de banco, autenticação, permissões ou infraestrutura, apresente o plano e os riscos antes de executar ações potencialmente destrutivas.

Etapa 3 — Implementar
Siga as convenções do módulo alterado.
Reutilize funções, componentes, DTOs, serviços e utilitários existentes quando apropriado.
Evite duplicação de lógica.
Preserve a separação de responsabilidades.
Mantenha os tipos coerentes entre camadas.
Evite alterações não relacionadas à tarefa.
Atualize testes e documentação quando o comportamento ou o contrato mudar.
Etapa 4 — Verificar
Revise o diff.
Execute os testes e verificações pertinentes, respeitando os comandos definidos nos respectivos package.json.
Corrija regressões introduzidas pela alteração.
Confira se as mudanças afetam contratos, permissões, dados ou configuração.
Informe claramente o que foi executado, o que passou, o que falhou e o que não pôde ser verificado.

Se uma verificação falhar por uma causa aparentemente preexistente, investigue quando viável. Não altere componentes não relacionados apenas para fazer a verificação passar.

Etapa 5 — Entregar

Ao concluir, apresente:

Resumo da implementação.
Arquivos ou módulos alterados.
Decisões técnicas relevantes.
Testes e comandos executados, com resultados.
Limitações, riscos e pendências conhecidas.

Não afirme que a aplicação está funcionando em produção sem evidência de execução no ambiente correspondente.

5. Convenções do backend
5.1 Organização por domínio
Preserve a organização existente em módulos NestJS.
Respeite o padrão interno de controllers, DTOs, use cases, services e repositories quando essas camadas existirem.
Nem todo módulo precisa de todas as camadas.
Não introduza camadas adicionais sem uma justificativa funcional ou arquitetural.
Mantenha regras de negócio fora dos controllers quando isso for consistente com o módulo existente.
Não mova lógica entre módulos sem avaliar dependências e responsabilidades.
5.2 HTTP e validação
Considere o prefixo global /api.
Inspecione controllers e decorators antes de alterar ou documentar endpoints.
Use DTOs e os mecanismos de validação já adotados.
Respeite o ValidationPipe global e seu comportamento de rejeição de campos não permitidos.
Preserve contratos de requisição e resposta, exceto quando a tarefa exigir mudança explícita.
Considere compatibilidade com clientes frontend já existentes.
Atualize a documentação Swagger quando necessário e de acordo com os padrões atuais.
5.3 Autenticação e autorização
Considere Better Auth, AuthGuard, RolesGuard, @Public() e @Roles(...) como partes do modelo de segurança existente.
Nunca considere os guards do frontend suficientes para proteger um endpoint.
Verifique autenticação e autorização no backend para operações protegidas.
Não torne um endpoint público apenas para contornar um problema de acesso.
Não remova guards ou verificações de permissão sem uma justificativa explícita e uma análise de impacto.
Preserve a semântica de sessão, cookies e CORS.
Não exponha dados de sessão, tokens ou credenciais em logs ou respostas.
Ao alterar usuários, cargos ou permissões, avalie possíveis efeitos sobre acessos existentes.
5.4 PostgreSQL, TypeORM e migrations
Não presuma que alterações em entidades atualizam automaticamente o banco.
Preserve synchronize: false e o fluxo explícito de migrations.
Não habilite sincronização automática em produção como solução rápida.
Para mudanças de schema persistentes, inspecione o padrão de migrations existente e crie uma migration quando necessário.
Verifique a compatibilidade entre entidades, migrations, consultas e dados existentes.
Considere rollback, valores padrão, nulabilidade, índices e integridade referencial.
Não execute migrations em produção nem operações destrutivas sem autorização explícita.
Não apague, reescreva ou renumere migrations já aplicadas sem avaliar o impacto.
Inspecione o datasource e os scripts reais antes de executar comandos de banco.
5.5 Redis e integrações externas
Reutilize os serviços de integração existentes.
Considere indisponibilidade, timeout, autenticação e falhas parciais de serviços externos.
Não presuma que Redis, Metabase, Google Cloud ou Google Sheets estão disponíveis no ambiente atual.
Não introduza chamadas externas desnecessárias.
Evite registrar payloads sensíveis ou credenciais.
Preserve o comportamento de health checks e shutdown.
Quando uma integração for alterada, verifique o tratamento de erros e a compatibilidade dos dados retornados.
5.6 Relatórios
Inspecione o fluxo específico do relatório antes de alterar consultas ou transformações.
Preserve filtros, períodos, regras de negócio e restrições de acesso existentes.
Ao modificar relatórios de Metabase ou outras fontes externas, verifique como parâmetros, identificadores e resultados são tratados.
Não exponha resultados de outros usuários ou dados fora do escopo autorizado.
Adicione testes para transformações de dados e regras de filtragem quando viável.
6. Convenções do frontend
6.1 Componentes e páginas
Siga a organização existente em pages/, components/, features/, hooks/ e service/.
Reutilize os componentes visuais e primitives existentes antes de criar novos.
Preserve o sistema visual e os padrões de interação do KomissX.
Evite concentrar regras de negócio complexas em componentes de apresentação.
Mantenha componentes tipados e responsabilidades claras.
Não faça refatorações visuais fora do escopo solicitado.
6.2 API e estado remoto
Reutilize o cliente Axios configurado em frontend/src/lib/axios.ts.
Preserve o uso de VITE_API_URL, o fallback /api, o envio de credenciais e o timeout configurado, salvo quando houver requisito explícito de mudança.
Evite criar clientes HTTP paralelos sem necessidade.
Use TanStack Query para operações de dados remotos conforme os padrões existentes.
Preserve as convenções de queryKey, invalidação, atualização de cache e tratamento de erros.
Evite duplicar no Zustand dados que já são administrados pelo TanStack Query, salvo quando houver uma necessidade clara.
Não suponha que uma operação no servidor foi concluída apenas porque uma ação visual ocorreu.
6.3 Formulários e tipos
Reutilize os padrões existentes de React Hook Form e Zod quando aplicáveis.
Preserve a validação tanto no frontend quanto no backend.
Não considere validações do navegador suficientes para proteger a API.
Evite any, coerções inseguras e supressões de TypeScript sem justificativa.
Não contorne erros de tipo apenas para fazer o build passar.
Mantenha consistência entre DTOs da API, tipos de serviço e modelos usados nas telas.
6.4 Rotas e permissões
Consulte frontend/src/App.tsx e as constantes de autenticação antes de alterar rotas.
Preserve o comportamento de GuestRoute, PrivateRoute, PermissionRoute e RootRedirect.
Verifique as permissões de módulo e o comportamento de acesso negado.
Não use a ocultação de botões ou páginas como única proteção para operações privilegiadas.
Não altere caminhos públicos, redirecionamentos ou constantes de autenticação sem avaliar o impacto.
6.5 Engine de regras
Antes de alterar frontend/src/engine/, investigue a semântica das condições e ações existentes.
Preserve a compatibilidade das regras já armazenadas ou configuradas.
Adicione testes para condições de contorno e combinações relevantes.
Não altere silenciosamente a interpretação de regras existentes.
Documente mudanças que afetem a avaliação ou execução das regras.
7. Segurança e configuração
Nunca inclua secrets, tokens, senhas, cookies ou credenciais em código, documentação, fixtures ou logs.
Nunca copie valores secretos de arquivos .env para respostas ou commits.
Use os mecanismos de configuração e secrets já adotados pelo projeto.
Não versione arquivos de ambiente com credenciais.
Não enfraqueça CORS, autenticação, autorização ou políticas de cookies para resolver problemas temporariamente.
Trate dados de entrada como não confiáveis.
Evite SQL inseguro, exposição de informações internas e mensagens de erro que revelem dados sensíveis.
Avalie permissões e exposição de dados em endpoints, relatórios e operações administrativas.
Não altere portas, redes, volumes ou exposição de serviços sem compreender os impactos operacionais.
Não execute comandos destrutivos, operações remotas ou alterações em produção sem autorização explícita.
8. Infraestrutura e CI/CD
Inspecione os arquivos Docker Compose, Dockerfiles, configurações Traefik e scripts de deploy antes de modificá-los.
Preserve a separação entre os projetos frontend e backend.
Respeite a estratégia blue-green e o mecanismo de seleção dos slots ativos.
Não presuma qual slot está ativo com base apenas em nomes ou arquivos versionados.
Verifique como os arquivos dinâmicos do Traefik são atualizados pelo deploy.
Não altere o fluxo de produção para contornar falhas de build ou health check.
Preserve os endpoints de health check, salvo quando a tarefa exigir uma mudança coordenada.
Evite alterações incompatíveis entre imagens, variáveis de ambiente, redes Docker e serviços.
Não publique imagens, execute deploy ou altere infraestrutura remota sem autorização explícita.
Não considere uma imagem construída como evidência suficiente de que o deploy ou a aplicação em produção estão saudáveis.
Ao alterar CI, verifique se as etapas continuam compatíveis com Node.js 22, lockfiles e scripts existentes.
9. Testes e validação

Use os scripts efetivamente declarados nos package.json e a configuração real do repositório.

Backend

Verifique, conforme o escopo:

Build NestJS.
Testes unitários pertinentes.
Testes e2e quando relevantes.
Validação de DTOs e contratos HTTP.
Regras de autenticação e autorização.
Compatibilidade das migrations e consultas.
Comportamento de integrações externas.

Scripts documentados na arquitetura, sujeitos à confirmação no backend/package.json:

npm run build
npm test
npm run test:e2e
npm run migration:show
npm run migration:run

Não execute migrations apenas para validar uma alteração de código.

Frontend

Verifique, conforme o escopo:

Build Vite.
ESLint.
Tipos TypeScript, conforme os scripts disponíveis.
Testes existentes.
Comportamento das rotas e guards.
Integração com API e tratamento de erros.
Cache e invalidação do TanStack Query.
Estados de carregamento, sucesso, vazio e falha nas telas alteradas.

Scripts documentados na arquitetura, sujeitos à confirmação no frontend/package.json:

npm run dev
npm run build
npm run lint
npm run preview

Não presuma que o comando dev é uma verificação de qualidade ou que preview executa testes.

Critérios de conclusão
Não declare uma verificação aprovada sem executá-la e observar seu resultado.
Diferencie testes executados de testes apenas recomendados.
Informe quando dependências, serviços externos, credenciais ou infraestrutura impedirem a validação.
Se o CI não cobrir uma verificação relevante, informe essa limitação quando pertinente.
Não aumente o escopo da tarefa apenas para corrigir falhas preexistentes sem avaliar o impacto.
10. Documentação e conhecimento do projeto
Consulte a documentação existente antes de criar outra fonte de verdade.
Mantenha documentação sincronizada com alterações relevantes de comportamento, arquitetura, endpoints, configuração e operação.
Prefira documentar decisões duradouras e informações que realmente acelerem tarefas futuras.
Evite duplicar integralmente este arquivo em outros documentos.
Não registre valores secretos, dados pessoais reais ou informações operacionais sensíveis.
Distinga fatos confirmados no código de hipóteses e comportamentos que dependem do ambiente.
Se o código contradisser a documentação, investigue a divergência antes de decidir qual deve prevalecer.
Atualize o documento de arquitetura quando uma mudança estrutural tornar suas informações obsoletas, se isso fizer parte do escopo autorizado.
11. Gestão de escopo e alterações
Inspecione git status antes de alterações relevantes para identificar trabalho preexistente.
Nunca descarte alterações do usuário sem autorização.
Não use comandos como git reset --hard, git clean -fd ou equivalentes destrutivos sem autorização explícita.
Não reverta arquivos apenas para simplificar a implementação.
Não modifique lockfiles manualmente quando o gerenciador de pacotes puder atualizá-los corretamente.
Não atualize dependências por iniciativa própria se a tarefa não exigir isso.
Ao alterar uma dependência, explique a necessidade e verifique o impacto.
Prefira mudanças pequenas e fáceis de revisar.
Preserve alterações não relacionadas já presentes na working tree.
12. Autonomia e comunicação

Trabalhe com autonomia dentro do escopo autorizado.

Para tarefas claras, localizadas e reversíveis, investigue, implemente e valide sem solicitar aprovação a cada etapa.
Para alterações arquiteturais, migrações destrutivas, mudanças de segurança, dependências críticas ou ações em produção, apresente riscos e solicite autorização antes da execução quando necessário.
Não peça ao usuário informações que possam ser obtidas com segurança inspecionando o repositório.
Não interrompa o trabalho por detalhes de implementação de baixo risco que possam ser resolvidos seguindo os padrões existentes.
Quando houver alternativas relevantes, apresente as opções e recomende uma com justificativa breve.
Não confunda autonomia com autorização para publicar, implantar ou destruir dados.
13. Definição de pronto

Uma tarefa está concluída quando:

O comportamento solicitado foi implementado dentro do escopo.
A solução segue os padrões arquiteturais relevantes.
Os riscos de segurança e compatibilidade foram considerados.
Os testes e verificações pertinentes foram executados quando viável.
O diff foi revisado para identificar alterações desnecessárias.
A documentação foi atualizada quando necessário.
O resultado foi reportado com evidências, limitações e pendências.

O objetivo não é produzir mais código ou mais documentação. É entregar a menor solução confiável, verificável e sustentável para o KomissX.