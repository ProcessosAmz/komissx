import type { ClosingLine, ClosingResult, Rule, Condition } from "./types";
import { getPath } from "./conditions";
import { applyAction } from "./actions";

export function selectCandidates(line: ClosingLine, rules: Rule[]): Rule[] {
    return rules.filter((r) => {
        if (!r.ativa) return false;
        const e = r.escopo;
        if (e.empresa && e.empresa !== line.empresa) return false;
        if (e.unidade && e.unidade !== line.unidade) return false;
        if (e.relatorio && e.relatorio !== line.relatorio) return false;
        if (e.tipoPessoa && e.tipoPessoa !== line.pessoa.tipo) return false;
        if (e.nomeContem && !line.pessoa.nome.toUpperCase().includes(e.nomeContem.toUpperCase())) return false;
        if (e.grupo && e.grupo !== line.pessoa.grupo) return false;
        return true;
    });
}

export function evaluateCondition(cond: Condition, line: ClosingLine): boolean {
    switch (cond.op) {
        case "OR": return cond.items.some((c) => evaluateCondition(c, line));
        case "NOT": return !evaluateCondition(cond.item, line);
        case "eq": return getPath(line, cond.campo) === cond.valor;
        case "neq": return getPath(line, cond.campo) !== cond.valor;
        case "gte": return Number(getPath(line, cond.campo)) >= cond.valor;
        case "lte": return Number(getPath(line, cond.campo)) <= cond.valor;
        case "in": return cond.valor.includes(getPath(line, cond.campo) as never);
        case "contains":
            return String(getPath(line, cond.campo) ?? "")
                .toLowerCase()
                .includes(cond.valor.toLowerCase());
    }
}

export function evaluateConditions(conds: Condition[], line: ClosingLine): boolean {
    return conds.every((c) => evaluateCondition(c, line));
}

export function evaluateLine(line: ClosingLine, rules: Rule[]): ClosingResult {
    const rule = selectCandidates(line, rules).find((r) => evaluateConditions(r.condicoes, line));

    if (!rule) {
        return {
            lineId: line.id,
            valorAPagar: 0,
            statusFinanceiro: "NAO_PAGO",
            regraAplicadaId: "DEFAULT",
            regraVersao: 0,
            calculadoEm: new Date().toISOString(),
            observacoes: "Nenhuma regra compatível",
        };
    }

    const state = {
        line,
        valorAPagar: line.valorBase,
        statusFinanceiro: "NAO_PAGO" as const,
        observacoes: [] as string[],
    };

    for (const action of rule.acoes) applyAction(action, state);

    return {
        lineId: line.id,
        valorAPagar: round2(state.valorAPagar),
        statusFinanceiro: state.statusFinanceiro,
        regraAplicadaId: rule.id,
        regraVersao: rule.versao,
        calculadoEm: new Date().toISOString(),
        observacoes: state.observacoes.length ? state.observacoes.join(" · ") : undefined,
    };
}

export function evaluateClosing(lines: ClosingLine[], rules: Rule[]): ClosingResult[] {
    return lines.map((l) => evaluateLine(l, rules));
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
