# 🚀 Deploy do Backend

Este guia explica como fazer deploy do backend para que funcione publicamente (não apenas localmente).

## 📋 Opções de Hospedagem

Recomendamos **Render** (gratuito e fácil) ou **Railway**:

### 1. Render (Recomendado)

#### Passo 1: Preparar o repositório
1. Certifique-se de que todas as alterações estão commitadas e enviadas para o GitHub

#### Passo 2: Criar conta no Render
1. Acesse [render.com](https://render.com)
2. Crie uma conta (pode usar GitHub)
3. Conecte seu repositório

#### Passo 3: Criar Web Service
1. Clique em "New +" → "Web Service"
2. Conecte seu repositório `gerenciamento-de-banca`
3. Configure:
   - **Name**: `gerenciamento-banca-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

#### Passo 4: Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```
DATABASE_URL=postgresql://... (sua URL do Neon.tech)
JWT_SECRET=seu-secret-key-aqui (use algo aleatório e seguro)
NODE_ENV=production
PORT=10000
```

#### Passo 5: Deploy
1. Clique em "Create Web Service"
2. Aguarde o deploy (pode levar alguns minutos)
3. Quando terminar, você terá uma URL como: `https://gerenciamento-banca-backend.onrender.com`

#### Passo 6: Atualizar Frontend
1. Vá para o GitHub → Settings → Secrets and variables → Actions
2. Adicione uma nova secret:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://sua-url-do-render.onrender.com/api`
3. Faça push novamente para atualizar o frontend

---

### 2. Railway

#### Passo 1: Criar conta
1. Acesse [railway.app](https://railway.app)
2. Crie uma conta (pode usar GitHub)

#### Passo 2: Novo Projeto
1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório `gerenciamento-de-banca`

#### Passo 3: Configurar Serviço
1. Selecione o diretório `backend`
2. Railway detectará automaticamente que é Node.js
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` - URL do seu banco PostgreSQL
   - `JWT_SECRET` - Secret key para JWT
   - `NODE_ENV=production`
   - `PORT` - Railway define automaticamente

#### Passo 4: Deploy
1. Railway fará deploy automaticamente
2. Vá em "Settings" → "Generate Domain" para obter a URL pública
3. A URL será algo como: `https://gerenciamento-banca-production.up.railway.app`

---

## 🔧 Configuração Adicional

### CORS
O backend já está configurado para aceitar requisições de:
- `http://localhost:5173` e `http://localhost:5174` (desenvolvimento local)
- `https://filipevolz.github.io` e `https://*.github.io` (GitHub Pages)

Se precisar adicionar mais domínios, edite `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://filipevolz.github.io',
    'https://seu-dominio.com'
  ],
  credentials: true
}));
```

### Banco de Dados
O backend já está configurado para usar PostgreSQL no Neon.tech. Certifique-se de que a variável `DATABASE_URL` está configurada corretamente no serviço de hospedagem.

### Migrações do Prisma
As migrações são executadas automaticamente no build com `prisma migrate deploy`. Isso garante que o banco de dados esteja atualizado quando o serviço iniciar.

---

## 🧪 Testar o Deploy

Após o deploy, teste se está funcionando:

```bash
curl https://sua-url-do-backend.onrender.com/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## 📝 Variáveis de Ambiente Necessárias

Certifique-se de configurar estas variáveis no serviço de hospedagem:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do banco PostgreSQL (Neon.tech) | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret key para assinar tokens JWT | `uma-chave-secreta-aleatoria` |
| `NODE_ENV` | Ambiente (production) | `production` |
| `PORT` | Porta (geralmente definida automaticamente) | `10000` ou deixar vazio |

---

## 🔒 Segurança

- **Nunca** commite o arquivo `.env` no Git
- Use secrets fortes para `JWT_SECRET`
- Mantenha o `DATABASE_URL` seguro
- Ative HTTPS (Render e Railway fazem isso automaticamente)

---

## 🐛 Troubleshooting

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Certifique-se de que o TypeScript compila sem erros
- Verifique os logs de build no painel do serviço

### Erro de conexão com banco
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o banco Neon.tech aceita conexões externas
- Verifique se o IP não está bloqueado (Neon permite por padrão)

### CORS errors
- Verifique se o domínio do frontend está na lista de origens permitidas
- Verifique os logs do backend para ver o erro específico

---

## 📚 Links Úteis

- [Documentação do Render](https://render.com/docs)
- [Documentação do Railway](https://docs.railway.app)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Neon.tech](https://neon.tech)

