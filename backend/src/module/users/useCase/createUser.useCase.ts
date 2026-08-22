import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { BetterAuthRepository } from "@/module/auth/repository/betterAuth.repository";
import { CreateUserDto } from "@/module/users/dto";
import { UsersRepository } from "@/module/users/repository/index.repository";
import { getErrorMessage } from "@/utils/error.utils";

@Injectable()
export class CreateUserUseCase {
    private readonly logger = new Logger(CreateUserUseCase.name);

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly betterAuthRepository: BetterAuthRepository,
    ) { }

    async execute(body: CreateUserDto) {
        this.logger.log(`Attempting to create user: ${body.email}`);

        const emailAlreadyRegistered = await this.usersRepository.findByEmail(
            body.email,
        );

        if (emailAlreadyRegistered) {
            this.logger.warn(`Email already registered: ${body.email}`);
            throw new ConflictException("Email já cadastrado");
        }

        try {
            const passwordHash = await this.betterAuthRepository.hashPassword(
                body.password,
            );

            const user = await this.usersRepository.create({
                ...body,
                password: passwordHash,
            });

            const userWithRole = await this.usersRepository.findByIdWithRole(
                user.id,
            );

            if (!userWithRole?.role) {
                throw new InternalServerErrorException("Erro ao criar usuário");
            }

            await this.betterAuthRepository.createCredentialUser({
                id: user.id,
                name: user.name,
                email: user.email,
                role: userWithRole.role.name.trim().toUpperCase(),
                active: user.active,
                passwordHash,
            });

            this.logger.log(`User created successfully: ${user.email}`);

            return {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                message: "Usuário criado com sucesso",
            };
        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }

            const message = getErrorMessage(error);
            this.logger.error(
                `Failed to create user: ${message}`,
                (error as Error)?.stack,
            );
            throw new InternalServerErrorException("Erro ao criar usuário");
        }
    }
}