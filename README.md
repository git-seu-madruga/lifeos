# LifeOS

Aplicativo pessoal para duas contas, com organização, registros e materiais de consulta. Usa Next.js/React, Notion para persistência, Upstash Redis para coordenação e sessões temporárias, Google para login e Vercel para hospedagem. Pode ser instalado como PWA; o LifeOS Captura é um aplicativo Android complementar para enviar entradas ao Inbox.

Este guia descreve o código do pacote atual. Preparar arquivos não publica uma versão: mudanças só entram no aplicativo após commit e deploy autorizados. Valores da instalação, credenciais e registros pessoais não fazem parte da documentação pública.

## Configuração

### Instalação e atualização

1. Instale as dependências com `npm ci`. Preserve `package-lock.json` e as versões do editor Tiptap.
2. Configure as variáveis do servidor usando `.env.example` como lista de referência. Para desenvolvimento, use um arquivo local de ambiente; na Vercel, use as configurações do projeto. Não publique os valores reais.
3. Crie os bancos necessários no Notion, autorize a integração e configure os IDs correspondentes. Use o ID do banco, não o da visualização após `?v=`. Bancos opcionais sem configuração não devem ser tratados como coleções vazias graváveis.
4. Configure o login Google e o Redis conforme abaixo. Execute `npm run verify` antes da publicação.
5. Após o deploy confirmado, recarregue a página ou feche e reabra o PWA. O botão **Atualizar** relê dados; ele não garante a troca do código de uma página já aberta.

Ao atualizar uma instalação existente, aguarde **Salvo no Notion**, preserve bancos e variáveis e publique o conjunto completo de arquivos. Se o código vier em um ZIP com a pasta `lifeos/`, o conteúdo dela vai na raiz do repositório. Arquivos de importação pessoais devem permanecer fora do repositório. Não publique `node_modules`, `.next`, ambientes locais, chaves ou arquivos de assinatura.

Não altere IDs, proprietário legado, segredo de sessão ou roteamento de uma instalação existente apenas para seguir um exemplo. Os bancos de Projetos, Marcos e Tarefas exigem IDs explícitos no ambiente do servidor; não há IDs de instalação como fallback no código. Os exemplos deste guia não identificam nenhuma instalação real.

### Variáveis do servidor

| Variável | Finalidade |
| --- | --- |
| `NOTION_TOKEN` | Token da integração autorizada aos bancos e à página de backup |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Cliente OAuth Web do Google |
| `LIFEOS_APP_URL` | Origem HTTPS da instalação; sem caminho adicional |
| `LIFEOS_SESSION_SECRET` | Segredo aleatório com pelo menos 32 caracteres; prefira 64 |
| `LIFEOS_ALLOWED_GOOGLE_EMAILS` | Exatamente duas contas autorizadas, separadas por vírgula |
| `LIFEOS_LEGACY_OWNER_EMAIL` | Uma das contas autorizadas, responsável por registros privados antigos sem proprietário e pelo backup |
| `LIFEOS_ACCOUNT_NAMES` | Opcional: objeto JSON de nomes por email ou lista de nomes na ordem das contas autorizadas; mantido somente no servidor |
| `LIFEOS_CYCLE_OWNER_EMAIL` | Opcional: conta autorizada titular do ciclo; por padrão, a conta diferente da principal |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Redis dedicado, com acesso de escrita |
| `NOTION_BACKUP_PAGE_ID` | Página comum, vazia e autorizada, para armazenar cópias; não é um banco |
| `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET` | Credenciais Twitch/IGDB para a busca de jogos |
| `TMDB_READ_ACCESS_TOKEN` | API Read Access Token do TMDB, sem o prefixo Bearer |

Os IDs dos bancos estão na tabela de propriedades. Se um banco tiver várias fontes de dados, configure também seu `NOTION_…_DATA_SOURCE_ID`, com o mesmo prefixo de `DATABASE_ID`. Áreas com dois bancos exigem ambos: Finanças, Hábitos e Entretenimento.

Segredos ficam exclusivamente no servidor, sem prefixo `NEXT_PUBLIC_`. Alterações nas variáveis da Vercel exigem novo deploy. Não troque o segredo de sessão com rascunhos pendentes: a proteção dos rascunhos também depende dele.

### Google e Redis

No Google, crie um cliente OAuth do tipo **Aplicativo da Web**, com os escopos `openid`, `email` e `profile`. Em modo de teste, autorize as duas contas configuradas. A origem deve corresponder a `LIFEOS_APP_URL`; o callback é essa mesma origem seguida de `/api/auth/google/callback`. Ambientes de preview precisam de configuração compatível com o domínio usado.

O Redis coordena gravações, sessões QR, pareamento do Captura, manutenção e backups. Também guarda o mapeamento dos bancos ativos após restauração. Não o limpe após restaurar: esse mapeamento tem prioridade sobre os IDs originais. Falhas de coordenação bloqueiam escritas em vez de liberar gravações concorrentes sem controle.

### Bancos e propriedades do Notion

