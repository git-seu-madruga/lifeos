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

## Aniversários e contatos — nova aba

A aba Aniversários é exclusivamente Pessoal, como Diário e Finanças. A ordem das abas continua ajustável. Há busca por nome, próximos sete dias (incluindo hoje), aniversariantes do mês selecionado e contatos em ordem alfabética. As contagens acompanham a busca. É possível criar, editar e excluir contatos com confirmação. As edições são sincronizadas automaticamente, seguindo o mesmo mecanismo das demais abas.

### Configuração no Notion

1. Dentro da página LifeOS, crie um banco de dados de página inteira chamado **Contatos**.
2. Crie exatamente estas propriedades:

| Propriedade | Tipo no Notion | Preenchimento |
| --- | --- | --- |
| Nome | Título | Nome do contato |
| Dia | Número | Dia do nascimento/aniversário |
| Mês | Número | Mês do nascimento/aniversário |
| Ano de nascimento | Número | Opcional; deixe vazio se não souber |

Não utilize uma propriedade Data para o aniversário: separar os números permite cadastrar dia e mês sem inventar um ano. O campo `LifeOS ID` é criado automaticamente pelo app na primeira gravação; não o altere. Para cadastrar diretamente pelo Notion, preencha Nome, Dia e Mês; o ano é opcional. Não use datas impossíveis ou nascimento futuro.

3. Garanta que a conexão interna do LifeOS tem acesso a esse banco. Confira em Conexões no menu do banco; se necessário, adicione a conexão que já utiliza nos outros bancos.
4. Copie o link do banco. O ID é o trecho de 32 caracteres antes de `?v=`, não o ID da visualização depois de `v=`.
5. No **mesmo projeto Vercel**, adicione `NOTION_CONTACTS_DATABASE_ID` com esse ID. Mantenha as variáveis existentes e o mesmo `NOTION_TOKEN`.
6. Substitua os arquivos do repositório pelos deste pacote e faça um novo deploy. Não envie `.env.local`, `node_modules` ou `.next`. Se o deploy ocorreu antes de adicionar a variável, faça um Redeploy depois.

Nenhuma alteração é necessária nos bancos de Projetos, Marcos, Tarefas, Inbox, Diário ou Finanças. Até configurar o novo banco, as outras abas continuam funcionando e Aniversários mostra as instruções de configuração.

### Cadastro e Inbox

No formulário de contato, digite dia e mês sem as barras (a máscara as insere). O ano é um campo separado e **não é preenchido automaticamente**: aqui ele representa nascimento, não o ano corrente. Sem ano, o app mostra apenas o aniversário; com ano, mostra quantos anos a pessoa completa no ano selecionado ou no próximo aniversário. Para nascidos em 29/02, o lembrete ocorre em 28/02 nos anos não bissextos, preservando 29/02 no cadastro.

Com a aba **Aniversários** selecionada, abra a entrada no Inbox e use a opção de transformar em contato. O texto deve conter exatamente duas linhas:

```text
Ana Costa
04/10/1990
```

Ou, se não souber o ano:

```text
João Lima
07/10
```

A primeira linha é o nome e a segunda aceita DD/MM ou DD/MM/AAAA. Conteúdo inválido permanece no Inbox. Se já existir o mesmo nome, o app pede confirmação antes de criar outro contato. Ao converter, o cadastro é criado e aberto para edição na aba Aniversários; fechar o editor mantém o contato convertido. O servidor grava o contato antes de remover a entrada do Inbox. Exclusões saem da listagem do app, sem histórico no LifeOS; como nas outras exclusões, a API do Notion envia a página à lixeira do Notion.

### Verificação deste pacote

Os testes automatizados usam mocks da API do Notion, não sua conta real. Depois do deploy, teste um contato com ano e outro sem ano, a conversão do Inbox, a edição, a exclusão e a persistência após atualizar a página. Os aniversários e o dia de hoje usam a data local do dispositivo.

## Compras — listas rápidas sem histórico no LifeOS

A aba Compras permite criar listas em **Pessoal** ou **Trabalho**, adicionar e editar itens, marcar os comprados para removê-los imediatamente e finalizar/excluir a lista com confirmação. Não há área de itens concluídos, arquivo ou histórico no app. Os novos itens entram no início e podem ser reordenados por arraste; a ordem escolhida é salva no Notion. Uma lista vazia permanece disponível até ser finalizada.

