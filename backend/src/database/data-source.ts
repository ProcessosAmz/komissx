import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Pais, Estado, Cidade } from '@/module/localidade/entities';
import { Empresas } from '@/module/empresas/entities/empresas.entity';
import { Unidades } from '@/module/unidades/entities/unidades.entity';
import { Users } from '@/module/users/entities/users.entity';
import { Role } from '@/module/roles/entities/role.entity';

config({ path: '.env' });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Users, Pais, Estado, Cidade, Empresas, Unidades, Role],
  migrations: ['src/migrations/*.ts'],
});