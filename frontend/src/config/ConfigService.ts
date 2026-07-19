// features/fechamentos/services/ConfigService.ts
import { RuleEngineConfig } from '../types';

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

  public async loadConfigurations(): Promise<RuleEngineConfig> {
    if (this.cachedConfig) return this.cachedConfig;

    try {
      // Atualmente lendo do Mock local, amanhã substituído por: fetch('/api/v1/rules')
      const response = await import('@/data/rules.json');
      this.cachedConfig = response.default as unknown as RuleEngineConfig;
      return this.cachedConfig;
    } catch (error) {
      throw new Error("Erro catastrófico ao carregar o Motor de Regras (RuleEngine)");
    }
  }
}