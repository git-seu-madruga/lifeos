# LifeOS — integração inicial com Notion

Base: v3 com anexos em Projetos e Tarefas. Sem painel de configurações. Projetos, tarefas, marcos e Inbox agora vêm do Notion. Diário e Finanças continuam com a indicação de tela não construída.

## Publicar na Vercel

1. Envie os arquivos deste pacote ao repositório, mantendo a estrutura de pastas.
2. Em Settings → Environment Variables, mantenha `NOTION_TOKEN` e adicione `LIFEOS_PASSWORD` com uma senha de acesso escolhida por você. Não use o token do Notion como senha.
3. Adicione `NOTION_INBOX_DATABASE_ID` com o ID do novo banco Inbox, conforme as instruções abaixo.
4. Configure os ambientes onde vai testar (Production e, se necessário, Preview).
5. Faça uma nova implantação após alterar as variáveis.
6. Abra o app e entre com a senha definida em `LIFEOS_PASSWORD`.

O token só é utilizado no servidor. Os endpoints de leitura, gravação e anexos exigem sessão autenticada. A sessão usa cookie HttpOnly, SameSite e validade de 7 dias. Trocar a senha invalida as sessões. As tentativas de login têm limitação por instância do servidor; para um produto com múltiplos usuários, substituir por autenticação dedicada.

## Bancos configurados

- Projetos: `3ec530f0-f112-80d5-9097-ea21f9ce45d7`
- Marcos: `3ed530f0-f112-80e0-b1e5-f2a861954669`
- Tarefas: `3ec530f0-f112-803b-a108-f7778cdee362`

A conexão LifeOS deve ter acesso à página que contém os quatro bancos e capacidades de ler, inserir e atualizar conteúdo. O app descobre a fonte de dados de cada banco pela API. Se houver várias fontes no mesmo banco, defina `NOTION_PROJECTS_DATA_SOURCE_ID`, `NOTION_MILESTONES_DATA_SOURCE_ID` ou `NOTION_TASKS_DATA_SOURCE_ID`; para Inbox, `NOTION_INBOX_DATA_SOURCE_ID`.

### Criar o banco Inbox

1. Dentro da página LifeOS, crie um banco de dados em tabela chamado **Inbox**.
2. Renomeie a propriedade de título para **Nome**.
3. Adicione **Conteúdo**, do tipo **Texto** (não é o corpo da página).
4. Confira se a conexão interna LifeOS tem acesso ao banco e permissão de ler, inserir e atualizar conteúdo.
5. Copie o link do banco e use seu ID na variável `NOTION_INBOX_DATABASE_ID` da Vercel. Em `https://app.notion.com/p/ID_DO_BANCO?v=ID_DA_VISUALIZACAO`, use apenas `ID_DO_BANCO`, não o valor após `v=`. O ID tem 32 caracteres hexadecimais, com ou sem hífens.

| Propriedade | Tipo | Uso |
|---|---|---|
| Nome | Título | Primeira linha do conteúdo, preenchida pelo app |
| Conteúdo | Texto | Texto completo, incluindo quebras de linha |

Não precisa criar relações, status, contexto nem anexos no Inbox. A data de criação é lida do próprio registro do Notion para mostrar entradas recentes primeiro. Opcionalmente, crie uma propriedade do tipo Hora de criação para exibi-la no Notion; o app não exige essa coluna.

Para criar uma entrada diretamente no Notion, preencha **Conteúdo**; esse é o texto que o aplicativo lê. Ao editar Conteúdo pelo app, Nome acompanha a primeira linha (até 200 caracteres). O limite por entrada é 10.000 caracteres.

### Projetos

| Propriedade | Tipo | Opções |
|---|---|---|
| Nome | Título | |
| Status | Selecionar ou Status | Ativo, Pausado, Concluído, Cancelado |
| Contexto | Selecionar | Trabalho, Pessoal |
| Área | Selecionar | Suas áreas |
| Prazo final | Data | |
| Descrição | Texto | |
| Anexos | Arquivos e mídia | |

### Marcos

| Propriedade | Tipo |
|---|---|
| Nome | Título |
| Projeto | Relação com Projetos, uma página |
| Prazo | Data |
| Concluído | Caixa de seleção |
| Ordem | Número |

