import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../module/users/entities/user.entity';

config({ path: '.env' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // entities: ['src/module/**/*.entity.ts'],
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});