Os nomes e tipos abaixo correspondem ao schema do código. **Texto** significa `rich_text`; **Arquivos** significa Arquivos e mídia. Campos marcados como automáticos são criados pelo aplicativo quando ausentes. Tipos incompatíveis devem ser corrigidos, não duplicados com outro nome.

| Banco | Variável do banco | Propriedades |
| --- | --- | --- |
| Projetos | `NOTION_PROJECTS_DATABASE_ID` | **Compartilhado** (Caixa de seleção; automático); **Nome** (Título); **Status** (Selecionar ou Status); **Contexto** (Selecionar); **Área** (Selecionar); **Prazo final** (Data); **Descrição** (Texto); **Documento** (Texto; automático); **Anexos** (Arquivos) |
| Marcos | `NOTION_MILESTONES_DATABASE_ID` | **Compartilhado** (Caixa de seleção; automático); **Nome** (Título); **Projeto** (Relação); **Prazo** (Data); **Concluído** (Caixa de seleção); **Ordem** (Número) |
| Tarefas | `NOTION_TASKS_DATABASE_ID` | **Recorrência** (Texto; automático); **Edição bloqueada** (Caixa de seleção; automático); **Compartilhado** (Caixa de seleção; automático); **Responsável** (Texto; automático); **Nome** (Título); **Status** (Selecionar ou Status); **Prioridade** (Selecionar); **Contexto** (Selecionar); **Projeto** (Relação); **Marco** (Relação); **Início** (Data); **Prazo** (Data); **Aguardando** (Texto); **Cobrar em** (Data); **Anotações** (Texto); **Documento** (Texto; automático); **Concluída em** (Data); **Anexos** (Arquivos) |
| Inbox | `NOTION_INBOX_DATABASE_ID` | **Nome** (Título); **Conteúdo** (Texto); **Anexos** (Arquivos; automático) |
| Diário | `NOTION_DIARY_DATABASE_ID` | **Nome** (Título); **Data** (Data); **Conteúdo** (Texto); **Documento** (Texto; automático); **Anexos** (Arquivos) |
| Categorias financeiras | `NOTION_FINANCE_CATEGORIES_DATABASE_ID` | **Inativa** (Caixa de seleção; automático); **Nome** (Título); **Tipo** (Selecionar) |
| Lançamentos financeiros | `NOTION_FINANCE_TRANSACTIONS_DATABASE_ID` | **Nome** (Título); **Categoria** (Relação); **Data** (Data); **Valor** (Número); **Observação** (Texto; automático) |
| Aniversários | `NOTION_CONTACTS_DATABASE_ID` | **Nome** (Título); **Dia** (Número); **Mês** (Número); **Ano de nascimento** (Número); **Observações** (Texto; automático); **Ícone** (Texto; automático); **Foto** (Arquivos e mídia; automático) |
| Compras | `NOTION_SHOPPING_DATABASE_ID` | **Nome** (Título); **Contexto** (Selecionar); **Itens** (Texto) |
| Hábitos | `NOTION_HABITS_DATABASE_ID` | **Encerrado** (Caixa de seleção; automático); **Nome** (Título); **Contexto** (Selecionar); **Cor** (Texto); **Ícone** (Texto); **Início** (Data) |
| Registros de hábitos | `NOTION_HABIT_LOGS_DATABASE_ID` | **Nome** (Título); **Hábito** (Relação); **Data** (Data) |
| Seções de entretenimento | `NOTION_MEDIA_SECTIONS_DATABASE_ID` | **Nome** (Título); **Tipo** (Texto); **Ícone** (Texto); **Cor** (Texto) |
| Conteúdos de entretenimento | `NOTION_MEDIA_DATABASE_ID` | **Concluído em** (Data; automático); **Plataformas** (Texto; automático); **Ano** (Número; automático); **Nome** (Título); **Seção** (Relação); **Autor** (Texto); **Status** (Selecionar); **Avaliação** (Número); **Comentário** (Texto); **URL da capa** (Texto); **Link de origem** (Texto); **Fonte** (Texto); **Capa** (Arquivos) |
| Recados | `NOTION_RECADOS_DATABASE_ID` | **Nome** (Título); **Data** (Data); **Remetente** (Texto); **Destinatário** (Texto); **Mensagem** (Texto); **Documento** (Texto; automático); **Imagem** (Arquivos); **Enviado em** (Data); **Lido** (Caixa de seleção); **Lido em** (Data) |
| Bem-estar | `NOTION_WELLNESS_DATABASE_ID` | **Nome** (Título); **Data** (Data); **Tipo** (Texto); **Dados** (Texto) |
| Ciclo | `NOTION_CYCLE_DATABASE_ID` | **Nome** (Título); **Data** (Data); **Tipo** (Texto); **Dados** (Texto) |
| Veículos | `NOTION_VEHICLES_DATABASE_ID` | **Nome** (Título); **Data** (Data); **Tipo** (Texto); **Dados** (Texto) |
| Acompanhamento | `NOTION_NUTRITION_DATABASE_ID` | **Nome** (Título); **Data** (Data); **Tipo** (Texto); **Dados** (Texto) |
| Algum dia | `NOTION_SOMEDAY_DATABASE_ID` | **Nome** (Título); **Tipo** (Texto); **Contexto** (Selecionar); **Dados** (Texto); **Anexos** (Arquivos) |
| Referência Geral | `NOTION_REFERENCE_DATABASE_ID` | **Nome** (Título); **Tipo** (Texto); **Dados** (Texto); **Anexos** (Arquivos) |

