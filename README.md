# LifeOS — Guia de configuração e uso

Documento único da versão atual. Este README substitui os arquivos INSTRUCOES das entregas anteriores e deve ser atualizado nas próximas revisões, sem acumular orientações de versões antigas.

## 1. Atualizar uma instalação existente

1. Aguarde **Salvo no Notion** antes de atualizar. Se houver erro de salvamento, preserve o texto e resolva o erro primeiro.
2. Extraia o ZIP. Envie o **conteúdo da pasta lifeos** para a raiz do repositório, substituindo os arquivos existentes. Não crie uma segunda pasta lifeos dentro do projeto.
3. Mantenha as variáveis e os bancos já configurados. Esta revisão não exige novos bancos ou variáveis. O campo Inativa é acrescentado automaticamente ao banco de categorias financeiras.
4. Faça o deploy na Vercel e atualize a página/app instalado.
5. Remova do repositório os antigos arquivos INSTRUCOES-*.md: o envio pelo navegador não remove arquivos que deixaram de existir no ZIP. Todas as instruções atuais estão aqui.

Para enviar mais de 100 arquivos pelo navegador do GitHub, crie uma branch, envie em lotes e faça merge apenas quando todos os arquivos estiverem presentes. Isso evita publicar uma versão parcial em produção. Git/GitHub Desktop também permitem enviar o projeto completo.

Não envie node_modules, .next, arquivos com credenciais reais ou variáveis de ambiente locais. O arquivo .env.example é apenas um modelo sem segredos.

### Mudanças desta revisão

- Na linha Nova tarefa neste projeto, projetos compartilhados exigem escolher explicitamente Péricles ou Letícia. Não há responsável pré-selecionado; após adicionar, a seleção é limpa para a próxima tarefa.
- Projetos e tarefas compartilhados têm selo dourado com ícone de pessoas; as tarefas também mostram o responsável. O campo de compartilhamento tem destaque no editor.

- Descompartilhar exige confirmação com o nome do proprietário para quem o registro ficará privado. Cancelar preserva o compartilhamento e o responsável.
- Projetos compartilhados não têm responsável. Cada tarefa compartilhada tem seu próprio responsável obrigatório, com o usuário logado como padrão ao criar.
- Inclui a correção de seleção de texto, calendários, descarte de tarefas vazias, notificação de Recados, sincronização incremental e todas as alterações anteriores.
- Não exige novos bancos ou variáveis. Os campos necessários continuam sendo acrescentados automaticamente aos bancos existentes.

## 2. Contas, privacidade e contextos

| Área | Acesso |
| --- | --- |
| Inbox, Diário, Hábitos e registros, Entretenimento | Privado de cada conta |
| Projetos, Marcos e Tarefas | Privado por padrão; compartilhamento opcional entre as duas contas |
| Compras, Aniversários, Finanças | Compartilhado entre as duas contas |
| Recados | Mensagens entre as duas contas, com leitura confirmada pelo destinatário |
| Backup e restauração | Apenas a conta principal; inclui dados das duas contas |

Contas autorizadas: **periclesbernardes@gmail.com** e **leticiacost3@gmail.com**. Os dados privados antigos sem proprietário pertencem à primeira conta.

Pessoal/Trabalho é uma classificação, não separação de usuário. Projetos, Tarefas e Compras têm ambos os contextos. Diário, Finanças, Aniversários, Hábitos, Entretenimento e Recados usam Pessoal fixo, com Todos e Trabalho bloqueados.

A separação é aplicada pelo servidor do LifeOS. Quem tiver acesso direto aos bancos completos no Notion terá o acesso concedido pelo próprio Notion. Compras, Finanças e Aniversários mostram nome e horário da última edição feita pelo app; edições diretas no Notion não identificam a conta Google.

## 3. Uso diário

### Navegação e datas

Arraste as abas para ordenar; a primeira é a tela inicial. A preferência fica no navegador/dispositivo, não é sincronizada por usuário. No celular, deslize horizontalmente as abas; a barra de rolagem fica oculta. O menu da conta contém **Sair** e, para Péricles, **Backup e restauração**.

As datas usam **DD/MM/AAAA**, com barras automáticas e calendário alternativo. Ao preencher apenas dia e mês e sair do campo, o ano atual é completado. **Aniversários é exceção:** o ano pode ficar desconhecido. Links em textos/comentários aparecem clicáveis nas visualizações de leitura.

