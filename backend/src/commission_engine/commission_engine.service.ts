import { Injectable } from "@nestjs/common";
import { CommissionRule } from "../commission_rule/entities/commission_rule.entity";

interface CommissionContext {
  totalSales?: number;
  username?: string;
  userId?: number;
}

@Injectable()
export class CommissionEngineService {
  calcular(rule: CommissionRule, context: CommissionContext): number {
    if (!rule.ativo) {
      return 0;
    }

    const exception = this.buscarExcecao(rule, context.username);
    if (exception !== null) {
      return exception;
    }

    switch (rule.ruleType) {
      case "fixed":
        return this.calcularFixo(rule);

      case "pattern":
        return this.calcularPattern(rule, context);

      case "tier":
        return this.calcularTier(rule, context);

      default:
        return 0;
    }
  }

  private buscarExcecao(
    rule: CommissionRule,
    username?: string,
  ): number | null {
    if (!username) {
      return null;
    }

    const value = rule.config?.exceptions?.specificUsers?.[username];

    return value !== undefined ? Number(value) : null;
  }

  private calcularFixo(rule: CommissionRule): number {
    return Number(rule.valor ?? 0);
  }

  private calcularPattern(
    rule: CommissionRule,
    context: CommissionContext,
  ): number {
    const suffix = rule.config?.endsWith;

    if (!suffix || !context.username) {
      return 0;
    }

    return context.username.endsWith(suffix) ? Number(rule.valor ?? 0) : 0;
  }

  private calcularTier(
    rule: CommissionRule,
    context: CommissionContext,
  ): number {
    const total = context.totalSales ?? 0;
    const tiers = rule.config?.tiers ?? [];

    const faixa = tiers.find((tier) => {
      const max = tier.max ?? Infinity;
      return total >= tier.min && total <= max;
    });

    if (!faixa) {
      return 0;
    }

    return rule.config?.multiplyByQty ? faixa.value * total : faixa.value;
  }
}
