import { CommissionRulesService, mapRulesToSemanal } from "@/service/commissionRulesService";
import { RuleEngineConfig } from "@/pages/Fechamentos/types";

export class ConfigService {
  private static instance: ConfigService;
  private cachedConfig: RuleEngineConfig | null = null;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public clearCache() {
    this.cachedConfig = null;
  }

  public async loadConfigurations(): Promise<RuleEngineConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    const local = (await import("@/data/rules.json")).default as unknown as RuleEngineConfig;
    const rules = await CommissionRulesService.findAll();
    const semanal = mapRulesToSemanal(rules.data);

    this.cachedConfig = {
      ...local,
      fechamento_semanal: {
        tecnicos_terceirizados: semanal.tecnicosTerceirizados,
        retirada_estado: semanal.retiradaEstado,
        autonomos: {
          valor_padrao: semanal.autonomos.valorPadrao,
          excecoes: semanal.autonomos.excecoes,
        },
      },
    };

    return this.cachedConfig;
  }
}