### Inbox

No desktop, fica à esquerda; no celular, pode ser aberto/recolhido. O campo cresce com o texto. No celular, Enter cria uma nova linha e o botão Adicionar confirma. No desktop, use Shift+Enter para quebra de linha.

| Destino | Texto da entrada |
| --- | --- |
| Projeto ou tarefa | Primeira linha: título; demais: descrição/anotações |
| Diário | Texto inteiro acrescentado em hoje; se já houver entrada, pede confirmação e reabre para edição |
| Aniversários | Primeira linha: nome; segunda: DD/MM ou DD/MM/AAAA |
| Compras | Primeira linha: nome da lista; demais: um item por linha |
| Recados | Primeira linha: título; demais: mensagem de hoje |

Em Compras, uma lista existente com o mesmo nome, sem diferenciar maiúsculas, recebe os novos itens no início. Os itens acrescentados manualmente também entram no início. Em Recados, o Inbox só é removido depois que o envio é confirmado pelo Notion. Cancelamentos/erros de conversão preservam a entrada. Não há conversão para Finanças, Hábitos ou Entretenimento.

### Projetos e tarefas

Marque Compartilhado no editor para permitir que ambos vejam e editem o registro. Nas tarefas compartilhadas, escolha Péricles ou Letícia no campo Responsável; ele começa com o usuário logado. Projetos não têm responsável fixo. Na linha de criação rápida dentro de um projeto compartilhado, o responsável deve ser escolhido antes de adicionar: não há seleção automática, e o campo é limpo após cada tarefa. A responsabilidade organiza o trabalho e não restringe a edição do item compartilhado.

Tarefas vinculadas seguem obrigatoriamente o compartilhamento do projeto; cada tarefa compartilhada pode ter seu próprio responsável. Tarefas avulsas escolhem livremente o compartilhamento. Alterar o projeto para compartilhado ou privado atualiza seus marcos e tarefas, inclusive filhos acrescentados por outra instância. Ao tornar um projeto privado, uma confirmação informa o nome do criador original, para quem ele e seus filhos retornarão; os responsáveis das tarefas são removidos. Mudar o responsável não transfere a propriedade. Uma tarefa avulsa tornada privada também volta a ficar acessível somente ao seu criador original, informado na confirmação. Cancelar não altera o registro. Registros antigos permanecem privados por padrão.

Projetos e tarefas novos usam Pessoal por padrão em Todos; Trabalho selecionado explicitamente e contexto herdado de projeto são respeitados. Pessoal aparece primeiro nos campos de contexto. Projetos abrem a partir de blocos. O título recebe foco ao criar; entradas novas sem nenhuma alteração são descartadas ao fechar. Projetos têm status Ativo, Pausado, Concluído e Cancelado, exclusão com confirmação, anexos e marcos. O prazo de um marco não pode ultrapassar o prazo final do projeto, quando definido; o marco é referência de cronograma e não gera indicador de atraso.

Tarefas têm Não iniciada, Em andamento, On hold e Concluída, prioridade, datas, projeto/marco opcionais, anotações e anexos. Não há status Cancelada nem páginas relacionadas. Os resumos acompanham os filtros e a busca; os contornos indicam os grupos exibidos. Tarefas concluídas recentes aparecem primeiro. Exclusões não têm histórico no LifeOS; a remoção de páginas é feita pela lixeira do Notion.

### Diário

Uma entrada por dia e usuário. Navegue pelo calendário, setas ou campo de data. Selecionar uma data no campo/calendário abre aquele dia. Entradas existentes são abertas para leitura: use Editar para desbloquear. Ao sair ou trocar o dia, voltam a ficar bloqueadas. Texto aceita múltiplas linhas e formatação simples; pode incluir anexos. Apagar todo o texto sem manter anexos faz o dia voltar ao estado vazio, sem marcador. Uma entrada com anexos ainda tem conteúdo.

### Finanças

Cadastre categorias de Entrada e Saída; elas aparecem em colunas separadas e ordem alfabética. Cada lançamento usa uma categoria, data completa, valor em R$ e observação opcional. O valor ganha duas casas decimais ao sair do campo. O gráfico de fluxo permite abrir a edição pelo nome, sem arraste das barras.