Os ícones das abas têm 15 px, aproveitando a cor e os nomes existentes. A ordem por arraste continua funcionando. No desktop (a partir de 1000 px), o Inbox permanece à esquerda; a tela principal de Compras mostra blocos para as listas, como em Projetos. Clique em um bloco para abrir e em Voltar às listas para retornar. Em telas menores, o Inbox fica acima do conteúdo. A busca dos blocos filtra por nome e acompanha o contexto selecionado.

### Novo banco no Notion

1. Dentro da página LifeOS, crie um banco de página inteira chamado **Listas de compras**.
2. Configure estas propriedades com os nomes exatos:

| Propriedade | Tipo | Configuração |
| --- | --- | --- |
| Nome | Título | Nome da lista |
| Contexto | Seleção | Opções **Pessoal** e **Trabalho** |
| Itens | Texto | Deixe vazio; o app gerencia este conteúdo |

É apenas um banco: cada página representa uma lista. `LifeOS ID` é criado automaticamente na primeira gravação. Não são necessárias relações ou outro banco para os itens.

3. Confira que a conexão interna atual do LifeOS tem acesso ao banco.
4. Copie o ID do banco do link (antes de `?v=`, e não o ID da visualização).
5. Adicione **`NOTION_SHOPPING_DATABASE_ID`** no mesmo projeto Vercel. Mantenha todas as variáveis existentes, inclusive o token da conexão.
6. Atualize o repositório com os arquivos do pacote e faça o deploy depois de adicionar a variável. Não envie `node_modules`, `.next` ou arquivos `.env.local`.

Nenhuma propriedade precisa ser acrescentada aos demais bancos. Sem esse novo ID, Compras mostra instruções e as outras abas continuam disponíveis.

O campo Itens usa internamente JSON para manter os IDs dos itens estáveis. Para cadastrar uma lista diretamente no Notion, é possível escrever **uma linha por item** nesse campo; o app lê esse formato e passa a usar JSON ao editar os itens. Para editar uma lista já usada pelo app, prefira a tela Compras. Não altere o campo técnico LifeOS ID.

### Integração com o Inbox

Selecione a aba **Compras**. No Inbox, digite o nome da lista na primeira linha e os itens nas linhas seguintes, usando **Shift + Enter** entre as linhas. **Enter** salva a entrada do Inbox:

```text
Mercado
Leite — 2 caixas
Ovos — 1 dúzia
Café
```

Abra essa entrada e escolha **Transformar em lista de compras**. Se o contexto selecionado for Pessoal ou Trabalho, ele será usado. Em Todos, o app pede que escolha um dos dois contextos; cancelar mantém o Inbox intacto.

Se existir uma lista de mesmo nome **no contexto escolhido**, sem distinção de maiúsculas e minúsculas e ignorando espaços nas extremidades, o app insere os novos itens no topo, mantendo a ordem das linhas do Inbox. Os itens antigos e sua ordem são preservados. Listas Pessoal e Trabalho com o mesmo nome permanecem separadas. Linhas vazias são ignoradas e itens repetidos são mantidos como foram digitados. Se houver duas listas de mesmo nome no mesmo contexto, renomeie uma antes de converter. A interface evita criar ou renomear listas dessa forma.

A conversão seleciona a lista de destino. Nome sem itens, dados inválidos ou cancelamento não removem a entrada do Inbox. O servidor salva a lista antes de enviar a entrada do Inbox à lixeira; reenvios após uma falha usam IDs estáveis para evitar duplicação dos itens.

Limites: nome com até 200 caracteres, até 500 itens por lista, até 500 caracteres por item e 50.000 caracteres no conteúdo técnico da lista.

### Exclusão e teste após deploy

Ao marcar um check, o item é removido, sem confirmação adicional. Não há botão de excluir item: o check remove o item, e Editar permite corrigir seu texto. **Finalizar e excluir lista** pede confirmação e remove a lista inteira. Não há histórico mantido pelo LifeOS. A API do Notion envia páginas de listas excluídas à lixeira do próprio Notion; o app não controla nem elimina o histórico de versões que o Notion possa manter.

A sincronização é automática, com rascunho local e indicação de alterações pendentes. Aguarde **Salvo no Notion** antes de fechar o navegador. Os testes do pacote utilizam mocks; após o deploy, confira criação em ambos os contextos, conversão com nome em letras diferentes, inclusão no topo, remoção por check e persistência após recarregar a página.

