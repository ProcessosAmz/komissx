import { IntegrationsModule } from "@/integrations/index.module";
import { RedisModule } from "@/integrations/redis/index.module";
import { AuthModule } from "@/module/auth/index.module";
import { EmpresasModule } from "@/module/empresas/index.module";
import { HealthModule } from "@/module/health/index.module";
import { LocalidadeModule } from "@/module/localidade/index.module";
import { LoggerModule } from "@/module/logger/index.module";
import { PermissionsModule } from "@/module/permissions/index.module";
import { RolesModule } from "@/module/roles/index.module";
import { UnidadesModule } from "@/module/unidades/index.module";
import { UsersModule } from "@/module/users/index.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommissionsModule } from "@/module/commissions/index.module";
import { postgresPoolConfig, handlePostgresPoolError } from "@/database/postgresPool.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env.development.local", ".env.development", ".env"],
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      migrations: [`${__dirname}/migrations/*{.js}`],
      migrationsRun: false,
      extra: postgresPoolConfig,
      retryAttempts: 5,
      retryDelay: 2000,
      poolErrorHandler: handlePostgresPoolError,
    }),
    LocalidadeModule,
    EmpresasModule,
    UnidadesModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    AuthModule,
    IntegrationsModule,
    LoggerModule,
    RedisModule,
    HealthModule,
    CommissionsModule,
  ],
})
export class AppModule {}