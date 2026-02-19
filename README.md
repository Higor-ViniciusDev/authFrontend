# Auth Frontend

Aplicação **Angular 21** que serve como interface de autenticação do sistema. Consome a API do backend para oferecer o fluxo completo de autenticação ao usuário.

## O que faz

- **Tela de Login** — Envia credenciais para o backend, armazena o JWT no `sessionStorage` e redireciona para a home.
- **Tela de Cadastro** — Registra um novo usuário via API. Após o cadastro, redireciona para a tela de verificação de e-mail.
- **Verificação de e-mail** — Aguarda o usuário clicar no link do e-mail. Usa **WebSocket** para receber a confirmação em tempo real e atualizar a tela automaticamente.
- **Reenviar verificação** — Permite solicitar um novo e-mail de verificação.
- **Esqueci a senha** — Solicita redefinição de senha via e-mail.
- **Proteção de rotas** — Guards `authGuard` e `guestGuard` controlam o acesso: usuários logados vão para `/home`, visitantes ficam nas telas de login/cadastro.
- **Interceptor HTTP** — Injeta o JWT automaticamente em todas as requisições para o backend.

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Executar em modo de desenvolvimento

```bash
npm start
```

A aplicação sobe em `http://localhost:4200` por padrão.

### 3. Gerar build de produção

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist/`. Para servir estáticamente, use qualquer servidor HTTP apontando para essa pasta.

> **Obs:** a URL da API está configurada em `src/app/services/auth.service.ts` na propriedade `API_URL`. Altere para `http://localhost:8080` ao rodar localmente.