Relações: Marcos → Projetos; Tarefas → Projetos/Marcos; Lançamentos financeiros → Categorias financeiras; Registros de hábitos → Hábitos; Conteúdos de entretenimento → Seções. Em tarefas, Projeto e Marco admitem uma página por campo; o marco precisa pertencer ao projeto escolhido.

Opções usadas pelo aplicativo:

| Campo | Opções no Notion |
| --- | --- |
| Status de projeto | Ativo, Pausado, Concluído, Cancelado |
| Status de tarefa | Não iniciada, Em andamento, On hold, Concluída |
| Prioridade | Alta, Média, Baixa |
| Contexto | Pessoal, Trabalho |
| Tipo de categoria financeira | Entrada, Saída |
| Tipo de seção de entretenimento | `book`, `film`, `game`, `series` ou `custom`; Texto gerenciado pelo app |
| Status de entretenimento | Quero começar, Em andamento, Concluído |

A interface chama o grupo de tarefas de **On hold / Follow-up**, mas o valor persistido continua **On hold**. Os campos de Tipo/Dados das coleções estruturadas são Texto, não Selecionar. Deixe o app administrar seu JSON.

O app gerencia propriedades técnicas de identidade, proprietário, autoria e restauração, como **LifeOS ID**, **LifeOS Usuário**, **LifeOS Último editor**, **LifeOS Editado em** e **LifeOS Criado originalmente**. Não preencha ou altere esses campos manualmente. `Documento` preserva o JSON do editor; os campos de texto mantêm sua projeção legível. Edite documentos ricos pelo app para preservar imagens e formatação.

## Contas, acesso e sessões

| Dados | Acesso |
| --- | --- |
| Inbox, Diário, Hábitos, Bem-estar pessoal, Entretenimento, Acompanhamento, Algum dia e Referência Geral | Privados por conta |
| Projetos, Marcos e Tarefas | Privados por padrão; compartilhamento opcional |
| Compras, Aniversários, Finanças e Veículos | Compartilhados pelas duas contas |
| Ciclo | Vinculado a uma identidade fixa; a versão atual permite acesso e edição por ambas as contas |
| Recados | Remetente e destinatário protegidos; somente quem recebe confirma leitura |
| Backup e restauração | Apenas a conta principal; incluem os dados das duas contas |

Pessoal/Trabalho é classificação, não controle de acesso. Projetos, Tarefas, Compras e ideias de Algum dia admitem esses contextos. As demais áreas usam Pessoal fixo. A proteção do app não substitui as permissões concedidas diretamente no Notion.

Projetos compartilhados tornam seus marcos e tarefas compartilhados. Cada tarefa compartilhada exige um responsável válido; o responsável não limita quem pode editar. Tornar um registro privado devolve o acesso ao proprietário original, com confirmação. Registros privados antigos sem proprietário pertencem à conta configurada como principal.

Identidades e nomes são obtidos da configuração privada em respostas autenticadas, com cache desabilitado; não ficam embutidos no JavaScript público. Os nomes opcionais preservam a apresentação dos responsáveis; sem eles, o app usa o nome da sessão ou a parte local do email. O login Google usa cookie HttpOnly e sessão de sete dias. No computador público, prefira **Entrar com QR Code**: aprove no celular autenticado, confira o código nas duas telas e autorize explicitamente. O QR é de uso único e dura dois minutos. A sessão temporária dura até uma hora, bloqueia após dez minutos sem interação e é desbloqueada pelo código original somente naquele navegador. Cinco erros encerram a sessão. Desbloquear ou usar **Bloquear sessão** não estende a validade absoluta. A conta Google pode consultar e revogar computadores autorizados.

Sessões QR não leem nem gravam rascunhos persistentes no dispositivo. Pendências ficam na memória enquanto a página continua aberta; fechar, recarregar ou expirar a sessão pode perdê-las. Sessões Google usam rascunhos cifrados. Aguarde a confirmação de salvamento antes de sair; o app não apaga arquivos que o usuário tenha baixado no computador.

## Funcionamento das áreas

### Navegação, abertura e sincronização

O Inbox carrega primeiro. Os demais dados são liberados gradualmente, seguindo a ordem local das abas e priorizando a aba selecionada depois da leitura em andamento. Dados relacionados são lidos como um grupo antes de permitir edição. O código das telas também é carregado sob demanda; a primeira abertura pode mostrar um breve indicador.

