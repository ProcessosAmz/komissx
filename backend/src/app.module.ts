import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './module/users/index.module';

@Module({
  imports: [
        ConfigModule.forRoot({
      envFilePath: [".env.development.local", ".env.development", ".env"],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
      migrationsRun: false,
    }),
    UsersModule,
  ],
})
export class AppModule {}
