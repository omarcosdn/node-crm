# Node CRM Monorepo

Monorepo para um CRM com **backend** em Node.js/TypeScript e **frontend** em React. A organização privilegia **Clean Code**, **DDD** e **SOLID**, separando responsabilidades por aplicação e camadas para facilitar evolução e testes.

## 📂 Estrutura

```
.
├── apps
│   ├── backend/            # API Express com casos de uso, gateways e testes de arquitetura
│   └── frontend/           # SPA React (Vite) para consumir a API
├── Dockerfile*             # Imagens de produção e desenvolvimento focadas em workspaces
├── docker-compose.yaml     # Sobe observabilidade (Grafana OTEL), backend e frontend
├── package.json            # Scripts orquestrados por workspaces
└── yarn.lock
```

### Backend (DDD)
- **core/**: entidades, objetos de valor, casos de uso e contratos de repositório/gateway.
- **infrastructure/**: adaptações para HTTP, banco e observabilidade.
- **arch/**: testes de arquitetura garantindo isolamento entre camadas.

### Frontend
- React + Vite com build independente e estilos simples para validar a camada visual.

## 🚀 Como rodar

1. Instale dependências (raiz):
   ```bash
   yarn install
   ```

2. Desenvolvimento:
   ```bash
   # API
   yarn workspace @node-crm/backend dev

   # Frontend
   yarn workspace @node-crm/frontend dev --host
   ```

3. Build e testes:
   ```bash
   yarn build                # executa build em todos os workspaces
   yarn workspace @node-crm/backend test
   yarn workspace @node-crm/backend test:coverage
   ```

4. Formatação (todos os pacotes):
   ```bash
   yarn format
   ```

## 🐳 Docker

Build de produção (API):
```bash
docker build -t node-crm-backend:prod .
docker run --env-file apps/backend/.env -p 4000:4000 node-crm-backend:prod
```

Ambiente completo com observabilidade e front:
```bash
docker compose up --build
```
- Backend: http://localhost:4000/api/template-service/health
- Frontend: http://localhost:5173
- Grafana (OTEL LGTM): http://localhost:3000

## 🔧 Princípios adotados
- **Clean Code/SOLID**: separação de responsabilidades, dependências invertidas via contratos e injeção de dependência.
- **DDD**: domínio modelado em `core/` com regras e casos de uso independentes de infraestrutura.
- **Observabilidade**: instrumentação OpenTelemetry habilitada no backend.
- **Monorepo**: workspaces isolam build/test de cada app, mantendo scripts consistentes.