Abas já liberadas podem ser usadas enquanto outras carregam. A sincronização envia diferenças e dependências, preserva rascunhos e detecta conflitos. Não reenvia todos os registros ou arquivos em cada edição. Atualização manual e retorno ao foco podem reler dados; a implementação ainda não é uma sincronização geral por webhooks. Conflitos pedem revisão, sem descartar automaticamente a edição local.

Datas aparecem como DD/MM/AAAA, meses como MM/AAAA. Campos de dia/mês completam o ano ao concluir. O dia padrão segue Brasília quando o formulário está no modo automático; datas escolhidas manualmente e formulários em preenchimento são preservados. As abas podem ser reordenadas; no mobile, a ordenação usa seleção da origem e do destino.

### Inbox e conversões

O Inbox mantém texto simples, colagem de imagens e um clipe discreto para escolher arquivos. Limites: 4 MB por arquivo e 100 anexos por entrada. Não há editor rico no Inbox nem envio de arquivos por arrastar para o campo. Imagens têm miniatura, painel de ampliação, ajuste/100% e abertura em outra aba; outros arquivos pedem abertura em outra aba, sujeita ao formato e ao navegador.

| Destino | Regra de conversão |
| --- | --- |
| Tarefa ou projeto | Primeira linha como título, demais como anotações/descrição; somente anexos usam o nome do primeiro arquivo como título |
| Diário | Acrescenta texto e imagens ao corpo da entrada de hoje; confirma quando já há entrada; documentos ficam nos anexos manuais |
| Algum dia | Primeira linha como título, demais como conteúdo; exige escolha de uma área; imagens entram no corpo |
| Compras | Primeira linha como lista, demais como itens; lista de mesmo nome recebe os itens no início |
| Aniversários | Primeira linha como nome, segunda como data |
| Bem-estar (pressão) | Botão Transformar em medida de pressão: somente três inteiros separados por um único espaço, na ordem sistólica diastólica BPM (ex.: `130 68 55`). Cria diretamente uma nova medição de hoje em Brasília, sem formulário. Texto adicional, outros separadores, quebras de linha, anexos ou valores fora dos limites de validação mantêm a entrada intacta |
| Recados | Primeira linha como título, demais como mensagem de hoje; Inbox só é removido após envio confirmado |

Anexos acompanham conversões para Tarefas, Projetos, Diário e Algum dia. As demais integrações ficam desabilitadas quando há arquivos. Não há conversão direta para Referência Geral. Em tarefas/projetos, arquivos convertidos continuam como anexos; não são automaticamente transformados em imagens inline.

O destino é salvo antes de arquivar o Inbox. Suas referências de arquivo passam a apontar para a página do destino, sem depender da entrada excluída. Retentativas usam identificadores estáveis para evitar duplicações. Nomes iguais não identificam tarefas/projetos como o mesmo registro; Compras tem sua regra específica de mesclar por nome. Exclusão usa a lixeira do Notion e não representa uma garantia de apagamento físico imediato dos bytes.

### Projetos, tarefas e follow-up

Na aba Tarefas, o seletor de atribuição oferece somente projetos ativos. Pausados, concluídos e cancelados não são novas opções; um vínculo existente com esses projetos permanece visível como referência desabilitada, sem alteração automática do histórico. A inclusão de tarefas diretamente dentro de um projeto permanece disponível nos quatro status.

Novas entradas focam o título; um rascunho intocado é descartado ao fechar. Projetos têm marcos, prazo final, status e anexos. O prazo de um marco não pode ultrapassar o do projeto; marcos são referências de cronograma, sem atraso próprio. Concluir ou cancelar um projeto com pendências exige confirmação e conclui tarefas/marcos abertos, incluindo follow-ups. Excluir o projeto exclui seus filhos. Reabrir não reabre automaticamente tarefas ou acompanhamentos. Tarefas de projetos pausados ficam visíveis somente dentro do projeto até sua retomada.

**Descrição** do projeto e **Anotações** da tarefa usam editor rico: títulos, negrito/itálico, listas, links HTTPS com prévia, imagens coladas/enviadas e o catálogo completo de emojis. Textos antigos são apresentados como parágrafos literais, sem migração em massa. Documentos aceitam até 30.000 caracteres e 80.000 de JSON, sujeitos aos limites de anexos. Imagens do corpo usam Anexos como suporte; arquivos manuais permanecem na lista própria. Remover uma imagem do texto remove somente seu arquivo de suporte.

O cadeado azul protege a tarefa contra edição acidental. Ambos os usuários autorizados de uma tarefa compartilhada podem bloquear/desbloquear, independentemente do responsável; a mudança vale para ambos. Bloqueio impede também anexos, exclusão, check de follow-up e operações de projeto que precisem alterar a tarefa. Datas e alertas continuam sendo calculados.

Ative **Acompanhamento programado** abaixo dos campos comuns para transformar a tarefa em follow-up. Ela permanece em **On hold / Follow-up**, inclusive quando ligada a um projeto. O prazo comum é informativo para o acompanhamento; não há encerramento automático, histórico próprio, comentários separados ou comandos de pausa/retomada.

