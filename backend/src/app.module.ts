import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from './permissions/permissions.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ConfigModule } from '@nestjs/config';
import { ConfiguracoesModule } from './module/configuracoes/index.module';


@Module({
  imports: [
        ConfigModule.forRoot({
      envFilePath: [".env.development.local", ".env.development", ".env"],
    }),
  // TypeOrmModule.forRoot({
  // type: 'postgres',
    // host: process.env.DB_HOST,
  // port: Number(process.env.DB_PORT),
  // username: process.env.DB_USERNAME,
  // database: process.env.DB_DATABASE,
  // password: process.env.DB_PASSWORD,
  // autoLoadEntities: true,
  // migrations: [`${__dirname}/../migration/{.ts,*.js}`],
  // migrationsRun: true,
  // synchronize: true,
    // }),
    UsersModule,
    ReportsModule,
    RolesModule,
    PermissionsModule,
    IntegrationsModule,
    ConfiguracoesModule
  ],
})
export class AppModule {}
