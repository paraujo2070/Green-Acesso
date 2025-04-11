// src/controllers/BoletoController.ts
import { Request, Response } from 'express';
import csv from 'csv-parser';
import fs from 'fs';
import Boleto from '../models/Boleto';
import Lote from '../models/Lote';
import PdfParse from 'pdf-parse';
import path from 'path';
import { Op } from 'sequelize';
import { PDFDocument, StandardFonts } from 'pdf-lib';

class BoletoController {
  public async importarCSV(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ erro: 'Nenhum arquivo CSV foi enviado.' });
    }

    const resultados: any[] = [];
    const mapaLotes: { [key: string]: number } = {};
    const filePath = req.file!.path;
    try {
      // Busca todos os lotes para criar um mapeamento de nome para id
      const lotes = await Lote.findAll();
      lotes.forEach((lote) => {
        mapaLotes[lote.nome] = lote.id;
      });
      fs.createReadStream(req.file!.path)
        .pipe(csv({ separator: ',' }))
        .on('data', (data) => {
          console.log("Linha do CSV:", data);
          resultados.push(data)
        })
        .on('end', async () => {
          const boletosParaCriar = resultados.map((linha) => {
            const unidade = linha.Unidade.toString().padStart(4, '0'); // Garante que a unidade tenha 4 dígitos
            const id_lote = mapaLotes[unidade];

            if (!id_lote) {
              console.warn(`Lote não encontrado para a unidade: ${linha.unidade}`);
              return null; // Ignora esta linha se o lote não for encontrado
            }

            const valor = parseFloat(linha.Valor);

            return {
              nome_sacado: linha['Nome Sacado'],
              id_lote: id_lote,
              valor: valor,
              linha_digitavel: linha['Linha Digitável'],
            };
          }).filter(Boolean); // Remove entradas nulas

          if (boletosParaCriar.length > 0) {
            await Boleto.bulkCreate(boletosParaCriar as any);
            res.status(201).json({ mensagem: 'Dados do CSV importados com sucesso.' });
          } else {
            console.log("lote erro " + req.file?.path);
            res.status(200).json({ mensagem: 'Nenhum boleto válido encontrado no CSV.' });
          }
        })
        .on('error', (erro) => {
          console.error('Erro ao processar o CSV:', erro);
          res.status(500).json({ erro: 'Falha ao processar o arquivo CSV.' });
        });
    } catch (erro) {
      console.error('Erro durante a importação do CSV:', erro);
      res.status(500).json({ erro: 'Falha ao importar os dados do CSV.' });
    }
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Erro ao excluir o arquivo:', err);
      } else {
        console.log('Arquivo CSV excluído com sucesso após o processamento.');
      }
    });

  }

  public async importarPDF(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ erro: 'Nenhum arquivo PDF foi enviado.' });
    }

    try {
      const bufferArquivo = fs.readFileSync(req.file!.path);
      const dadosPdf = await PdfParse(bufferArquivo);
      const numeroPaginas = dadosPdf.numpages;

      // Busca todos os boletos para determinar a ordem (assumindo ordem fixa como mencionado)
      const boletos = await Boleto.findAll({ order: [['id', 'ASC']] });

      if (numeroPaginas !== boletos.length) {
        res.status(400).json({
          erro: `O número de páginas do PDF (${numeroPaginas}) não corresponde ao número de boletos (${boletos.length}).`,
        });
      }

      const diretorioSaida = path.join(__dirname, '../../data/boletos_pdf');
      if (!fs.existsSync(diretorioSaida)) {
        fs.mkdirSync(diretorioSaida, { recursive: true });
      }

      // Em um cenário real, você precisaria de uma forma de dividir o PDF.
      // Para este exemplo, apenas reconheceremos que o número de páginas corresponde.
      // Uma biblioteca como 'pdf-lib' poderia ser usada para dividir, mas é mais complexo.
      // Alternativamente, você poderia usar uma ferramenta de linha de comando como 'pdftk'.

      // Para este exemplo simplificado, vamos criar arquivos vazios com os nomes corretos.
      boletos.forEach((boleto, indice) => {
        const caminhoArquivoSaida = path.join(diretorioSaida, `${boleto.id}.pdf`);
        // Em uma implementação real, você extrairia a página no índice + 1
        // do PDF enviado e a salvaria aqui.
        fs.writeFileSync(caminhoArquivoSaida, `CONTEÚDO FALSO DO PDF PARA O BOLETO ID: ${boleto.id}`);
      });

      res.status(200).json({ mensagem: 'PDF processado e (falsos) boletos criados.' });
    } catch (erro) {
      console.error('Erro ao processar o PDF:', erro);
      res.status(500).json({ erro: 'Falha ao processar o arquivo PDF.' });
    } finally {
      fs.unlinkSync(req.file!.path);
    }
  }

  public async listarBoletos(req: Request, res: Response): Promise<void> {
    try {
      const whereClause: any = {};

      if (req.query.nome) {
        whereClause.nome_sacado = { [Op.iLike]: `%${req.query.nome}%` }; // iLike para case-insensitive
      }
      if (req.query.valor_inicial && req.query.valor_final) {
        whereClause.valor = {
          [Op.between]: [parseFloat(req.query.valor_inicial as string), parseFloat(req.query.valor_final as string)],
        };
      } else if (req.query.valor_inicial) {
        whereClause.valor = { [Op.gte]: parseFloat(req.query.valor_inicial as string) };
      } else if (req.query.valor_final) {
        whereClause.valor = { [Op.lte]: parseFloat(req.query.valor_final as string) };
      }
      if (req.query.id_lote) {
        whereClause.id_lote = parseInt(req.query.id_lote as string, 10);
      }

      const boletos = await Boleto.findAll({
        where: whereClause,
        include: [{ model: Lote, as: 'Lote' }], // Inclui informações do Lote se necessário
      });

      res.status(200).json(boletos);
    } catch (erro) {
      console.error('Erro ao listar boletos:', erro);
      res.status(500).json({ erro: 'Falha ao listar os boletos.' });
    }
  }

  public async gerarRelatorio(req: Request, res: Response): Promise<void> {
    try {
      const whereClause: any = {};

      if (req.query.nome) {
        whereClause.nome_sacado = { [Op.iLike]: `%${req.query.nome}%` }; // iLike para case-insensitive
      }
      if (req.query.valor_inicial && req.query.valor_final) {
        whereClause.valor = {
          [Op.between]: [parseFloat(req.query.valor_inicial as string), parseFloat(req.query.valor_final as string)],
        };
      } else if (req.query.valor_inicial) {
        whereClause.valor = { [Op.gte]: parseFloat(req.query.valor_inicial as string) };
      } else if (req.query.valor_final) {
        whereClause.valor = { [Op.lte]: parseFloat(req.query.valor_final as string) };
      }
      if (req.query.id_lote) {
        whereClause.id_lote = parseInt(req.query.id_lote as string, 10);
      }

      const boletos = await Boleto.findAll({
        where: whereClause,
        include: [{ model: Lote, as: 'Lote' }],
        order: [['id', 'ASC']],
      });

      if (req.query.relatorio === '1') {
        const pdfDoc = await PDFDocument.create();
        let pagina = pdfDoc.addPage();

        const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const tamanhoFonte = 12;
        const alturaLinha = tamanhoFonte * 1.5;
        let y = pagina.getSize().height - 50;
        const x = 50;

        const headers = ['ID', 'Nome Sacado', 'ID Lote', 'Valor', 'Linha Digitável'];
        let currentX = x;
        const larguraColunas = [30, 200, 60, 80, 250];

        // Desenha os cabeçalhos
        headers.forEach((header, indice) => {
          pagina.drawText(header, {
            x: currentX,
            y,
            font: fonte,
            size: tamanhoFonte,
          });
          currentX += larguraColunas[indice];
        });
        y -= alturaLinha;
        pagina.drawLine({
          start: { x, y },
          end: { x: x + larguraColunas.reduce((a, b) => a + b, 0), y },
          thickness: 1,
        });
        y -= alturaLinha / 2;

        // Desenha as linhas de dados
        for (const boleto of boletos) {
          currentX = x;
          const dadosLinha = [
            boleto.id.toString(),
            boleto.nome_sacado,
            boleto.id_lote.toString(),
            boleto.valor.toString(),
            boleto.linha_digitavel,
          ];
          dadosLinha.forEach((dado, indice) => {
            pagina.drawText(dado, {
              x: currentX,
              y,
              font: fonte,
              size: tamanhoFonte,
            });
            currentX += larguraColunas[indice];
          });
          y -= alturaLinha;
          if (y < 50) {
            pagina = pdfDoc.addPage();
            y = pagina.getSize().height - 50;
          }
        }

        const bytesPdf = await pdfDoc.save();
        const base64String = Buffer.from(bytesPdf).toString('base64');

        res.status(200).json({ base64: base64String });
      } else {
        res.status(200).json(boletos);
      }
    } catch (erro) {
      console.error('Erro ao gerar o relatório:', erro);
      res.status(500).json({ erro: 'Falha ao gerar o relatório.' });
    }
  }
}

export default new BoletoController();