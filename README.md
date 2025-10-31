# 🎲 Gerenciamento de Banca para Apostas Esportivas

Sistema completo para gerenciamento de bancas e apostas esportivas com autenticação, cálculos avançados e estatísticas detalhadas.

## 🚀 Tecnologias

### Backend
- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL (Neon.tech)
- JWT Authentication
- bcrypt

### Frontend
- React 19
- TypeScript
- Tailwind CSS v4
- React Router
- Axios
- Context API

## 📋 Funcionalidades

- ✅ Autenticação JWT (Login/Cadastro)
- ✅ Gestão de Usuários
- ✅ Gestão de Bancas
- ✅ Registro de Apostas
- ✅ Cálculo automático de lucros
- ✅ Estatísticas detalhadas (ROI, Yield, Taxa de Acerto)
- ✅ Fórmulas de gestão (Kelly Criterion, Valor Esperado)
- ✅ Dashboard interativo
- ✅ Interface responsiva e moderna

## 🛠️ Instalação

### Backend

```bash
cd backend
npm install
npm run prisma:generate
```

### Frontend

```bash
cd frontend
npm install
```

## 🏃 Executando

### 1. Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend rodará em: `http://localhost:3001`

### 2. Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend rodará em: `http://localhost:5173`

## 📊 Banco de Dados

O banco PostgreSQL está hospedado no Neon.tech. Configurações no arquivo:
- `backend/.env`

Para visualizar os dados:
```bash
cd backend
npm run prisma:studio
```

## 🔗 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual

### Bancas
- `POST /api/bancas` - Criar banca
- `GET /api/bancas` - Listar bancas
- `GET /api/bancas/:id` - Buscar banca
- `PUT /api/bancas/:id` - Atualizar banca
- `DELETE /api/bancas/:id` - Deletar banca

### Apostas
- `POST /api/apostas` - Criar aposta
- `GET /api/apostas` - Listar apostas
- `GET /api/apostas/:id` - Buscar aposta
- `PATCH /api/apostas/:id/resultado` - Atualizar resultado
- `DELETE /api/apostas/:id` - Deletar aposta
- `GET /api/apostas/estatisticas` - Estatísticas

## 🧮 Fórmulas Implementadas

### Kelly Criterion
Calcula o valor ótimo da aposta baseado na probabilidade e odd.

```typescript
calcularStakeKelly(odd, probabilidade, banca, kelly = 0.25)
```

### ROI (Return on Investment)
Percentual de retorno sobre o investimento.

```typescript
calcularROI(lucro, stakeTotal)
```

### Yield
Taxa de retorno percentual.

```typescript
calcularYield(lucro, stakeTotal)
```

### Valor Esperado
Valor esperado de uma aposta.

```typescript
calcularValorEsperado(odd, probabilidade, stake)
```

## 📁 Estrutura do Projeto

```
gerenciamento-de-banca/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controllers REST
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Middlewares (JWT)
│   │   ├── utils/           # Utilitários
│   │   └── server.ts        # Servidor Express
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Páginas (Login, Register, Dashboard)
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # Context API (Auth)
│   │   ├── services/        # Serviços (API, Auth)
│   │   └── App.tsx          # App principal
│   └── package.json
└── README.md
```

## 🎯 Como Usar

1. **Acesse**: `http://localhost:5173`
2. **Cadastre-se**: Crie uma conta com nome, email e senha
3. **Faça Login**: Entre com suas credenciais
4. **Crie uma Banca**: Configure sua banca inicial
5. **Registre Apostas**: Adicione suas apostas
6. **Atualize Resultados**: Marque ganhos/perdas
7. **Veja Estatísticas**: Acompanhe seu ROI e performance

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Tokens JWT com expiração de 7 dias
- Middleware de autenticação em rotas protegidas
- Validação de dados no backend

## 🧪 Testando a API

### Criar Conta

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

### Fazer Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

### Criar Banca (use o token retornado)

```bash
curl -X POST http://localhost:3001/api/bancas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "usuarioId": "id-do-usuario",
    "nome": "Banca Principal",
    "saldoInicial": 1000
  }'
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="seu-secret-key-aqui"
PORT=3001
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## 🎨 Interface

A interface foi desenvolvida com Tailwind CSS e inclui:
- Design moderno e responsivo
- Gradientes e animações suaves
- Feedback visual em ações
- Loading states
- Mensagens de erro

## 📄 Licença

ISC

## 👨‍💻 Desenvolvido com

- ❤️ Node.js
- ⚛️ React
- 🎨 Tailwind CSS
- 🗄️ Prisma + PostgreSQL
- 🔐 JWT