### Compras: blocos e ordem dos itens

O menu lateral de listas foi removido. A tela principal tem blocos com nome, contexto, quantidade e prévia dos itens. A busca e o contexto filtram os blocos; ao voltar de uma lista, a busca é preservada enquanto a aba permanece aberta.

Dentro da lista, arraste a alça ⋮⋮ do item para cima ou para baixo e solte sobre o item de destino. Funciona com mouse ou toque. Pelo teclado, foque a alça e use Alt + seta para cima/baixo. Os checks continuam removendo itens comprados. Novos itens manuais entram no topo. Os itens vindos do Inbox são inseridos como um grupo no topo, preservando a ordem das linhas.

Não há alteração no banco de dados ou nas variáveis da Vercel para esta atualização. Mantenha o banco Listas de compras e NOTION_SHOPPING_DATABASE_ID existentes. Atualize os arquivos no GitHub e faça o deploy. Após o deploy, confira o arraste e recarregue para verificar a ordem salva.

### Correção do arraste e ordenação dos blocos

O arraste de Compras usa eventos de ponteiro para mouse, toque e caneta. Arraste a alça ⋮⋮ dos itens ou dos blocos. O clique no restante do bloco abre a lista; o texto Abrir lista foi removido. No teclado, Alt + setas move o item ou bloco pela alça.

A ordem dos **itens** é sincronizada no Notion. A ordem dos **blocos** é uma preferência salva no navegador, como a ordem das abas, e é mantida ao alternar entre os contextos; novos blocos aparecem ao final. Outros navegadores podem ter uma ordem diferente. A busca e o filtro de contexto não apagam a ordem das listas ocultas.

As inclusões manuais aparecem acima dos itens existentes. Exemplo: adicionar Leite e depois Café resulta em Café, Leite. Uma conversão do Inbox com Ovos e Bananas insere Ovos, Bananas acima desses itens, preservando a ordem das linhas. Não é necessário alterar o Notion nem as variáveis da Vercel nesta atualização.

### Correção da sobreposição do Inbox

Os diálogos do Inbox e da escolha de contexto de Compras são renderizados fora da barra lateral, acima dos blocos e das alças de arraste. O seletor de contexto fica também acima do diálogo original do Inbox. Não há alteração no Notion ou nas variáveis da Vercel.

## Hábitos — cadastro visual e progresso diário

A aba Hábitos tem cards diários, paleta de oito cores e pacote interno de 16 ícones SVG. Hábitos usa apenas o contexto Pessoal, com as demais opções bloqueadas. O contexto não aparece no cadastro ou nos cards. A cor aparece no ícone, no fundo e contorno do card concluído, no check, na barra de progresso do dia e no acompanhamento. No cadastro e na edição há uma prévia da escolha. Trocar nome, cor, ícone ou contexto mantém as marcações existentes.

### Bancos no Notion

Crie **dois bancos de página inteira**, dentro da página LifeOS, e dê acesso à mesma conexão interna que já usa no app.

**Hábitos**:

| Propriedade | Tipo | Configuração |
| --- | --- | --- |
| Nome | Título | Nome do hábito |
| Contexto | Seleção | Pessoal e Trabalho |
| Cor | Texto | Código da paleta, gerenciado pelo app |
| Ícone | Texto | Código do ícone, gerenciado pelo app |
| Início | Data | Dia em que o hábito começou |

**Registros de hábitos**:

| Propriedade | Tipo | Configuração |
| --- | --- | --- |
| Nome | Título | Gerenciado pelo app |
| Hábito | Relação | Vinculado ao banco Hábitos; uma página por registro |
| Data | Data | Dia concluído, sem horário |

Não é necessário um campo Concluído: a presença de um registro representa a conclusão naquele dia. Desmarcar remove esse registro da listagem. O campo técnico LifeOS ID é criado automaticamente na primeira gravação em ambos os bancos; não o altere. Prefira criar e editar os hábitos pelo app para escolher os códigos válidos.

Na Vercel atual, acrescente:

```text
NOTION_HABITS_DATABASE_ID=ID_DO_BANCO_HABITOS
NOTION_HABIT_LOGS_DATABASE_ID=ID_DO_BANCO_REGISTROS_DE_HABITOS
```