A próxima consulta usa a mesma apresentação dos prazos das tarefas comuns: Hoje, Amanhã, nome do dia da semana de dois a sete dias à frente e DD/MM após sete dias. Datas vencidas mostram os dias de atraso.

| Programação | Próxima consulta após marcar como feita |
| --- | --- |
| Após cada consulta | Conta o intervalo a partir do dia efetivo da consulta |
| Calendário fixo | Mantém a sequência da âncora e avança até a próxima data futura; dias semanais selecionados são respeitados |

A próxima consulta pode ser alterada manualmente, redefinindo a âncora sem mudar o intervalo. Uma consulta antecipada não é registrada; atraso gera uma próxima data futura, sem acumular ciclos perdidos. O check fica azul até a próxima data e não gera novas datas por cliques repetidos. Na data seguinte de consulta, volta a ficar disponível. Desligar o toggle remove a recorrência e devolve a tarefa comum a On hold; a conclusão da tarefa continua sendo uma decisão manual. Observações ficam no próprio corpo da tarefa.

### Diário, Algum dia e Referência Geral

O Diário tem uma entrada por data e conta. Entradas existentes abrem bloqueadas; **Editar** libera o editor rico. A pesquisa geral substitui o calendário por cards com data e trecho contextualizado, conforme a digitação. Limpar a busca restaura o calendário. Imagens coladas e recebidas do Inbox ficam no corpo; anexos manuais têm sua lista própria.

Algum dia abre gavetas das áreas existentes. **Mostrar todos** fica ao lado de **Gerenciar áreas**; a pesquisa procura ideias de qualquer área/contexto. A área é obrigatória para salvar. A ideia aberta não repete a ilustração da categoria; no card externo, a primeira imagem do conteúdo pode ser miniatura. O catálogo de áreas também atende Projetos, preservando vínculos ao renomear ou ocultar. Transformar uma ideia em tarefa/projeto cria uma cópia de texto e anexos e preserva o original; não promete preservar o documento rico nessa conversão.

Referência Geral é uma biblioteca privada de materiais de consulta, com categorias independentes, pesquisa, favoritos, editor rico e anexos. Não é uma lista de tarefas, projetos ou ideias futuras.

Referência Geral e Algum dia usam a mesma largura disponível e espaçamentos de gavetas/cards. Em ambas, favoritos, Mostrar todos e gerenciamento ficam na barra da pesquisa, à direita no desktop e em uma única linha de botões abaixo da pesquisa nas telas menores. Os catálogos e as funções de cada aba permanecem independentes.

### Bem-estar, hábitos e alimentação

A escala esquerda da pressão usa apenas as sistólicas e diastólicas exibidas: limite inferior no múltiplo de 5 imediatamente abaixo do menor valor e superior no imediatamente acima do maior. Valores já múltiplos de 5 avançam ao próximo limite externo (70 a 130 → escala de 65 a 135). A regra vale no gráfico de 12 dias e no histórico, sem alterar a escala de BPM.

O rodapé do gráfico de pressão mostra as médias de sistólica, diastólica e BPM dos dias efetivamente exibidos no formato `Média: 129/68 mmHg, 57 bpm`, arredondado para inteiros como os valores do gráfico. O modo padrão considera os últimos 12 dias com medições; Histórico considera todo o período mostrado. Cada dia tem o mesmo peso, usando os valores das médias diárias plotadas. Ocultar BPM também oculta sua média.

Bem-estar reúne registros pessoais, medidas e hábitos; o ciclo usa a regra de acesso específica indicada anteriormente. Hábitos têm ilustração, cor, marcação de hoje e resumos mensal/anual. Correções de outros dias e exclusões pedem confirmação; encerrar um hábito preserva seu histórico.

Pressão admite várias medições diárias; peso/gordura, uma por data. O modo histórico usa médias diárias e amplia os dois gráficos para linhas completas; voltar ao padrão restaura o tamanho normal. Os toggles de BPM/% gordura funcionam nos dois modos. Somente o ponto fica dourado quando há comentário em alguma medida representada, inclusive na média diária. Ocultar uma série não impede registrar seus valores.

Acompanhamento registra refeições, água, sono e atividade de forma independente dos registros de Bem-estar. Busca local TACO, alimentos próprios, favoritos e receitas são privados; produtos Open Food Facts usam busca explícita online. Porções conhecidas começam em uma porção; sem porção, em 100 g/ml. Histórico guarda os dados nutricionais usados no lançamento; editar um alimento não reescreve o passado.

As receitas calculam energia por ingredientes e peso pronto; gramas e ml não são intercambiáveis. O indicador de qualidade considera alimentação, água e exercício conforme `lib/nutrition.js`, sem nota quando não há calorias. Café da manhã, Almoço, Lanche e Jantar aparecem mesmo vazios; Ceia/Outros aparecem com lançamentos. No celular em paisagem, os cartões ficam dois a dois.

### Tabela de lançamentos financeiros

