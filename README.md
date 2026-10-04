# LifeOS — atualização com Finanças

Base: v3 com anexos em Projetos e Tarefas. Sem painel de configurações. Projetos, tarefas, marcos e Inbox agora vêm do Notion. Diário tem calendário, texto formatado e anexos. Finanças agora tem categorias, lançamentos e um gráfico Sankey interativo.

## Atualizar o aplicativo atual

1. Crie apenas os dois novos bancos financeiros abaixo, dentro da página LifeOS no Notion. Mantenha os bancos existentes de Projetos, Marcos, Tarefas, Inbox e Diário.
2. Confira se a conexão interna LifeOS tem acesso aos dois bancos novos e permissões de ler, inserir e atualizar conteúdo.
3. No projeto atual da Vercel, mantenha todas as variáveis existentes, incluindo NOTION_TOKEN, LIFEOS_PASSWORD e os IDs de Inbox e Diário. Acrescente apenas NOTION_FINANCE_CATEGORIES_DATABASE_ID e NOTION_FINANCE_TRANSACTIONS_DATABASE_ID com os IDs dos bancos financeiros.
4. Envie o conteúdo deste ZIP ao repositório e à branch que já alimentam seu app na Vercel, preservando as pastas. Não é necessário criar outro fork nem outro projeto na Vercel.
5. Faça um novo deploy após cadastrar as variáveis e enviar os arquivos. Acesse pelo endereço que já utiliza e entre com a mesma senha.
6. Na aba Finanças, crie suas categorias em Gerenciar categorias e adicione os valores. Aguarde Salvo no Notion antes de fechar.

O pacote mantém as funcionalidades atuais de Projetos, Tarefas, Inbox e Diário. A mudança global no cabeçalho centraliza os contextos. Finanças usa apenas os dois novos bancos financeiros e fica no contexto Pessoal. Os IDs padrão de Projetos, Marcos e Tarefas continuam os mesmos; não precisa cadastrá-los novamente na Vercel. Sem configurar os dois bancos novos, Finanças mostra as instruções de configuração e as demais telas continuam disponíveis.

## Finanças: criar os bancos no Notion

### Categorias financeiras

| Propriedade | Tipo | Configuração |
|---|---|---|
| Nome | Título | Nome escolhido por você, como Salário ou Aluguel |
| Tipo | Selecionar | Entrada, Saída |

### Lançamentos financeiros

| Propriedade | Tipo | Configuração |
|---|---|---|
| Nome | Título | O app preenche com o nome da categoria |
| Categoria | Relação | Categorias financeiras; limite de uma página |
| Data (ou a coluna existente Mês) | Data | Sem horário; guarda o dia completo do lançamento |
| Valor | Número | Formato Real/R$; valor positivo, por exemplo 123,45 |
| Observação | Texto | Opcional por lançamento; o app cria a propriedade na primeira gravação se faltar |

No Notion, Valor guarda reais. Internamente, o app calcula em centavos para evitar diferenças de arredondamento. Não crie uma categoria para a sobra ou para o déficit: os dois são gerados automaticamente pelo gráfico. Não existe campo Contexto nesses bancos; Finanças é sempre pessoal.

No projeto atual da Vercel, adicione:

```text
NOTION_FINANCE_CATEGORIES_DATABASE_ID=ID_DO_BANCO_CATEGORIAS
NOTION_FINANCE_TRANSACTIONS_DATABASE_ID=ID_DO_BANCO_LANCAMENTOS
```

Use o ID do banco, não o ID de visualização após `v=`. Confira o acesso da conexão. LifeOS ID é acrescentado automaticamente para evitar duplicatas em reenvios. Se um banco tiver várias fontes, use opcionalmente `NOTION_FINANCE_CATEGORIES_DATA_SOURCE_ID` e `NOTION_FINANCE_TRANSACTIONS_DATA_SOURCE_ID`. Sem os dois IDs financeiros, as demais telas continuam disponíveis e Finanças mostra as instruções de configuração.

## Atualização para datas completas

Não precisa criar novos bancos ou alterar variáveis na Vercel. A coluna existente Mês no banco Lançamentos financeiros já é do tipo Data e passa a guardar DD/MM/AAAA. Você pode mantê-la com esse nome ou renomeá-la para Data; o app aceita os dois nomes. Se criar o banco agora, prefira Data. Não converta essa propriedade para Texto.

Registros existentes mantêm a data que já está no Notion; os criados pela versão mensal ficam no dia 01 do respectivo mês, pois antes o app não registrava o dia. Rascunhos antigos ainda pendentes também são compatíveis. Você pode editar as datas pelo LifeOS para informar o dia real. O filtro por período inclui ambos os dias de limite; as visualizações mensal e anual continuam incluindo todos os dias do mês/ano.

## Usar Finanças