### Tarefas

| Propriedade | Tipo | Opções |
|---|---|---|
| Nome | Título | |
| Status | Selecionar ou Status | Não iniciada, Em andamento, On hold, Concluída |
| Prioridade | Selecionar | Alta, Média, Baixa |
| Contexto | Selecionar | Trabalho, Pessoal |
| Projeto | Relação com Projetos, uma página | |
| Marco | Relação com Marcos, uma página | |
| Início | Data | |
| Prazo | Data | |
| Aguardando | Texto | |
| Cobrar em | Data | |
| Anotações | Texto | |
| Concluída em | Data com horário | |
| Anexos | Arquivos e mídia | |

Na primeira gravação, o app acrescenta automaticamente a propriedade de texto `LifeOS ID` nos quatro bancos. Ela permite reconhecer uma criação já concluída caso a conexão falhe antes da resposta e evita duplicatas nas tentativas seguintes. Não altere essa propriedade; você pode ocultá-la nas visualizações do Notion.

## Uso

- Criar e editar no app salva no Notion após uma breve pausa na digitação. Espere “Salvo no Notion” antes de fechar.
- O botão Atualizar busca os registros atuais, incluindo alterações feitas diretamente no Notion. Não há atualização automática em tempo real.
- Campos não alterados no app não são sobrescritos. Se o mesmo campo mudar também no Notion, o app mostra conflito e permite atualizar com confirmação para descartar as edições locais pendentes.
- Uma falha pode deixar parte de uma operação salva: Notion não oferece transação envolvendo várias páginas. O rascunho e o campo LifeOS ID permitem tentar novamente.
- O contexto exibido pela tarefa vem do projeto vinculado. Ao trocar o contexto do projeto pelo app, suas tarefas também são atualizadas.
- Os prazos dos marcos são validados contra o prazo final do projeto. Tarefas só podem usar um marco do mesmo projeto.
- Concluir preenche Concluída em; reabrir limpa esse horário. Ao concluir diretamente pelo Notion, preencha o horário ou use uma automação do próprio Notion.
- Anexos podem ser incluídos, abertos, baixados e removidos com confirmação. O app limita o envio a 4 MB por arquivo para caber no limite de requisição da Vercel. Arquivos maiores podem ser incluídos diretamente na propriedade Anexos do Notion e aparecerão após Atualizar.
- Excluir um projeto remove seus marcos e mantém as tarefas sem projeto e sem marco. Excluir pelo app envia as páginas para a lixeira do Notion; a API não oferece exclusão permanente. O app não mantém um histórico de excluídos.
- O Inbox sincroniza com o Notion e pode ser acessado em outros dispositivos. Os rascunhos pendentes ficam temporariamente no navegador.
- Ao transformar uma entrada em tarefa ou projeto, o destino é salvo antes de enviar a entrada original para a lixeira. Em caso de falha parcial, tente salvar novamente.
- Se houver Inbox da v3 neste navegador, aparece “Importar Inbox deste navegador”. Confirme para copiar essas entradas ao Notion. A importação usa IDs para evitar duplicatas e mantém os dados antigos; faça isso no mesmo navegador e endereço usados na v3.
- Projetos e tarefas da antiga versão local são preservados no armazenamento anterior, mas não são importados automaticamente. Os exemplos fictícios não são enviados ao Notion.

## Rodar e testar

```bash
npm install
npm run test
npm run build
npm run dev
```

Para desenvolvimento, copie `.env.example` para `.env.local` e preencha o token, a senha e o ID do banco Inbox. O arquivo `.env.local` está ignorado pelo Git.

Os testes usam uma API e um IndexedDB simulados: cobrem autenticação, schemas, paginação, criação com relações, reenvio sem duplicação, edição parcial, conflitos, conclusão, datas, anexos, exclusão, rascunhos e edições durante salvamento. Não acessam seu workspace.

A validação real do token, dos nomes das propriedades e dos arquivos aceitos pelo Notion deve ser feita após publicar. A tela mostra qual propriedade precisa ser ajustada se a estrutura não coincidir.
