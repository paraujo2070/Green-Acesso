// src/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import boletoRoutes from './routes/BoletoRoutes';
import sequelize from './database';

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Rotas
app.use('/', boletoRoutes);

async function iniciarServidor() {
  try {
    // Sincroniza o banco de dados, criando as tabelas se não existirem
    await sequelize.sync();
    console.log('Banco de dados sincronizado com sucesso.');

    // Inicia o servidor
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (erro) {
    console.error('Não foi possível conectar ao banco de dados:', erro);
  }
}

iniciarServidor();