Filtre pelo mês, ano ou intervalo DD/MM/AAAA. Hoje volta ao mês atual. Saldo restante é calculado automaticamente à direita; déficit aparece à esquerda em vermelho e com valor negativo. Não é uma categoria cadastrada. Renomear categorias mantém o vínculo dos lançamentos. Retirar oculta a categoria das opções para novos lançamentos, mantendo registros e totais históricos; Mostrar categorias inativas permite reativar. Recriar o mesmo nome e tipo reativa a original após confirmação. O editor de um lançamento antigo permite manter sua categoria inativa. Criar/editar fora do mês atual pede confirmação, considerando também a data original ao mover um lançamento. Exclusões individuais sempre pedem confirmação, com aviso adicional fora do mês atual.

### Aniversários

Cadastre nome, dia e mês; ano de nascimento é opcional. Com ano conhecido, o resumo informa a idade que a pessoa fará; sem ano, mostra apenas o aniversário. Há busca e destaques da semana/mês. Não complete um ano desconhecido com o ano atual.

### Compras

A tela principal mostra blocos de listas. Clique para abrir e volte para a tela dos blocos. Arraste listas para ordenar e itens dentro da lista para reorganizar. Marcar um item remove-o sem histórico no LifeOS; há edição, sem botão adicional de excluir item. Listas podem ser finalizadas/excluídas rapidamente, sem arquivo de listas passadas no app.

### Hábitos

Crie hábitos com cor da paleta e ícone. Os cartões principais mostram sempre hoje e permitem marcar sem confirmação. Desmarcar/corrigir é feito no resumo mensal, com confirmação para dias anteriores a hoje. As marcações têm destaque de cor e barra de progresso. O acompanhamento mensal/anual permite consultar o histórico. Encerrar e recuperar exigem confirmação. Encerrados ficam ocultos até Mostrar hábitos encerrados; recuperar mantém as marcações, sem preencher os dias em que ficou oculto. Nome repetido gera aviso e permite recuperar o hábito existente. Excluir é diferente de encerrar e remove suas marcações após confirmação.

### Entretenimento

Quatro seções: **Leitura, Jogos, Séries e Filmes**, cada uma com página própria. Use o + da seção; o editor já define seu destino. Há grupos de quero começar, em andamento e concluídos, que podem ser recolhidos, e alternância entre cartões completos e capas pequenas.

Concluir exige a data DD/MM/AAAA. Concluídos aparecem do mais recente para o mais antigo; novas entradas dos outros grupos entram ao fim. Resumos mensais/anuais mostram capa e nome em ordem cronológica, com campo e setas para navegar. Avaliações por estrelas e comentários são pessoais.

Buscas: livros por Open Library (título/autor/capa, preferência por português quando disponível); séries por TVmaze (nome/ano/capa); jogos por IGDB (nome/ano/plataformas/capa); filmes por TMDB (nome/ano/capa, preferência pt-BR). Todos os dados importados podem ser revisados. A disponibilidade depende do catálogo. Busca é o campo inicial; cadastro manual continua possível.

Salvar uma cópia da capa no Notion vem marcado; o arquivo vai para Capa. Desmarcar mantém somente o link, que não é cópia independente. Upload manual aceita JPG, PNG, WebP ou GIF até 4 MB. Os créditos TMDB ficam apenas em Filmes; as fontes e links de origem são preservados.

### Recados

Um recado de cada conta para a outra por dia, considerando America/Sao_Paulo. Texto obrigatório, título opcional, emojis e uma imagem JPG/PNG/WebP/GIF até 4 MB. Não há envio retroativo nem edição após o envio. A confirmação de envio permite revisar antes de salvar definitivamente.

Somente o destinatário marca como lido; o app salva também o horário. O calendário permite reler dias anteriores. Use o campo MM/AAAA, o seletor visual de mês e ano ou as setas para navegar; HOJE volta ao mês e dia atuais. O coração do cabeçalho indica somente o recebido de hoje não lido. Abertura/retorno ao foco e atualização manual verificam o aviso, sem varredura periódica em segundo plano. Um recado que chegar enquanto você permanece no app será reconhecido na próxima atualização ou retorno ao foco.

Texto e título do rascunho são guardados localmente por usuário quando o armazenamento está disponível; a imagem não enviada precisa ser selecionada de novo após recarregar. Aguarde a confirmação de salvamento antes de fechar.

## 4. Salvamento, sincronização e app instalado