A tabela abaixo dos cards acompanha o mês/ano/período selecionado. Mostra data do lançamento, tipo (Entrada/Saída), categoria, valor, inserido em, modificado em, inserido por e modificado por, com ações de editar/excluir e as confirmações existentes. Ordena por data do lançamento decrescente e, no mesmo dia, inclusão mais recente primeiro. No celular, a tabela permite rolagem horizontal. O Sankey tem uma régua de zoom de 50% a 200%, com ajuste contínuo de 1% e Redefinir para 100%. A escolha fica salva neste navegador, sem alterar dados ou sincronizar com o Notion. O SVG muda sua largura e altura no fluxo da página, de modo que os cards e a tabela abaixo acompanham o redimensionamento; ampliações podem usar rolagem horizontal.

O servidor registra autoria a partir da sessão autenticada. `LifeOS Inserido por` (Texto) e `LifeOS Inserido em` (Data) são criados automaticamente somente em Lançamentos financeiros; o autor original não muda em edições. A primeira inclusão deixa Modificado em/por vazios. Uma edição real preenche `LifeOS Modificado em` (Data, automático) e usa o último editor autenticado; os campos genéricos de último salvamento continuam independentes. Metadados retornam após salvar sem sobrescrever edições em curso nem participar do diff editável. Reenvio idêntico não altera autoria/data de modificação. Registros antigos usam a data de criação original do Notion quando disponível e mostram “Não informado” para autoria desconhecida. A tabela mostra o estado atual e a última edição; exclusões seguem o fluxo existente, sem uma trilha permanente de versões.

### Veículos

Garagem, categorias e lançamentos são compartilhados. Abastecimentos e despesas têm fluxos separados. A quilometragem atual para alertas considera o maior valor válido do cadastro e dos lançamentos, inclusive abastecimentos e manutenções. O servidor impede odômetros incoerentes por data.

Abastecimentos admitem mistura de combustíveis em até vinte linhas, com uma data/km e uma condição de tanque para a parada. Cada linha aceita litros, valor total e preço por litro: preencha dois para calcular o terceiro em tempo real. Os dois últimos campos editados manualmente prevalecem; formatação ao sair do campo não muda essa prioridade. Litros e preço por litro têm até três casas; total é arredondado para centavos. O preço informado é auxiliar do formulário: registros existentes, tabelas e consumo continuam usando litros e total, com preço derivado dessa relação. Pequenas diferenças no preço por litro podem decorrer do arredondamento. Preço/litro é a média ponderada da parada. O primeiro tanque cheio estabelece referência; parciais se acumulam até o próximo cheio. Consumo geral é distância total por litros dos intervalos válidos. Marcar uma lacuna interrompe o intervalo incompleto sem apagar gastos ou histórico.

No painel de consumo, Última média fica verde quando supera a média do intervalo completo anterior em mais de 2%, vermelha quando cai mais de 2%, e conserva a cor normal dentro dessa margem. Sem duas médias válidas, conserva a cor normal. A comparação usa valores sem arredondamento; parciais não geram uma nova média.

A coluna de distância entre abastecimentos usa a diferença de odômetro entre registros consecutivos, inclusive parciais; não é a distância do intervalo entre tanques cheios. Primeiro registro ou valor desconhecido aparece como ausente, sem inventar zero. Os gráficos e resumos são derivados de todo o histórico, independentemente da ordenação/limite visual da tabela.

Manutenção pode vencer por data, km ou ambos. Duração em km somada à km do serviço gera a meta de manutenção. Avisos próximos consideram 30 dias ou a margem de km configurada (500 km por padrão), além dos vencidos; o ícone da aba fica dourado quando há manutenção próxima/vencida em algum veículo. Serviços concluídos não avisam. A conclusão é manual.

Importação CSV fica no painel de Veículos: baixe o modelo do tipo desejado, selecione o veículo e revise a prévia. Abastecimentos aceitam até 1 MB/1.000 registros por arquivo. Preserve `id_origem`; lotes de até cinco usam a sincronização normal e podem ser retomados sem duplicar. Mesma data/km pede conferência; combustível ausente não deve ser presumido. Não publique históricos, placas, locais, custos ou regras de conversão de uma planilha pessoal no repositório.

### Outras áreas

| Área | Comportamento |
| --- | --- |
| Compras | Blocos de listas e itens reordenáveis; check remove item, sem histórico de concluídos. Busca também no conteúdo dos itens restantes, sem diferenciar acentos/caixa |
| Finanças | Entradas/saídas, categorias, observações, períodos e Sankey; categorias podem ser aposentadas sem apagar lançamentos; tabela no fim da página com data, tipo, categoria, valor, inclusão/última modificação e autoria, com editar/excluir |
| Aniversários | Datas com ano opcional, idade quando conhecida, foto do dispositivo ou emoji circular ao lado do nome; observações somente no painel lateral, com aviso ao fechar com alterações não salvas. Clicar na foto/emoji abre uma ampliação; clicar no nome abre o cadastro. Fotos usam anexos do Notion (envio de até 4 MB após otimização). Destaque dourado da aba para hoje e os seis dias seguintes |
| Entretenimento | Leituras, jogos, séries e filmes; filtros, avaliação, capas, comentários e resumos. Concluir exige data; consultas externas dependem dos respectivos catálogos |
| Recados | Um envio por remetente/dia em Brasília, título opcional e confirmação antes de enviar; após envio é somente leitura. Editor rico, imagens no corpo e catálogo completo de emojis; até 12.000 caracteres. Apenas o destinatário confirma leitura. O coração avisa sobre recebido de hoje não lido |

