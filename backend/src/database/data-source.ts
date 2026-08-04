import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../module/users/entities/user.entity';
import { Pais, Estado, Cidade } from '@/module/localidade/entities';
import { Operadora } from '@/module/operadoras/entities/operadora.entity';
import { Regional } from '@/module/regionais/entities/regional.entity';

config({ path: '.env' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Pais, Estado, Cidade, Operadora, Regional],
  migrations: ['src/migrations/*.ts'],
});