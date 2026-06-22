import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommissionsModule } from './commissions/commissions.module';
import { CommissionRoleModule } from './commission_rule/commission_rule.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
        ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development' , '.env'],
    }), 
  TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  migrations: [`${__dirname}/../migration/{.ts,*.js}`],
  migrationsRun: true,
  synchronize: true,
  }), 

  UsersModule, CommissionsModule, CommissionRoleModule, ReportsModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
