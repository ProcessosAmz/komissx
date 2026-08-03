import { Module } from '@nestjs/common';
import { IntegrationsModule } from './integrations/index.module';
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
    IntegrationsModule,
    ConfiguracoesModule
  ],
})
export class AppModule {}
