# 🚀 Deploy no GitHub Pages

Este guia explica como fazer o deploy do frontend no GitHub Pages.

## 📋 Pré-requisitos

1. Repositório no GitHub com o código do projeto
2. Permissões para configurar GitHub Pages no repositório
3. Backend hospedado e acessível (necessário para a API funcionar)

## ⚙️ Configuração do GitHub Pages

### 1. Habilitar GitHub Pages no repositório

1. Vá para **Settings** do seu repositório no GitHub
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. Salve as configurações

### 2. Configurar a URL da API (Opcional)

Se você quiser usar uma API de produção, configure a variável de ambiente `VITE_API_URL` no GitHub Actions:

1. Vá para **Settings** > **Secrets and variables** > **Actions**
2. Clique em **New repository secret**
3. Nome: `VITE_API_URL`
4. Valor: URL da sua API (ex: `https://sua-api.herokuapp.com/api`)
5. Clique em **Add secret**

**Nota:** Se não configurar, a aplicação tentará usar `http://localhost:3001/api` por padrão.

### 3. Fazer o Deploy

O deploy é automático! Sempre que você fizer push para a branch `main`, o GitHub Actions irá:

1. Instalar as dependências
2. Fazer o build da aplicação
3. Fazer deploy no GitHub Pages

Para fazer deploy manual:

1. Vá para a aba **Actions** no GitHub
2. Clique em **Deploy to GitHub Pages**
3. Clique em **Run workflow**

## 🔗 Acessando a Aplicação

Após o deploy, a aplicação estará disponível em:

```
https://SEU_USUARIO.github.io/gerenciamento-de-banca/
```

## 🔧 Configurações Importantes

### Base Path

O projeto está configurado para usar o base path `/gerenciamento-de-banca/`. Se o nome do seu repositório for diferente, atualize o arquivo `frontend/vite.config.ts`:

```typescript
base: process.env.NODE_ENV === 'production' ? '/SEU_REPOSITORIO/' : '/',
```

### HashRouter

O projeto usa `HashRouter` em vez de `BrowserRouter` para funcionar corretamente no GitHub Pages sem necessidade de configuração adicional do servidor.

## 🐛 Troubleshooting

### A aplicação não carrega

1. Verifique se o GitHub Actions completou com sucesso
2. Verifique se o GitHub Pages está habilitado
3. Aguarde alguns minutos após o deploy

### Erros de API

1. Verifique se a variável `VITE_API_URL` está configurada corretamente
2. Verifique se o backend está acessível e com CORS configurado
3. Verifique o console do navegador para erros

### Rotas não funcionam

O projeto usa `HashRouter`, então as rotas devem aparecer como:
- `/#/dashboard`
- `/#/login`
- `/#/apostas`

Isso é normal e esperado para GitHub Pages.

## 📝 Notas

- O backend precisa estar hospedado separadamente (GitHub Pages só hospeda sites estáticos)
- Certifique-se de que o backend tem CORS configurado para aceitar requisições do domínio do GitHub Pages
- A aplicação é recriada a cada push na branch `main`

