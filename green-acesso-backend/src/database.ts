// src/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost', // Ou o endereço do seu servidor PostgreSQL
  port: 5432,       // Porta padrão do PostgreSQL
  username: 'postgres', // Seu nome de usuário do PostgreSQL
  password: '123456', // Sua senha do PostgreSQL
  database: 'postgres', // O nome do banco de dados que você vai usar
  logging: false, // Desabilita o log de queries SQL
});

export default sequelize;