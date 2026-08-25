import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { BetterAuthRepository } from "@/module/auth/repository/betterAuth.repository";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { rethrowOrInternalError } from "@/utils/error.utils";

@Injectable()
export class DeleteUserUseCase {
    private readonly logger = new Logger(DeleteUserUseCase.name);

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly betterAuthRepository: BetterAuthRepository,
    ) { }

    async execute(userId: string, actorId: string) {
        this.logger.log(`Attempting to delete user: ${userId}`);

        const user = await this.usersRepository.findByIdWithRole(userId);

        if (!user) {
            throw new NotFoundException("Usuário não encontrado");
        }

        if (userId === actorId) {
            throw new BadRequestException("Você não pode remover o próprio usuário.");
        }

        const reportsCount = await this.usersRepository.countBySupervisorId(userId);

        if (reportsCount > 0) {
            throw new BadRequestException(
                "Realoque os liderados antes de remover o usuário.",
            );
        }

        try {
            const deletedUser = await this.usersRepository.update(user, {
                name: user.name,
                email: user.email,
                hubsoftId: user.hubsoftId,
                roleId: user.roleId,
                empresaId: user.empresaId,
                unidadeId: user.unidadeId,
                supervisorId: user.supervisorId,
                participaFechamento: user.participaFechamento,
                active: false,
            });

            await this.betterAuthRepository.updateCredentialUser({
                id: deletedUser.id,
                name: deletedUser.name,
                email: deletedUser.email,
                role: (user.role?.name ?? "").trim().toUpperCase(),
                active: false,
            });

            this.logger.log(`User deleted successfully: ${deletedUser.email}`);

            return {
                data: {
                    id: deletedUser.id,
                    name: deletedUser.name,
                    email: deletedUser.email,
                },
                message: "Usuário removido com sucesso",
            };
        } catch (error) {
            rethrowOrInternalError(
                error,
                this.logger,
                "Failed to delete user",
                "Erro ao remover usuário",
            );
        }
    }
}