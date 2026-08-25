import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
  } from "@nestjs/common";
  import { UpdateCommissionRuleDto } from "@/module/commissions/dto/updateCommissionRule.dto";
  import { CommissionRulesRepository } from "@/module/commissions/repository/index.repository";
  import { getErrorMessage } from "@/utils/error.utils";
  
  @Injectable()
  export class UpdateCommissionRuleUseCase {
    private readonly logger = new Logger(UpdateCommissionRuleUseCase.name);
  
    constructor(
      private readonly commissionRulesRepository: CommissionRulesRepository,
    ) {}
  
    async execute(id: number, body: UpdateCommissionRuleDto) {
      this.logger.log(`Updating commission value: ${id}`);
  
      try {
        const rule = await this.commissionRulesRepository.findById(id);
  
        if (!rule) {
          throw new NotFoundException("Valor de comissão não encontrado");
        }
  
        const nome = body.nome?.trim();
        const data = await this.commissionRulesRepository.update(rule, {
          nome: nome ?? rule.nome,
          filters: nome ? nome.toUpperCase() : rule.filters,
          valor: body.valor ?? rule.valor,
        });
  
        return { data, message: "Valor atualizado com sucesso" };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
  
        const message = getErrorMessage(error);
        this.logger.error(`Failed to update commission value: ${message}`, (error as Error)?.stack);
        throw new InternalServerErrorException("Erro ao atualizar valor de comissão");
      }
    }
  }