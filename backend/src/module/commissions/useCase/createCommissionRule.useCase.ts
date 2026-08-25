import {
    Injectable,
    InternalServerErrorException,
    Logger,
  } from "@nestjs/common";
  import { CommissionEvent } from "@/common/enums/commissionEvent.enum";
  import { CommissionRuleType } from "@/common/enums/commissionRuleType.enum";
  import { CreateCommissionRuleDto } from "@/module/commissions/dto/createCommissionRule.dto";
  import { CommissionRulesRepository } from "@/module/commissions/repository/index.repository";
  import { getErrorMessage } from "@/utils/error.utils";
  
  @Injectable()
  export class CreateCommissionRuleUseCase {
    private readonly logger = new Logger(CreateCommissionRuleUseCase.name);
  
    constructor(
      private readonly commissionRulesRepository: CommissionRulesRepository,
    ) {}
  
    async execute(body: CreateCommissionRuleDto) {
      this.logger.log(`Creating commission value: ${body.nome}`);
  
      try {
        const nome = body.nome.trim();
        const filters =
          body.evento === CommissionEvent.SALE && nome.toUpperCase() === "PADRAO"
            ? "PADRAO"
            : nome.toUpperCase();
  
        const data = await this.commissionRulesRepository.create({
          nome,
          evento: body.evento,
          filters,
          ruleType: CommissionRuleType.FIXED,
          valor: body.valor,
          config: { alias: filters },
          ativo: true,
        });
  
        return { data, message: "Valor criado com sucesso" };
      } catch (error) {
        const message = getErrorMessage(error);
        this.logger.error(`Failed to create commission value: ${message}`, (error as Error)?.stack);
        throw new InternalServerErrorException("Erro ao criar valor de comissão");
      }
    }
  }