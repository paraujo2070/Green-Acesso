// src/routes/boletoRoutes.ts
import express from 'express';
import BoletoController from '../controllers/BoletoController';
import multer, { diskStorage } from 'multer';

const router = express.Router();
const storage = diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    },
  });
  const upload = multer({ storage: storage });

router.post('/importar/csv', upload.single('csvFile'), BoletoController.importarCSV);
router.post('/importar/pdf', upload.single('pdfFile'), BoletoController.importarPDF);
router.get('/boletos', BoletoController.listarBoletos);

export default router;