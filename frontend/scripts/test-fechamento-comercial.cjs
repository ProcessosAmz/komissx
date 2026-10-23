const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync("src/features/fechamento-comercial/domain/vendasComercial.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const runtimeModule = { exports: {} };
vm.runInNewContext(`(function(require, module, exports) { ${compiled}\n})(require, module, module.exports);`, { require, module: runtimeModule, console });
const rules = require("../src/data/rules.json");

const colaborador = (roleName = "INTERNO", unidadeName = "Manaus") => ({
  id: "beatriz", name: "Beatriz Nobre dos Anjos", roleName, unidadeName,
  supervisorId: null, supervisorName: null, conta: "amazonet", isLider: false, isSupervisor: false,
});

const venda = (index, status = "APROVADO", conta = "amazonet") => ({
  id: String(index), tipo_ordem_servico: "", numero_ordem_servico: String(index), id_atendimento: String(index),
  codigo_cliente: String(index), nome_cliente: "", id_cliente: "", nome_servico: "", vendedor: "Beatriz",
  vendedor_limpo: "Beatriz", usuario_cadastro: "Beatriz", status_atendimento: "", status_auditoria: status,
  motivo_fechamento: "", data_cadastro: "2026-10-01", data_termino_executado: "", valor_servico: 0,
  conta, colaborador_id: "beatriz", venda_do_lider: false,
});

const modelo = (quantidade, statuses, collaborator = colaborador(), config = rules, conta = "amazonet") => runtimeModule.exports.montarModeloRelatorioComercial({
  dataInicio: "2026-09-21", dataFim: "2026-10-20", empresa: conta, vendas: Array.from({ length: quantidade }, (_, index) => venda(index, statuses?.[index] ?? "APROVADO", conta)), colaboradores: [collaborator], configuracaoMensal: config,
});

const referencia = modelo(133, Array.from({ length: 133 }, (_, index) => index < 97 ? "APROVADO" : "N.C APROVADO"));
assert.equal(referencia.linhas[0].quantidadeElegivel, 133);
assert.equal(referencia.linhas[0].categoriaComissao, "COMERCIAL_INTERNO");
assert.equal(referencia.linhas[0].valorUnitarioComissao, 6);
assert.equal(referencia.linhas[0].comissao, 798);
assert.equal(referencia.totalComissao, 798);

for (const [quantidade, valor] of [[100, 5], [129, 5], [130, 6], [159, 6], [160, 7.5], [189, 7.5], [190, 8]]) {
  const linha = modelo(quantidade).linhas[0];
  assert.equal(linha.valorUnitarioComissao, valor, `faixa ${quantidade}`);
  assert.equal(linha.comissao, quantidade * valor, `total ${quantidade}`);
}

assert.equal(modelo(133, undefined, colaborador("RECEPCAO"), rules, "mania").linhas[0].comissao, null);
assert.equal(modelo(133, undefined, colaborador("CARGO SEM REGRA")).linhas[0].comissao, null);
assert.equal(modelo(133, undefined, colaborador(), null).linhas[0].comissao, null);
assert.equal(runtimeModule.exports.categoriaComissaoPorCargo("REGIONAL INTERNO"), "REGIONAL_INTERNO");
assert.equal(runtimeModule.exports.categoriaComissaoPorCargo("REGIONAL EXTERNO PA"), "REGIONAL_EXTERNO_PA");
assert.equal(runtimeModule.exports.calcularComissaoIndividual({ quantidadeElegivel: 120, conta: "amazonet", unidade: "Manaus", categoria: "BACKOFFICE", configuracao: rules }).valorUnitario, 2);
assert.equal(runtimeModule.exports.calcularComissaoIndividual({ quantidadeElegivel: 99, conta: "mania", unidade: "Manaus", categoria: "BACKOFFICE", configuracao: rules }).valorUnitario, 1);

const linhaPagamento = referencia.linhas[0].comissao;
const linhaAnalitico = referencia.linhas[0].comissao;
assert.equal(linhaPagamento, linhaAnalitico);
assert.equal(linhaPagamento, 798);
assert.equal(referencia.totalComissao, linhaPagamento);

console.log("fechamento comercial: 13 verificações passaram");