As edições comuns são salvas automaticamente. O botão Atualizar relê o Notion; não é obrigatório clicar para cada edição. Envio/leitura de Recados usa salvamento imediato. O horário no cabeçalho indica a última leitura bem-sucedida dos dados, enquanto Salvo no Notion indica a gravação.

Durante o salvamento, o app envia apenas os registros envolvidos, suas versões anteriores para detectar conflitos e as dependências necessárias (por exemplo, o projeto e seus marcos de uma tarefa). Imagens e arquivos já enviados não são reenviados. O servidor usa leitura por ID e consultas filtradas, sem varrer bancos inteiros a cada edição. Novas entradas de Diário e marcações de Hábitos consultam a data envolvida para preservar a unicidade e recuperar falhas parciais.

A carga inicial e o botão Atualizar continuam lendo os dados necessários à visão geral. Esta revisão não implementa paginação das telas nem leitura incremental no retorno ao foco; essas leituras gerais ainda podem crescer com o acervo. Clientes antigos permanecem compatíveis com o servidor, mas só passam a enviar dados reduzidos depois de atualizar a página/app.

Ao voltar para uma aba do navegador ou app em segundo plano, o LifeOS consulta os dados em primeiro plano, com intervalo mínimo entre verificações. Não faz consultas periódicas comuns enquanto está escondido. Formulários abertos, edições pendentes ou salvamentos em andamento adiam a substituição dos dados para preservar texto local. Uma consulta em andamento não sobrescreve edições feitas durante ela.

Não há tela inicial de carregamento a cada retorno: a interface permanece montada e o indicador Atualizar mostra atividade. Se ocorrer conflito, preserve seu texto e revise a atualização; descarte de alterações pendentes exige confirmação. Rascunho local não substitui a confirmação de salvamento: o sistema pode suspender o aplicativo ao trocar de app.

O PWA usa **standalone**, não fullscreen, para evitar o flickering observado no Android. Instale pelo menu do Chrome ou, no Safari/iPhone, Compartilhar → Adicionar à Tela de Início. As abas deslizam horizontalmente. Voltar fecha primeiro o painel aberto; nas abas principais, dois toques permitem sair onde o navegador/sistema suporta esse fluxo. Login Google abre uma janela separada e a sessão é reconhecida ao concluir.

## 5. Notion: bancos e propriedades

Para uma instalação existente, **não recrie os bancos**. Esta seção é referência para conferir nomes/tipos ou configurar uma instalação nova. Autorize a conexão interna LifeOS a ler, inserir e atualizar conteúdo e propriedades em todos os bancos. Use bancos com uma única fonte de dados, salvo configuração explícita de DATA_SOURCE_ID.

Use o ID do banco de dados antes de ?v=; o valor v é a visualização. Textos do LifeOS ficam nas propriedades Texto indicadas abaixo, não no corpo da página. Relações aceitam uma página por valor; uma relação de volta não é exigida pelo app.

### Projetos

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Compartilhado | Caixa de seleção | Acrescentado automaticamente; desmarcado = privado |
| Nome | Título |  |
| Status | Selecionar ou Status | Ativo, Pausado, Concluído, Cancelado |
| Contexto | Selecionar | Pessoal, Trabalho |
| Área | Selecionar |  |
| Prazo final | Data |  |
| Descrição | Texto |  |
| Anexos | Arquivos e mídia |  |

### Marcos

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Compartilhado | Caixa de seleção | Automático; segue o projeto |
| Nome | Título |  |
| Projeto | Relação | → Projetos; uma página |
| Prazo | Data |  |
| Concluído | Caixa de seleção |  |
| Ordem | Número |  |

### Tarefas

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Compartilhado | Caixa de seleção | Acrescentado automaticamente; desmarcado = privado |
| Responsável | Texto | Acrescentado automaticamente; email de uma das duas contas |
| Nome | Título |  |
| Status | Selecionar ou Status | Não iniciada, Em andamento, On hold, Concluída |
| Prioridade | Selecionar | Alta, Média, Baixa |
| Contexto | Selecionar | Pessoal, Trabalho |
| Projeto | Relação | → Projetos; uma página |
| Marco | Relação | → Marcos; uma página |
| Início | Data |  |
| Prazo | Data |  |
| Aguardando | Texto |  |
| Cobrar em | Data |  |
| Anotações | Texto |  |
| Concluída em | Data |  |
| Anexos | Arquivos e mídia |  |

