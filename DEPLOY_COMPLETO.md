# 🚀 Guia Completo de Deploy

Este guia explica como fazer deploy tanto do **backend** quanto do **frontend** para que a aplicação funcione completamente online.

## 📋 Visão Geral

A aplicação tem duas partes:
1. **Backend** (API) - Precisa ser hospedado em Render/Railway
2. **Frontend** (Interface) - Já está no GitHub Pages

## 🔧 Passo 1: Deploy do Backend

### Opção A: Render (Recomendado - Grátis)

1. **Criar conta no Render**
   - Acesse [render.com](https://render.com)
   - Faça login com GitHub

2. **Criar Web Service**
   - Clique em "New +" → "Web Service"
   - Conecte o repositório `gerenciamento-de-banca`
   - Configure:
     - **Name**: `gerenciamento-banca-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build && npx录 prisma migrate deploy`
     - **Start Command**: `npm start`
     - **Plan**: `Free`

3. **Variáveis de Ambiente**
   - Adicione no Render:
     ```
     DATABASE_URL=sua-url-do-neon-tech
     JWT_SECRET=uma-chave-secreta-aleatoria-e-segura
     NODE_ENV=production
     ```

4. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde alguns minutos
   - **Anote a URL gerada** (ex: `https://gerenciamento-banca-backend.onrender.com`)

### Opção B: Railway

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto conectando o repositório
3. Adicione as mesmas variáveis de ambiente
4. Railway faz deploy automático

---

## 🌐 Passo 2: Configurar Frontend para usar Backend Online

Após o backend estar online:

1. **Adicionar Secret no GitHub**
   - Vá para: GitHub → Seu repositório → Settings → Secrets and variables → Actions
   - Clique em "New repository secret"
   - Nome: `VITE_API_URL`
   - Valor: `https://sua-url-do-render.onrender.com/api` (substitua pela URL real)

2. **Atualizar GitHub Actions**
   - Faça um push para a branch `main`
   - O GitHub Actions vai fazer rebuild com a nova URL da API
   - Aguarde o deploy completar

---

## ✅ Passo 3: Testar

1. Acesse: `https://filipevolz.github.io/gerenciamento-de-banca/`
2. Tente fazer login ou cadastro
3. Verifique se as requisições estão funcionando

---

## 🔍 Verificar se está funcionando

### Backend
```bash
curl https://sua-url-do-backend.onrender.com/health
```
Deve retornar: `Estatísticas {"status":"ok",...}`

### Frontend
- Abra o DevTools (F12) → Console
- Verifique se não há erros de CORS
- Teste fazer uma requisição (login/cadastro)

---

## 🐛 Problemas Comuns

### Erro de CORS
- Verifique se o domínio do GitHub Pages está permitido no CORS do backend
- O backend já está configurado para aceitar `*.github.io`

### Erro de conexão
- Verifique se a URL da API está correta no secret do GitHub
- Verifique se o backend está online (Render pode desligar serviços gratuitos após inatividade)

### Banco de dados
- Certifique-se de que a `DATABASE_URL` do Neon.tech está correta
- Verifique se o banco aceita conexões externas

---

## 📝 URLs Importantes

- **Frontend vem**: `https://filipevolz.github.io/gerenciamento-de-banca/`
- **Backend**: `https://sua-url-do-backend.onrender.com/api`
- **Health Check**: `https://sua-url-do-backend.onrender.com/health`

---

## 💡 Dicas

- **Render (Free)**: Serviços gratuitos "dormem" após 15 min de inatividade. O primeiro acesso pode demorar ~30s para "acordar"
- **Railway**: Oferece crédientos gratuitos, mas pode ter limites
- **Neon.tech**: Banco já está configurado e funciona remotamente

---

Para mais detalhes sobre deploy do backend, veja: [BACKEND_DEPLOY.md](./BACKEND_DEPLOY.md)

