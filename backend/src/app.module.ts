import { IntegrationsModule } from "@/integrations/index.module";
import { RedisModule } from "@/integrations/redis/index.module";
import { EmpresasModule } from "@/module/empresas/index.module";
import { LocalidadeModule } from "@/module/localidade/index.module";
import { LoggerModule } from "@/module/logger/index.module";
import { PermissionsModule } from "@/module/permissions/index.module";
import { RolesModule } from "@/module/roles/index.module";
import { UnidadesModule } from "@/module/unidades/index.module";
import { UsersModule } from "@/module/users/index.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

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
    }),
    LocalidadeModule,
    EmpresasModule,
    UnidadesModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    IntegrationsModule,
    LoggerModule,
    RedisModule,
  ],
})
export class AppModule {}