### Inbox

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Conteúdo | Texto |  |

### Diário

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Data | Data |  |
| Conteúdo | Texto |  |
| Anexos | Arquivos e mídia |  |

### Categorias financeiras

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Inativa | Caixa de seleção | Criada automaticamente; mantém o histórico |
| Nome | Título |  |
| Tipo | Selecionar | Entrada, Saída |

### Lançamentos financeiros

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Categoria | Relação | → Categorias financeiras; uma página |
| Data | Data | Aceita a coluna antiga Mês; guarda data completa |
| Valor | Número |  |
| Observação | Texto |  |

### Aniversários

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Dia | Número |  |
| Mês | Número |  |
| Ano de nascimento | Número | Opcional |

### Listas de compras

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Contexto | Selecionar | Pessoal, Trabalho |
| Itens | Texto | Estrutura gerenciada pelo app; não editar manualmente |

### Hábitos

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Encerrado | Caixa de seleção |  |
| Nome | Título |  |
| Contexto | Selecionar | Pessoal, Trabalho (Hábitos usa Pessoal no app) |
| Cor | Texto |  |
| Ícone | Texto |  |
| Início | Data |  |

### Registros de hábitos

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Hábito | Relação | → Hábitos; uma página |
| Data | Data |  |

### Seções de entretenimento

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Tipo | Texto | Gerenciado pelo app; mantenha as quatro seções |
| Ícone | Texto | Gerenciado pelo app; mantenha as quatro seções |
| Cor | Texto | Gerenciado pelo app; mantenha as quatro seções |

### Conteúdos de entretenimento

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Concluído em | Data |  |
| Plataformas | Texto |  |
| Ano | Número |  |
| Nome | Título |  |
| Seção | Relação | → Seções de entretenimento; uma página |
| Autor | Texto |  |
| Status | Selecionar | Quero começar, Em andamento, Concluído |
| Avaliação | Número | 0 a 5 |
| Comentário | Texto |  |
| URL da capa | Texto |  |
| Link de origem | Texto |  |
| Fonte | Texto |  |
| Capa | Arquivos e mídia |  |

### Recados

| Propriedade | Tipo | Observação |
| --- | --- | --- |
| Nome | Título |  |
| Data | Data |  |
| Remetente | Texto |  |
| Destinatário | Texto |  |
| Mensagem | Texto |  |
| Imagem | Arquivos e mídia |  |
| Enviado em | Data |  |
| Lido | Caixa de seleção |  |
| Lido em | Data |  |

O app acrescenta propriedades técnicas: **LifeOS ID**, **LifeOS Usuário** nas áreas privadas, **LifeOS Último editor** e **LifeOS Editado em** nas compartilhadas. Não altere esses campos. Ano, Plataformas e Concluído em de Entretenimento, Encerrado de Hábitos e Observação financeira podem ser acrescentados automaticamente quando ausentes. Compartilhado de Projetos, Marcos e Tarefas e Responsável de Tarefas também são acrescentados automaticamente. Os outros campos de negócio devem ter os nomes/tipos acima.

Registros privados criados diretamente no Notion sem LifeOS Usuário pertencem à conta principal. Para a segunda conta, prefira criar pelo aplicativo. Em Inbox, preencha Conteúdo: Nome é apenas o título resumido. Em Diário, preencha Data e Conteúdo, evitando duplicar um dia do mesmo usuário. Aniversários usa números separados para admitir ano desconhecido.

## 6. Vercel: variáveis

Configure em Settings → Environment Variables. Aplique em Production e nos ambientes de teste realmente usados; após qualquer alteração faça novo deploy. Todos os tokens/segredos ficam somente no servidor, sem prefixo NEXT_PUBLIC_.

