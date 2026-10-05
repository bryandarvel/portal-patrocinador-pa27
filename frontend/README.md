# Frontend do Portal do Patrocinador

Angular 22 e NG-ZORRO. A raiz redireciona para `/login`, com identidade PA27, carrossel e validação visual. A autenticação ainda não está integrada.

Na pasta `frontend/`, com Node 24.15.0 (ou versão compatível indicada no README da raiz):

```sh
npm ci
npm start
```

Acesse http://localhost:4200/login e encerre com Ctrl+C. Não precisa instalar Angular CLI globalmente. Para validar:

```sh
npm run test:proxy
npm run build
```

O build fica em `dist/portal-patrocinador/browser`. Não há suíte de componentes ou E2E configurada; `test:proxy` usa o test runner nativo do Node.

O proxy `/api/**` aponta para `http://127.0.0.1:8080` no host. No Docker, `API_PROXY_TARGET` seleciona `http://backend:8080`. Ele preserva o caminho e funciona somente no servidor de desenvolvimento.

Para executar frontend, backend e PostgreSQL juntos, siga o [README da raiz](../README.md). Todos os assets necessários estão em `public/`; nenhum caminho pessoal ou PDF externo é usado em runtime.