## Arquivos, ilustrações e fontes

Uploads comuns têm limite de 4 MB por arquivo e 100 anexos por entrada. No editor rico, JPEG/PNG/WebP são reduzidos localmente para até 1.600 px; originais para processamento podem ter até 20 MB. GIF mantém animação e precisa ter até 4 MB. O documento guarda nomes estáveis dos anexos, não URLs temporárias. URLs assinadas são renovadas pelo fluxo autenticado. Abrir uma aba não exige baixar todos os arquivos originais de todas as áreas; imagens visíveis e miniaturas podem gerar requisições.

O catálogo compartilhado tem 359 Fluent Emoji 3D e 17 ilustrações próprias de impressão 3D, incluindo oito cores de filamento. Busca e temas são locais; alimentação filtra o subconjunto de alimentos. Os SVGs Flat de veículos permanecem separados. Não há geração de imagens em tempo de execução nem carregamento adicional do catálogo somente ao abrir o seletor além do comportamento atual do código.

Licenças e procedência ficam nas pastas dos assets em `public/emoji/`; preserve-as. As ilustrações próprias são independentes da Microsoft. A fonte nutricional TACO está documentada em `lib/data/TACO-FONTE.md`; imagens e dados externos não devem ser confundidos com arquivos hospedados no Notion. Prévia de site e fotos externas não equivalem a uma cópia do site no backup.

