// Backend para upload via FTP
// Execute com: node ftp-backend.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Client } = require('ftp');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Configuração do Multer para arquivos temporários
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = 'temp-uploads';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `temp-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
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

// Configuração FTP
const ftpConfig = {
  host: '46.202.90.62',
  port: 21,
  user: 'u715606397.ideolog.ia.br',
  password: ']X9CC>t~ihWhdzNq',
  secure: false
};

// Função para upload via FTP
const uploadToFTP = (localPath, remotePath) => {
  return new Promise((resolve, reject) => {
    const client = new Client();
    
    client.on('ready', () => {
      console.log('FTP Client Ready');
      
      // Criar diretório se não existir
      const remoteDir = path.dirname(remotePath);
      client.mkdir(remoteDir, true, (err) => {
        if (err && err.code !== 450) {
          console.error('Erro ao criar diretório FTP:', err);
          return reject(err);
        }
        
        // Upload do arquivo
        client.put(localPath, remotePath, (err) => {
          client.end();
          
          if (err) {
            console.error('Erro no upload FTP:', err);
            return reject(err);
          }
          
          console.log(`Arquivo enviado para FTP: ${remotePath}`);
          resolve(remotePath);
        });
      });
    });
    
    client.on('error', (err) => {
      console.error('Erro de conexão FTP:', err);
      reject(err);
    });
    
    client.connect(ftpConfig);
  });
};

// Rota de upload via FTP
app.post('/api/upload-ftp', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    console.log(`Arquivo recebido: ${req.file.filename}`);
    console.log(`Tamanho: ${req.file.size} bytes`);

    // Gerar nome único para o arquivo no FTP
    const fileExtension = path.extname(req.file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
    const remotePath = `/public_html/images/comments/${uniqueFileName}`;
    
    // Upload para FTP
    await uploadToFTP(req.file.path, remotePath);
    
    // URL pública do arquivo
    const publicUrl = `http://46.202.90.62/images/comments/${uniqueFileName}`;
    
    // Limpar arquivo temporário
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Erro ao deletar arquivo temporário:', err);
    });
    
    console.log(`Upload concluído: ${publicUrl}`);
    
    res.json({
      success: true,
      url: publicUrl,
      filename: uniqueFileName,
      size: req.file.size
    });

  } catch (error) {
    console.error('Erro no upload FTP:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erro ao deletar arquivo temporário:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      error: `Erro no upload FTP: ${error.message}`
    });
  }
});

// Rota de teste
app.get('/api/test-ftp', (req, res) => {
  res.json({
    message: 'Backend FTP funcionando!',
    timestamp: new Date().toISOString(),
    ftpConfig: {
      host: ftpConfig.host,
      user: ftpConfig.user,
      secure: ftpConfig.secure
    }
  });
});

// Rota para listar arquivos no FTP (opcional)
app.get('/api/list-ftp', async (req, res) => {
  try {
    const client = new Client();
    
    client.on('ready', () => {
      client.list('/public_html/images/comments', (err, list) => {
        client.end();
        
        if (err) {
          return res.status(500).json({
            success: false,
            error: `Erro ao listar arquivos: ${err.message}`
          });
        }
        
        res.json({
          success: true,
          files: list.map(file => ({
            name: file.name,
            size: file.size,
            date: file.date,
            url: `http://46.202.90.62/images/comments/${file.name}`
          }))
        });
      });
    });
    
    client.on('error', (err) => {
      res.status(500).json({
        success: false,
        error: `Erro de conexão FTP: ${err.message}`
      });
    });
    
    client.connect(ftpConfig);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Erro: ${error.message}`
    });
  }
});

// Middleware de erro
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Máximo 10MB.'
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
  console.log(`🚀 Servidor FTP rodando em http://localhost:${PORT}`);
  console.log(`📁 Upload FTP: http://localhost:${PORT}/api/upload-ftp`);
  console.log(`🧪 Teste FTP: http://localhost:${PORT}/api/test-ftp`);
  console.log(`📋 Listar arquivos: http://localhost:${PORT}/api/list-ftp`);
  console.log(`🔗 FTP Host: ${ftpConfig.host}`);
  console.log(`👤 FTP User: ${ftpConfig.user}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor FTP...');
  process.exit(0);
});

module.exports = app;
