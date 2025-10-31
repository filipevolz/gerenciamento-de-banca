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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://filipevolz.github.io'
];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc) apenas em desenvolvimento
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
    }
    
    // Permitir origens explícitas
    if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    
    // Permitir qualquer subdomínio do GitHub Pages
    if (origin && origin.includes('.github.io')) {
      return callback(null, true);
    }
    
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