| Variável | Uso |
| --- | --- |
| `NOTION_TOKEN` | Token da conexão interna Notion |
| `NOTION_PROJECTS_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_MILESTONES_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_TASKS_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_INBOX_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_DIARY_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_FINANCE_CATEGORIES_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_FINANCE_TRANSACTIONS_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_CONTACTS_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_SHOPPING_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_HABITS_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_HABIT_LOGS_DATABASE_ID` | ID do banco correspondente no Notion |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Segredo OAuth Google |
| `LIFEOS_APP_URL` | https://lifeos-two-kohl-18.vercel.app |
| `LIFEOS_SESSION_SECRET` | Segredo aleatório, pelo menos 32 caracteres; prefira 64 |
| `LIFEOS_ALLOWED_GOOGLE_EMAILS` | periclesbernardes@gmail.com,leticiacost3@gmail.com |
| `LIFEOS_LEGACY_OWNER_EMAIL` | periclesbernardes@gmail.com |
| `UPSTASH_REDIS_REST_URL` | URL REST do Redis dedicado |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST com escrita |
| `NOTION_MEDIA_SECTIONS_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_MEDIA_DATABASE_ID` | ID do banco correspondente no Notion |
| `IGDB_CLIENT_ID` | ID da aplicação Twitch para busca IGDB |
| `IGDB_CLIENT_SECRET` | Segredo da aplicação Twitch |
| `TMDB_READ_ACCESS_TOKEN` | API Read Access Token completo, sem Bearer |
| `NOTION_RECADOS_DATABASE_ID` | ID do banco correspondente no Notion |
| `NOTION_BACKUP_PAGE_ID` | ID da página vazia LifeOS — Backups, não de um banco |

Projetos, Marcos e Tarefas têm os IDs originais desta instalação como padrão no código; as variáveis permitem substituí-los. Inbox precisa ser configurado. As demais áreas exigem seus IDs para funcionar. Hábitos e Finanças usam dois bancos; Entretenimento usa seções e conteúdos. Bancos com várias fontes exigem a variável correspondente **NOTION_…_DATA_SOURCE_ID** (mesmo prefixo de DATABASE_ID). O arquivo .env.example lista as variáveis sem valores secretos. LIFEOS_PASSWORD não é utilizado.

### Login Google

No Google Auth Platform, configure aplicativo Externo, identificação básica **openid, email e profile**, e autorize as duas contas como usuários de teste quando o projeto estiver em Testing. Crie cliente OAuth **Aplicativo da Web**.

- Origem: https://lifeos-two-kohl-18.vercel.app
- Callback exato: https://lifeos-two-kohl-18.vercel.app/api/auth/google/callback

Copie Client ID e Client secret para a Vercel. Domínios de Preview precisam de callback/configuração próprios. Não troque LIFEOS_SESSION_SECRET com rascunhos pendentes: ele também participa da proteção dos rascunhos. A sessão assinada usa cookie HttpOnly e tem validade de sete dias.

### Upstash

Use Redis dedicado ao LifeOS e token REST com escrita. Além da coordenação das gravações e autoria compartilhada, a versão atual guarda progresso/catálogo de backups e o mapeamento de bancos ativos após restauração. **Não limpe o Redis após restaurar.** Não é necessário outro Redis para esta revisão. Indisponibilidade da coordenação bloqueia gravações em vez de permitir operações concorrentes sem controle.

### Catálogos de entretenimento

