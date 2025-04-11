# Desafio Técnico Backend Green Acesso

Este projeto implementa um backend em Node.js com TypeScript para importar dados de arquivos CSV e PDF, além de fornecer funcionalidades para listar e gerar relatórios de boletos.

## Tecnologias Utilizadas

* Node.js
* TypeScript
* Express
* Sequelize (com PostgreSQL como banco de dados)
* Multer (para upload de arquivos)
* csv-parser (para processar arquivos CSV)
* pdf-parse (para ler informações de arquivos PDF)
* pdf-lib (para gerar arquivos PDF)
* dotenv (para gerenciamento de variáveis de ambiente)

## Pré-requisitos

* Node.js e npm (ou yarn) instalados
* PostgreSQL instalado e rodando
* Configuração das variáveis de ambiente no arquivo `.env` (informações de conexão com o banco de dados)

## Como Executar o Projeto

1.  Clone o repositório (se você o tiver versionado).
2.  Navegue até a pasta do projeto no terminal.
3.  Instale as dependências: `npm install` ou `yarn install`.
4.  Configure as variáveis de ambiente no arquivo `.env` com as suas informações de conexão com o PostgreSQL.
5.  Crie o banco de dados: `npx sequelize-cli db:create`.
6.  Execute as migrations para criar as tabelas: `npx sequelize-cli db:migrate`.
7.  Você pode executar seeders para popular a tabela de lotes com dados de exemplo (opcional): `npx sequelize-cli db:seed:all`.
8.  Inicie o servidor em modo de desenvolvimento: `npm run dev` ou `yarn dev`.
9.  O servidor estará rodando em `http://localhost:3000` (ou a porta configurada no `.env`).

## Endpoints da API

* **POST /importar/csv**: Recebe um arquivo CSV no campo `csvFile` e importa os dados para a tabela `boletos`, mapeando a unidade com o ID do lote.
* **POST /importar/pdf**: Recebe um arquivo PDF contendo múltiplos boletos (ordem fixa) no campo `pdfFile` e salva cada página como um arquivo PDF individual na pasta `data/boletos_pdf`, nomeado com o ID do boleto correspondente.
* **GET /boletos**: Retorna uma lista de todos os boletos. Permite filtros por `nome`, `valor_inicial`, `valor_final` e `id_lote` através de query parameters.
* **GET /boletos?relatorio=1**: Retorna um Base64 encoded PDF com um relatório dos boletos (aplicando os mesmos filtros que o endpoint `/boletos`).

## Observações

* A pasta `uploads/` é utilizada para armazenar temporariamente os arquivos enviados.
* O mapeamento entre o nome da unidade no CSV e o ID do lote é feito buscando os lotes existentes no banco de dados. Certifique-se de que a tabela `lotes` esteja populada com os nomes corretos.

Este é um ponto de partida para o seu projeto. Você precisará adaptar e completar o código conforme as suas necessidades e aprofundar em cada funcionalidade. Lembre-se de tratar os erros e validar os dados de forma adequada.