Copie os IDs dos links dos bancos (trecho de 32 caracteres antes de `?v=`), não os IDs das visualizações. Mantenha o token, a senha e todos os IDs existentes. Atualize os arquivos no GitHub e faça o deploy depois de acrescentar as variáveis. Se algum dos dois IDs estiver ausente, a aba mostra instruções e as demais abas continuam funcionando. Nenhuma alteração é necessária nos bancos anteriores.

### Marcação e renovação diária

Clique no card para concluir; clique novamente para desmarcar. A barra mostra a proporção de hábitos disponíveis concluídos no dia, com um segmento colorido para cada um. Novos hábitos começam hoje. A data pode ser digitada com a máscara já usada no app ou selecionada no calendário. Há navegação para dias anteriores e botão Hoje. Não é possível marcar dias futuros ou anteriores ao início do hábito.

O dia dos hábitos segue **America/Sao_Paulo**. Ao virar o dia, os cards de hoje ficam disponíveis novamente, sem apagar o progresso anterior. A tela verifica a mudança a cada 30 segundos e ao retornar à janela. Se você está consultando uma data antiga, ela continua selecionada. As marcações são salvas automaticamente no Notion; aguarde Salvo no Notion antes de fechar.

### Acompanhamento

- **Mês:** uma linha por hábito, quadrados por dia, barras na cor do hábito e contagem/percentual de dias concluídos. Clique nos quadrados disponíveis para marcar ou corrigir o histórico.
- **Ano:** doze meses por hábito, com percentual e intensidade de cor. Clique em um mês para abrir o detalhe diário. O resumo considera todos os dias elegíveis do ano até hoje.
- Dias futuros e dias anteriores ao início não contam como falhas. Um hábito criado no meio do mês começa a contar naquele dia. Sem dias elegíveis, o resumo mostra 0/0 e 0%, e os meses indisponíveis mostram um traço.

Excluir um hábito pede confirmação e remove suas marcações também. As páginas excluídas vão à lixeira do Notion, como nas outras abas. Não há pausa, frequência semanal ou metas por quantidade nesta versão: todos os hábitos são diários. O Inbox continua disponível para captura, mas o cadastro de hábitos é feito pelo botão Novo hábito.

Códigos aceitos, se cadastrar manualmente no Notion:

- Cor: blue, green, purple, orange, cyan, pink, yellow, red.
- Ícone: book, water, stretch, walk, study, fitness, sleep, food, heart, meditate, home, work, music, sun, plant, star.

### Validação após o deploy

Os testes automatizados usam mocks, sem acessar sua conta real do Notion. Confira criar com diferentes cores/ícones, marcar e desmarcar, recarregar a página, editar mantendo as marcações, consultar mês/ano, alternar contextos e conferir a renovação no dia seguinte. O pacote inclui também todas as correções recentes de Compras.

### Layout ampliado e Hábitos pessoal

Hábitos agora é exclusivamente Pessoal; o app grava novos hábitos com esse contexto. Mantenha a propriedade Contexto no Notion, pois ela continua sendo usada pela integração. Hábitos de Trabalho eventualmente já existentes ficam preservados no Notion, mas não são exibidos nesta versão.

No desktop, o Inbox fica no canto esquerdo e a área principal ocupa a largura restante até a margem direita. O Inbox tem somente o divisor vertical, sem borda inferior. Os cards de hábitos ficaram mais compactos. O acompanhamento usa toda a largura disponível; em áreas estreitas, os dias se organizam em grupos de sete colunas por hábito, sem barra horizontal, preservando todos os dias do mês. O modo anual adapta os meses em grupos de quatro colunas em áreas estreitas. O ícone de Finanças passa a ser um cifrão no mesmo estilo SVG das demais abas.

Não é necessário alterar bancos ou variáveis da Vercel. Atualize os arquivos no GitHub e faça o deploy.

### Navegação das abas no celular

Deslize horizontalmente sobre os botões das abas para acessar todas as seções. O gesto move a barra sem selecionar ou reordenar abas por acidente; o trilho de rolagem fica invisível. Para mudar a ordem pelo toque, segure a aba por cerca de meio segundo antes de arrastar. O arraste no desktop e Alt + setas continuam disponíveis. Não há alteração no Notion ou nas variáveis da Vercel.