Fontes: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji), [TACO](https://nepa.unicamp.br/publicacoes/tabela-taco-excel/), [Open Food Facts](https://world.openfoodfacts.org/), [Open Library](https://openlibrary.org/dev/docs/api/search), [TVmaze](https://www.tvmaze.com/api), [IGDB](https://api-docs.igdb.com/) e [TMDB](https://developer.themoviedb.org/docs/authentication-application). Dados do Open Food Facts usam ODbL e fotos dos colaboradores, CC BY-SA 3.0; preserve os créditos apresentados na interface.

### Emojis de animais de estimação

O catálogo compartilhado pelos seletores inclui 20 novas artes na categoria **Animais de estimação**: cães de diferentes raças (incluindo blue heeler filhote e com orelhas em pé), oito variações de calopsitas, gato rajado e coelho. As miniaturas são WebP locais com transparência; funcionam em Aniversários, Hábitos, áreas e demais campos que usam o pacote completo. Buscar pelo animal, raça ou cor localiza as variações. A origem e os prompts estão em `public/emoji/lifeos-pets/sources.json`; as fotografias de referência não são distribuídas.

## Backup e restauração

Configure uma página comum autorizada em `NOTION_BACKUP_PAGE_ID`. O painel é exclusivo da conta principal e inclui os bancos configurados das duas contas. Criar backup salva pendências, bloqueia escritas do app durante a manutenção, copia propriedades/relações/arquivos suportados e verifica a cópia. Só versões verificadas entram no catálogo, com retenção das três mais recentes.

Mantenha o painel visível; operações podem ser retomadas entre etapas. Após 15 minutos sem avanço, a manutenção expira: cancele e reinicie. Não edite diretamente no Notion durante a cópia. Não há backup diário automático.

Restaurar exige confirmação textual, cria uma cópia de segurança do estado atual e restaura para novos bancos. Só depois de verificar a cópia o app ativa o novo mapeamento no Redis. Os bancos anteriores não são sobrescritos. Não apague conjuntos originais/restaurados nem limpe o Redis sem conferir qual mapeamento está ativo. Atualize as instâncias abertas e revise eventuais rascunhos conflitantes.

Limites: arquivos hospedados no Notion até 20 MB; não inclui todo o workspace, visualizações, permissões ou comentários nativos. Relações externas, propriedades/blocos não suportados e paginação além dos limites interrompem a cópia, em vez de produzir um falso backup completo. Uma página com mais de 100 blocos diretos pode não ser suportada. Capas somente por URL externa precisam de cópia hospedada. A ativação exige conjunto de bancos compatível. Uma cópia no mesmo serviço não substitui uma cópia externa independente.

## LifeOS Captura para Android

O aplicativo complementar e o widget criam entradas no Inbox privado; não mostram seu conteúdo nem acessam as demais abas. A versão do projeto é 1.0.5, `versionCode` 6, Android 8.0+; a origem é fornecida por `LIFEOS_APP_URL` no ambiente de compilação ou pelo parâmetro Gradle `-PlifeosUrl`. Não há origem de instalação como padrão no código; ela é necessária para compilar e fica incluída no APK resultante, que precisa se comunicar com o servidor.

Faça o pareamento pelo menu do LifeOS em uma sessão Google, confira o código e autorize o aparelho. Credenciais do Captura duram até 90 dias e podem ser revogadas; não são sessões web. Sessões QR não autorizam novos aparelhos.

Texto e uma imagem podem ser colados no campo de captura. Links/texto e uma imagem também podem chegar pelo menu **Compartilhar** do Android. Revise e confirme: receber um compartilhamento não envia sozinho. O widget abre a janela compacta; continua sem seletor de arquivos genéricos. O suporte à colagem depende do teclado e do app de origem fornecerem a imagem, não apenas um endereço.

O envio usa fila local cifrada e WorkManager. Só uma confirmação do servidor retira a entrada da fila. Relógio indica pendência, check verde indica confirmação e o widget não revela o conteúdo. Respostas ambíguas não são reenviadas cegamente; confira o Inbox e use as opções de resgate/tentativa quando necessário. Rede, bateria e manutenção podem adiar o processamento sem apagar pendências.

A instalação web existente precisa ter `NOTION_PROJECTS_DATABASE_ID`, `NOTION_MILESTONES_DATABASE_ID` e `NOTION_TASKS_DATABASE_ID` configurados antes de publicar a remoção dos fallbacks. Essa mudança não altera bancos, proprietários ou registros.

Para atualizar o APK, preserve `applicationId`, chave de assinatura e use `versionCode` crescente. Não publique a chave, senha ou pacote privado de assinatura. O código está em `android-capture/`; use JDK 17, SDK 35 e as versões fixadas no projeto. Na compilação release, forneça `LIFEOS_KEYSTORE` e `LIFEOS_STORE_PASSWORD` somente no ambiente local e execute `./gradlew :app:assembleRelease` dentro dessa pasta. Alterar o domínio exige nova compilação Android; mudanças exclusivamente web não exigem novo APK por padrão.

## Desenvolvimento e diagnóstico

| Comando | Finalidade |
| --- | --- |
| `npm ci` | Instalar as dependências fixadas pelo lockfile |
| `npm run dev` | Desenvolvimento local |
| `npm test` | Suíte de domínio, interface simulada, sincronização e servidor com serviços simulados |
| `npm run build` | Build Next de produção |
| `npm run verify` | Testes, build e privacidade do bundle, nessa ordem; interrompe na primeira falha |
| `npm run test:android-queue` | Testes host da fila/worker Android; requer JDK 17 |
| `npm run test:android-share` | Testes host de compartilhamento Android; requer JDK 17 |

A Vercel usa `vercel.json` para instalar pelo lockfile com dependências de teste e executar `npm run verify` antes de publicar. No GitHub, `.github/workflows/verify.yml` executa a mesma verificação em pushes para main e pull requests, com token somente de leitura e sem segredos de produção. Os testes recebem ambiente separado, sem as variáveis privadas dos serviços; o build conserva a configuração normal. O scanner funciona mesmo quando o pacote de deploy não inclui `.git`. Essas verificações reduzem regressões; não equivalem a uma auditoria completa de segurança.

O Dependabot consulta npm e GitHub Actions semanalmente e propõe atualizações por pull request, agrupando o Tiptap. Nenhuma atualização é aplicada automaticamente. Alertas de vulnerabilidades, secret scanning e proteção de branch dependem das opções habilitadas no próprio repositório; os arquivos de CI não ativam essas configurações administrativas.

Rascunhos de Recados continuam cifrados nas sessões Google. Falha de leitura bloqueia edição/envio e gravação local até recuperar o rascunho; falha de salvamento mantém o texto aberto e oferece nova tentativa. As gravações são ordenadas, inclusive na limpeza após envio, e ao sair da aba a gravação pendente é iniciada. Fechar o navegador antes da conclusão ainda pode interromper a operação. Sessões QR continuam apenas em memória.

A arquitetura e as regras de manutenção ficam em `AGENTS.md`; os schemas efetivos, em `lib/server/notion.js`. Não use serviços de produção para gerar registros de teste. Testes simulados e build não comprovam funcionamento em um aparelho real.

| Situação | Conferência |
| --- | --- |
| Login indisponível | Variáveis obrigatórias, duas contas autorizadas, conta principal, origem e callback Google |
| Área não configurada | IDs dos bancos necessários, permissão da integração e fonte de dados correta |
| Erro de campo Notion | Nome e tipo exatos, inclusive campos automáticos já existentes com tipo incompatível |
| Conflito de edição | Preserve o rascunho, releia e revise; não descarte a proteção para forçar gravação |
| Anexo não abre em outro aparelho | Reabra o app atualizado, confira se salvou e se o arquivo aponta para o destino correto; não libere acesso a um Inbox excluído |
| Restaurou, mas vê bancos inesperados | Confira o roteamento ativo no Redis antes de trocar variáveis ou excluir bancos |

Antes de publicar, revise o diff: documentação e exemplos devem usar papéis genéricos e campos vazios, sem emails, domínio instalado, IDs reais de bancos, históricos pessoais ou credenciais. As autorizações de commit e deploy são explícitas por alteração. Limpar arquivos atuais não apaga versões anteriores do histórico Git.