- Os contextos ficam centralizados no espaço livre entre o logo LifeOS e o botão redondo de atualizar. Em Finanças e Diário, Pessoal fica selecionado e a mudança de contexto é bloqueada; ao sair, o contexto anterior continua disponível nas outras seções.
- Gerenciar categorias apresenta duas colunas, Entradas e Saídas, em ordem alfabética. Em telas estreitas, elas ficam uma abaixo da outra. As opções de seleção e os nomes no gráfico também seguem ordem alfabética.
- Crie nomes de entrada e saída em Gerenciar categorias. Depois, selecione tipo, categoria, data e valor em Adicionar valor. Cada inclusão cria um lançamento e vários lançamentos podem compartilhar a mesma categoria e data.
- Abaixo dos campos de inclusão, Observação (opcional) aceita texto com quebras de linha. A observação pode ser lida e alterada no painel de edição de cada lançamento; não muda os valores nem o gráfico. A propriedade Texto Observação é criada automaticamente no banco Lançamentos financeiros na primeira gravação. Você pode criá-la manualmente antes, se preferir. Registros antigos começam sem observação.
- O botão Hoje ao lado dos filtros volta à visualização mensal do mês atual, inclusive quando a consulta estava por ano ou período.
- Use Mês, Ano ou Período para consolidar. O período usa DD/MM/AAAA e inclui as duas datas das pontas. A data de criação/edição dos lançamentos também usa DD/MM/AAAA: digitar dia e mês e pressionar Tab/Enter completa o ano corrente. A visualização mensal continua com MM/AAAA e a anual continua por ano completo. Nos campos de valor, a máscara exibe R$ e separadores de milhar durante a digitação. Tab ou sair do campo completa duas casas decimais: 1250 vira R$ 1.250,00 e 1250,5 vira R$ 1.250,50. A máscara vale também ao editar lançamentos.
- Entradas e saídas são somadas por categoria. Saldo restante positivo aparece à direita. Saldo faltante aparece à esquerda, em vermelho e com valor negativo, para equilibrar o diagrama quando as saídas superam as entradas. O título acima do gráfico mostra apenas Entradas do período, sem somar o déficit. A espessura da faixa faltante representa a magnitude do déficit para equilibrar o desenho. Ele não é registrado como receita; o resumo continua mostrando o saldo negativo. Saldo zero não cria um bloco de saldo.
- Clique no nome, faixa ou bloco de uma categoria para abrir os lançamentos do período. Edite valor, data ou categoria, ou exclua com confirmação. Os blocos de saldo automático não podem ser editados ou excluídos.
- As barras do gráfico têm posições fixas. Clique nas categorias para editar os lançamentos. Em telas pequenas, o gráfico pode ser rolado horizontalmente.
- Renomear uma categoria altera seu nome no gráfico em todos os períodos. Trocar seu tipo, com confirmação quando já há valores, muda a classificação de todos os lançamentos vinculados. Excluir uma categoria pede confirmação e exclui seus lançamentos de todos os meses; o aviso informa a quantidade.
- Tudo salva automaticamente no Notion. A exclusão usa a lixeira nativa do Notion. Alterações feitas no próprio Notion são carregadas pelo botão Atualizar.

## Variáveis existentes

Mantenha os valores que já funcionam no projeto atual. Não substitua o token, a senha ou os IDs atuais por campos vazios do arquivo .env.example. Esse arquivo é apenas um modelo para desenvolvimento local. Para publicar esta atualização, cadastre somente as duas novas variáveis financeiras e faça novo deploy.

O token só é utilizado no servidor. Os endpoints de leitura, gravação e anexos exigem sessão autenticada. A sessão usa cookie HttpOnly, SameSite e validade de 7 dias. Trocar a senha invalida as sessões. As tentativas de login têm limitação por instância do servidor; para um produto com múltiplos usuários, substituir por autenticação dedicada.

## Bancos configurados

- Projetos: `3ec530f0-f112-80d5-9097-ea21f9ce45d7`
- Marcos: `3ed530f0-f112-80e0-b1e5-f2a861954669`
- Tarefas: `3ec530f0-f112-803b-a108-f7778cdee362`

A conexão LifeOS deve ter acesso à página que contém os bancos configurados e capacidades de ler, inserir e atualizar conteúdo. O app descobre a fonte de dados de cada banco pela API. Se houver várias fontes no mesmo banco, defina `NOTION_PROJECTS_DATA_SOURCE_ID`, `NOTION_MILESTONES_DATA_SOURCE_ID` ou `NOTION_TASKS_DATA_SOURCE_ID`; para Inbox, `NOTION_INBOX_DATA_SOURCE_ID`, e para Diário, `NOTION_DIARY_DATA_SOURCE_ID`.

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

### Criar o banco Diário

Dentro da página LifeOS, crie um banco em tabela chamado **Diário** com:

| Propriedade | Tipo | Uso |
|---|---|---|
| Nome | Título | Data DD/MM/AAAA preenchida pelo app |
| Data | Data | Dia da entrada, sem horário |
| Conteúdo | Texto | Texto completo com formatação simples |
| Anexos | Arquivos e mídia | Arquivos da entrada |

Confira o acesso da conexão LifeOS. Na Vercel, configure `NOTION_DIARY_DATABASE_ID` com o ID desse banco e faça novo deploy. Não use o ID da visualização após `v=`. Os outros IDs e variáveis já configurados continuam iguais.

O app adiciona LifeOS ID automaticamente na primeira gravação. O Diário aceita uma entrada por data; ao criar diretamente no Notion, preencha Data e Conteúdo e evite duas páginas para o mesmo dia. Conteúdo é uma propriedade Texto, não o corpo da página. Sem o ID do Diário, as demais seções continuam funcionando e a aba Diário mostra as instruções de configuração.

### Calendário, leitura e edição

- O calendário mostra um mês completo, destaca hoje e marca os dias com entrada. Há botões para avançar ou voltar um mês ou ano, botão Hoje e campo com máscara DD/MM/AAAA. O campo segue o estilo das demais datas. Digitar só dia e mês completa o ano atual ao sair do campo. Confirmar uma data digitada ou escolhê-la no seletor abre a entrada do dia e seleciona a data no calendário principal. O botão Hoje também abre a entrada de hoje.
- Clique em um dia para abrir a entrada. Um dia sem registro abre para escrever; selecionar a data sozinha não cria uma página vazia.
- Entradas existentes abrem para leitura. Clique em Editar entrada para alterar texto ou anexos. Concluir edição, Fechar, mudar de data/mês ou sair da aba bloqueia a edição novamente. O bloqueio é uma proteção da interface; o salvamento continua automático.
- O texto aceita quebras de linha, negrito, itálico, títulos e listas pelos botões. A formatação simples usa `**negrito**`, `*itálico*`, `## Título` e linhas iniciadas por `- `. No Notion essas marcações ficam no campo Conteúdo; no LifeOS a leitura exibe a formatação.
- Anexos podem ser vistos e baixados em leitura. Incluir e excluir exige desbloquear a edição; excluir pede confirmação. O limite de envio é 4 MB por arquivo. Texto limitado a 10.000 caracteres por dia.
- Alterações no app salvam automaticamente; alterações em outro dispositivo ou diretamente no Notion aparecem ao clicar Atualizar.

### Inbox para Diário

Na aba Diário, abra uma entrada do Inbox e clique em Transformar em nota do diário. O texto completo é incluído na data de hoje, conforme o horário local do navegador. Se já houver entrada, uma confirmação permite reabri-la e acrescentar o texto ao final, precedido por uma quebra de linha, preservando o texto e os anexos existentes. Cancelar mantém o Inbox e o Diário intactos, com o painel do Inbox aberto.

Ao confirmar, a data de hoje fica selecionada e a entrada abre em edição, com o cursor no final do texto. Você pode continuar escrevendo; fechar, mudar de data ou sair do Diário bloqueia novamente a edição. O salvamento é automático e a remoção do Inbox no Notion só ocorre depois de salvar o Diário. Em caso de falha, use Tentar salvar novamente. Se o banco Diário não estiver configurado ou o texto ultrapassar o limite de 10.000 caracteres, a entrada permanece no Inbox.

### Ordem das abas

Arraste os botões das abas para a posição desejada. No teclado, foque a aba e use Alt + seta esquerda/direita. Em telas de toque, arraste horizontalmente. A ordem é salva neste navegador; a primeira aba da esquerda abre como visualização padrão no próximo acesso. Cada navegador/dispositivo guarda sua própria ordem. Na primeira abertura, a ordem começa por Projetos.

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

Na primeira gravação, o app acrescenta automaticamente a propriedade de texto `LifeOS ID` nos bancos configurados. Ela permite reconhecer uma criação já concluída caso a conexão falhe antes da resposta e evita duplicatas nas tentativas seguintes. Não altere essa propriedade; você pode ocultá-la nas visualizações do Notion.

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

Para desenvolvimento, copie `.env.example` para `.env.local` e preencha o token, a senha e os IDs de Inbox e Diário. O arquivo `.env.local` está ignorado pelo Git.

Os testes usam uma API e um IndexedDB simulados: cobrem autenticação, schemas, paginação, criação com relações, reenvio sem duplicação, edição parcial, conflitos, conclusão, datas, anexos, exclusão, rascunhos e edições durante salvamento. Não acessam seu workspace.

A validação real do token, dos nomes das propriedades e dos arquivos aceitos pelo Notion deve ser feita após publicar. A tela mostra qual propriedade precisa ser ajustada se a estrutura não coincidir.
