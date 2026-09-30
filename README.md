# LifeOS (protótipo de interface)

Interface com dados fictícios. Ainda não está conectada ao Notion.

## Rodar
- Local ou Codespaces: `npm install` e depois `npm run dev` (abre em http://localhost:3000)
- Vercel: importe o repositório, sem variáveis de ambiente por enquanto.

## Onde mexer
- `lib/nav.js`: abas principais e guias internas
- `lib/mockData.js`: tarefas fictícias
- `components/TasksView.js`: tela de Tarefas (busca, ordenação, agrupamento, filtros)
- `app/globals.css`: todo o visual (cores em `:root`)
