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
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://filipevolz.github.io',
];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requisições sem origin (mobile apps, Postman, curl, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Permitir localhost em desenvolvimento
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Permitir origens específicas do GitHub Pages
    if (origin === 'https://filipevolz.github.io' || origin.includes('.github.io')) {
      console.log('CORS allowed origin:', origin);
      return callback(null, true);
    }
    
    // Verificar se está na lista de origens permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log para debug
    console.log('CORS blocked origin:', origin);
    callback(null, false); // Passar false em vez de Error para permitir que o CORS retorne 403
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
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

