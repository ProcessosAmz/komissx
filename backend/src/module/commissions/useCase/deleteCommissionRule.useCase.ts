import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
  } from "@nestjs/common";
  import { CommissionRulesRepository } from "@/module/commissions/repository/index.repository";
  import { getErrorMessage } from "@/utils/error.utils";
  
  @Injectable()
  export class DeleteCommissionRuleUseCase {
    private readonly logger = new Logger(DeleteCommissionRuleUseCase.name);
  
    constructor(
      private readonly commissionRulesRepository: CommissionRulesRepository,
    ) {}
  
    async execute(id: number) {
      this.logger.log(`Deactivating commission value: ${id}`);
  
      try {
        const rule = await this.commissionRulesRepository.findById(id);
  
        if (!rule) {
          throw new NotFoundException("Valor de comissão não encontrado");
        }
  
        const data = await this.commissionRulesRepository.update(rule, {
          ativo: false,
        });
  
        return { data, message: "Valor removido com sucesso" };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
  
        const message = getErrorMessage(error);
        this.logger.error(`Failed to delete commission value: ${message}`, (error as Error)?.stack);
        throw new InternalServerErrorException("Erro ao remover valor de comissão");
      }
    }
  }