- **Livros/Open Library** e **séries/TVmaze**: não exigem chave configurada. Pesquise por título; traduções/capas dependem do catálogo.
- **Jogos/IGDB**: crie aplicação confidencial na [Twitch Developer Console](https://dev.twitch.tv/console/apps), com autenticação em dois fatores na conta. URL solicitada no cadastro: a do LifeOS. Use o Client ID e um Client Secret em IGDB_CLIENT_ID/IGDB_CLIENT_SECRET; não são as credenciais Google.
- **Filmes/TMDB**: solicite acesso em [API do TMDB](https://www.themoviedb.org/settings/api) e use o **API Read Access Token**, não a chave v3. O app inclui atribuição na página Filmes.

Referências: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Open Library](https://openlibrary.org/dev/docs/api/search), [TVmaze](https://www.tvmaze.com/api), [IGDB](https://api-docs.igdb.com/), [TMDB](https://developer.themoviedb.org/docs/authentication-application).

## 7. Backup manual e restauração

Crie uma **página comum vazia**, LifeOS — Backups, autorize a conexão e configure seu ID em NOTION_BACKUP_PAGE_ID. Não crie banco vazio. Somente a conta principal acessa o painel pelo menu da conta; o backup reúne ambas as contas.

Criar backup salva as edições pendentes, bloqueia gravações pelo app nas duas contas e copia os bancos configurados para uma nova subpágina. Inclui registros, propriedades compatíveis, relações internas e arquivos suportados, com download/upload e conferência dos anexos. Não altera quais bancos estão ativos. Só cópias verificadas entram no catálogo; mantém as três mais recentes, arquivando a mais antiga após concluir a nova.

Mantenha o painel aberto e visível. Ao sair do painel/trocar de app, pausa entre etapas; use Retomar. Após 15 minutos sem avanço o bloqueio expira: cancele a operação e comece outra. Não edite diretamente no Notion durante a cópia. O tempo depende de registros/anexos; não há rotina diária automática ou execução contínua em segundo plano.

Restaurar exige digitar RESTAURAR, cria primeiro uma cópia de segurança do estado atual, copia a versão escolhida para **novos bancos**, verifica e ativa o conjunto pelo mapeamento no Upstash. Os bancos anteriores não são apagados nem sobrescritos. A URL e as variáveis originais permanecem; o mapeamento restaurado tem prioridade. Alterar apenas IDs da Vercel depois de restaurar não substitui esse mapeamento.

Backups, cópias de segurança e páginas Restaurado ficam sob LifeOS — Backups. Bancos originais permanecem onde já estavam. **O painel ainda não identifica explicitamente qual página Restaurado está ativa. Não apague páginas originais/restauradas sem conferir o mapeamento ativo.** A retenção de três cópias não remove conjuntos antigos anteriormente ativos. Pastas incompletas não são restauráveis pelo painel.

Limites:

- Copia bancos configurados, não todo o workspace, filtros/visualizações, permissões ou comentários nativos do Notion. Anotações/comentários em propriedades do LifeOS são incluídos.
- Arquivos devem estar hospedados no Notion e ter até 20 MB, respeitando o plano. O upload comum do app continua limitado a 4 MB. Capas somente por URL externa precisam ser copiadas para o campo Capa antes do backup.
- Fórmulas, rollups, relações externas, valores paginados além dos suportados, blocos sincronizados, subpáginas dentro de registros e outros tipos não suportados interrompem a cópia; não é considerado backup completo.
- Páginas com mais de 100 blocos diretos podem exigir evolução. Status pode virar Selecionar no destino, mantendo opções.
- Um backup com conjunto de bancos diferente do atual não pode ser ativado automaticamente.
- A cópia no mesmo Notion protege de alterações acidentais, mas depende da mesma conta/serviço. Uma cópia externa é proteção complementar.

Após restaurar, atualize instâncias abertas. Se houver rascunho conflitante, copie/revise antes de descartar. Não apague o Redis ou retire o acesso da integração às páginas restauradas em uso. Um manifesto JSON em cada backup registra seus bancos para recuperação administrativa.

## 8. Conferência e problemas comuns

- Teste ambas as contas: áreas privadas separadas; Compras, Finanças e Aniversários compartilhados.
- Envie Recados nas duas direções. Cancelar confirmação deve preservar o rascunho/Inbox; confirmar deve salvar uma única mensagem. Na outra conta, verifique coração no cabeçalho, abertura em hoje e retorno do logo somente após salvar a leitura. Mensagens antigas não acionam o coração.
- Teste sair/entrar, datas, anexos, ordenação das abas e rolagem no desktop e celular.
- Campo/banco inacessível: confira nome, tipo, ID e permissões da conexão. Não use o ID da visualização.
- Falha ao salvar: não recarregue descartando texto; aguarde ou tente salvar novamente. Salvo no Notion é a confirmação de gravação.
- Catálogo sem busca: confira credenciais IGDB/TMDB e novo deploy. Se capa falhar, tente upload manual ou mantenha apenas o link, sabendo da limitação de backup.
- Ícone antigo no PWA: atualize; se necessário, reinstale o atalho após salvar dados pendentes. Os dados gravados permanecem no Notion.
- Primeiro backup real: confira registros, relações e anexos nas cópias. A validação automatizada usa serviços simulados e não substitui a verificação no seu workspace.

## 9. Desenvolvimento local

Node.js compatível com Next.js 15. Instale com **npm ci**. Configure variáveis localmente sem publicar segredos. Use **npm run dev**, **npm test** e **npm run build**. Para login local, configure origem/callback OAuth correspondentes. Não há deploy automático executado por esta entrega: a publicação é feita pelo seu GitHub/Vercel.

Se uma versão anterior acrescentou Responsável ao banco Projetos, essa coluna pode permanecer: o app não a usa mais. Não é necessário apagá-la para atualizar.
