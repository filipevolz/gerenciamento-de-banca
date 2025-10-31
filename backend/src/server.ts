import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import apostaRoutes from './routes/aposta.routes';
import bancaRoutes from './routes/banca.routes';
import casaApostaRoutes from './routes/casaAposta.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares - CORS configurado para aceitar requisições do frontend
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Permitir localhost em desenvolvimento
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Permitir qualquer domínio do GitHub Pages (https://*.github.io)
    if (origin.includes('.github.io')) {
      return callback(null, true);
    }
    
    // Log para debug
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/apostas', apostaRoutes);
app.use('/api/bancas', bancaRoutes);
app.use('/api/casas-aposta', casaApostaRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

