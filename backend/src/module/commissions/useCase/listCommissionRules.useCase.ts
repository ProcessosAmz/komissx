import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { CommissionRulesRepository } from "@/module/commissions/repository/index.repository";
import { getErrorMessage } from "@/utils/error.utils";

@Injectable()
export class ListCommissionRulesUseCase {
    private readonly logger = new Logger(ListCommissionRulesUseCase.name);

    constructor(
        private readonly commissionRulesRepository: CommissionRulesRepository,
    ) { }

    async execute() {
        this.logger.log("Listing commission catalog values");

        try {
            const data = await this.commissionRulesRepository.findActive();

            return {
                data,
                message: "Comissões listadas com sucesso",
            };
        } catch (error) {
            const message = getErrorMessage(error);
            this.logger.error(
                `Failed to list commission rules: ${message}`,
                (error as Error)?.stack,
            );
            throw new InternalServerErrorException("Erro ao listar comissões");
        }
    }
}