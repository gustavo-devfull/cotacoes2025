// Exemplo de backend simples para desenvolvimento
// Execute com: node example-backend.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Criar pasta de uploads se não existir
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
});

// Rota de upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    // URL da imagem
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    
    console.log(`Imagem enviada: ${req.file.filename}`);
    console.log(`URL: ${imageUrl}`);
    
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend de upload funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para listar imagens (para debug)
app.get('/api/images', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const images = files.map(file => ({
      filename: file,
      url: `http://localhost:${PORT}/uploads/${file}`,
      size: fs.statSync(path.join(uploadDir, file)).size
    }));
    
    res.json({
      success: true,
      images: images,
      count: images.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao listar imagens'
    });
  }
});

// Middleware de erro
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Máximo 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de upload rodando em http://localhost:${PORT}`);
  console.log(`📁 Pasta de uploads: ${path.resolve(uploadDir)}`);
  console.log(`🔗 Endpoint de upload: http://localhost:${PORT}/api/upload`);
  console.log(`🧪 Endpoint de teste: http://localhost:${PORT}/api/test`);
  console.log(`📋 Listar imagens: http://localhost:${PORT}/api/images`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  process.exit(0);
});

module.exports = app;








