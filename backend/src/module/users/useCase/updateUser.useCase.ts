import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { BetterAuthRepository } from "@/module/auth/repository/betterAuth.repository";
import { RolesRepository } from "@/module/roles/repository/index.repository";
import { UpdateUserDto } from "@/module/users/dto";
import { Users } from "@/module/users/entities/users.entity";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { UpdateUserData } from "@/module/users/types/user";
import { getErrorMessage } from "@/utils/error.utils";

function isSupervisorRole(roleName: string) {
    return roleName.toUpperCase().includes("SUPERVISOR");
}

function isLiderRole(roleName: string) {
    const normalized = roleName.toUpperCase();
    return normalized.includes("LIDER") || normalized.includes("LÍDER");
}

@Injectable()
export class UpdateUserUseCase {
    private readonly logger = new Logger(UpdateUserUseCase.name);

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly rolesRepository: RolesRepository,
        private readonly betterAuthRepository: BetterAuthRepository,
    ) { }

    async execute(userId: string, body: UpdateUserDto) {
        this.logger.log(`Attempting to update user: ${userId}`);

        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException("Usuário não encontrado");
        }

        if (body.email) {
            const emailOwner = await this.usersRepository.findByEmail(body.email);

            if (emailOwner && emailOwner.id !== userId) {
                throw new ConflictException("Este email já está em uso.");
            }
        }

        const nextRoleId = body.roleId ?? user.roleId;
        const nextRole = await this.rolesRepository.findById(nextRoleId);

        if (!nextRole) {
            throw new BadRequestException("Cargo inválido");
        }

        const nextRoleName = nextRole.name.trim().toUpperCase();
        const nextSupervisorId = await this.resolveSupervisorId(
            userId,
            user,
            body,
            nextRoleName,
        );

        const reportsCount = await this.usersRepository.countBySupervisorId(userId);
        const becomesLeafRole =
            !isSupervisorRole(nextRoleName) && !isLiderRole(nextRoleName);

        if (reportsCount > 0 && becomesLeafRole) {
            throw new BadRequestException(
                "Realoque os liderados antes de alterar o cargo.",
            );
        }

        try {
            const passwordHash = body.password
                ? await this.betterAuthRepository.hashPassword(body.password)
                : undefined;

            const updateData: UpdateUserData = {
                name: body.name ?? user.name,
                email: body.email ?? user.email,
                hubsoftId:
                    body.hubsoftId !== undefined ? body.hubsoftId : user.hubsoftId,
                roleId: nextRoleId,
                empresaId: body.empresaId ?? user.empresaId,
                unidadeId: body.unidadeId ?? user.unidadeId,
                supervisorId: nextSupervisorId,
                participaFechamento:
                    body.participaFechamento ?? user.participaFechamento,
                active: body.active ?? user.active,
            };

            if (passwordHash) {
                updateData.password = passwordHash;
            }

            const updatedUser = await this.usersRepository.update(user, updateData);

            await this.betterAuthRepository.updateCredentialUser({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: nextRoleName,
                active: updatedUser.active,
            });

            if (passwordHash) {
                await this.betterAuthRepository.updatePassword(
                    updatedUser.id,
                    passwordHash,
                );
            }

            this.logger.log(`User updated successfully: ${updatedUser.email}`);

            return {
                data: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                },
                message: "Usuário atualizado com sucesso",
            };
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof ConflictException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            const message = getErrorMessage(error);
            this.logger.error(
                `Failed to update user: ${message}`,
                (error as Error)?.stack,
            );
            throw new InternalServerErrorException("Erro ao atualizar usuário");
        }
    }

    private async resolveSupervisorId(
        userId: string,
        user: Users,
        body: UpdateUserDto,
        nextRoleName: string,
    ): Promise<string | null> {
        if (isSupervisorRole(nextRoleName)) {
            return null;
        }

        const nextSupervisorId =
            body.supervisorId !== undefined ? body.supervisorId : user.supervisorId;

        if (!nextSupervisorId) {
            throw new BadRequestException(
                isLiderRole(nextRoleName)
                    ? "Informe o supervisor."
                    : "Informe o líder ou o supervisor.",
            );
        }

        if (nextSupervisorId === userId) {
            throw new BadRequestException("O usuário não pode responder a si mesmo.");
        }

        const parent = await this.usersRepository.findByIdWithRole(nextSupervisorId);

        if (!parent?.role) {
            throw new BadRequestException("Responsável não encontrado.");
        }

        const parentRoleName = parent.role.name.trim().toUpperCase();

        if (isLiderRole(nextRoleName) && !isSupervisorRole(parentRoleName)) {
            throw new BadRequestException("O líder deve responder a um supervisor.");
        }

        if (
            !isLiderRole(nextRoleName) &&
            !isLiderRole(parentRoleName) &&
            !isSupervisorRole(parentRoleName)
        ) {
            throw new BadRequestException(
                "Este cargo deve responder a um líder ou a um supervisor.",
            );
        }

        const createsCycle = await this.wouldCreateCycle(userId, nextSupervisorId);

        if (createsCycle) {
            throw new BadRequestException("Não é possível vincular a um liderado.");
        }

        return nextSupervisorId;
    }

    private async wouldCreateCycle(
        userId: string,
        supervisorId: string,
    ): Promise<boolean> {
        let currentSupervisorId: string | null = supervisorId;
        const visitedIds = new Set<string>();

        while (currentSupervisorId) {
            if (currentSupervisorId === userId) {
                return true;
            }

            if (visitedIds.has(currentSupervisorId)) {
                return true;
            }

            visitedIds.add(currentSupervisorId);

            const currentUser = await this.usersRepository.findById(
                currentSupervisorId,
            );
            currentSupervisorId = currentUser?.supervisorId ?? null;
        }

        return false;
    }
}