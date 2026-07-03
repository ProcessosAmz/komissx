import type { Action, ClosingLine, FinancialStatus } from "./types";
import { getPath } from "./conditions";

export interface EngineState {
    line: ClosingLine;
    valorAPagar: number;
    statusFinanceiro: FinancialStatus;
    observacoes: string[];
}

export function applyAction(action: Action, state: EngineState): void {
    switch (action.tipo) {
        case "SET_VALOR": {
            const exp = action.expressao;
            switch (exp.tipo) {
                case "FIXO":
                    state.valorAPagar = exp.valor;
                    return;
                case "PERCENTUAL_VALOR_BASE":
                    state.valorAPagar = state.line.valorBase * (exp.percentual / 100);
                    return;
                case "FAIXA": {
                    const sorted = [...exp.faixas].sort((a, b) => a.ate - b.ate);
                    const faixa = sorted.find((f) => state.line.valorBase <= f.ate) ?? sorted.at(-1);
                    if (faixa) state.valorAPagar = faixa.valor;
                    return;
                }
            }
            return;
        }
        case "SET_STATUS_FINANCEIRO":
            state.statusFinanceiro = action.status;
            return;
        case "BONUS_FIXO":
            state.valorAPagar += action.valor;
            return;
        case "PORCENTAGEM_SOBRE": {
            const base = Number(getPath(state.line, action.campo)) || 0;
            state.valorAPagar = base * (action.percentual / 100);
            return;
        }
        case "OBSERVAR":
            state.observacoes.push(action.texto);
            return;
    }
}
