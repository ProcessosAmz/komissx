# Escopo de implementação — Fechamentos financeiros

## Escopo autorizado

Esta implementação aplica-se exclusivamente a:
- **Retirada** (`RETIRADA`): conciliação do Metabase com planilhas de entrega/estoque; regras por UF; conferência e bloqueios; autorização e confirmação de pagamento; histórico e relatórios.
- **Vendas Autônomos** (`VENDAS_AUTONOMOS`): conferência baseada no Metabase; regras de comissão versionadas; beneficiários mapeados explicitamente; autorizações, pagamentos, ajustes, reversões e relatórios.

## Fora do escopo

**Fechamento Técnico Terceirizados deve permanecer sem qualquer alteração funcional.** Não modificar sua tela, endpoints, cálculo, fontes, regras, documentos ou fluxo. A nova persistência identifica apenas as duas modalidades autorizadas e usa tabelas próprias.

## Salvaguardas

- Nenhum deploy ou execução de migration em produção é feito por esta alteração.
- Migrations são explícitas; não habilitar `synchronize` nem `migrationsRun`.
- Nenhum histórico financeiro antigo será migrado automaticamente.
- Mudanças de valores de ajustes/reversões devem criar nova versão; a versão anterior e sua aprovação permanecem preservadas e a nova versão exige confirmação.
- Aprovação financeira não equivale a pagamento. Pagamento só é confirmado por ação manual autorizada e auditada.
- Snapshots preservam regras, beneficiários, relatórios e origem para que mudanças futuras não alterem fechamentos já calculados.
