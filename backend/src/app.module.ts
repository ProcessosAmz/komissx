import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommissionsModule } from './commissions/commissions.module';
import { CommissionRuleModule } from './commission_rule/commission_rule.module';
import { ReportsModule } from './reports/reports.module';
import { UserRolesModule } from './user_roles/user_roles.module';
import { RolesModule } from "./roles/roles.module";
import { CommissionEngineModule } from './commission_engine/commission_engine.module';
import { UserPermissionsModule } from './user_permissions/user_permissions.module';
import { RolePermissionsModule } from './role_permissions/role_permissions.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ConfigModule } from '@nestjs/config';
//import { TypeOrmModule } from '@nestjs/typeorm';


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
    CommissionsModule,
    CommissionRuleModule,
    ReportsModule,
    UserRolesModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserPermissionsModule,
    CommissionEngineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
