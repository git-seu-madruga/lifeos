# LifeOS — orientações de desenvolvimento

Estas orientações valem para a raiz e suas subpastas. Representam o comportamento atual; pedidos posteriores do usuário podem alterá-lo. Confira o código e o README antes de trabalhar em uma área. Não trate ideias antigas ou mockups como funcionalidades já implementadas.

## Projeto e documentação

- Aplicativo pessoal de duas contas, em português brasileiro, com Next.js 15, React 19 e rotas de servidor no App Router. Hospedagem na Vercel, dados no Notion e coordenação/sessões no Upstash Redis.
- Preserve as versões efetivas de package.json/package-lock.json. Não atualize dependências como parte de uma correção de interface.
- README.md é o guia único de instalação, variáveis, bancos, uso e importações. Atualize as seções afetadas e elimine orientações contraditórias. Não crie novos INSTRUCOES-*.md.
- AGENTS.md registra decisões técnicas e regras de manutenção. Atualize-o quando a arquitetura ou uma regra de produto mudar.
- Entregas são cumulativas: incluir as alterações anteriores aprovadas. Uma tela nova não autoriza redesenhar ou alterar regras de outras áreas.

## Organização do código

- app/page.js compõe abas, contexto, Inbox, sessão e indicadores de sincronização.
- components/ contém as telas e os componentes compartilhados. Reutilize os componentes de data, mês, calendário, modal, texto, links e anexos.
- lib/useNotionState.js controla estado local, rascunhos, fila de salvamento, hidratação de IDs e atualização ao retornar ao foco.
- lib/notionDiff.js produz alterações incrementais. Mantenha os pais necessários para relações sem reenviar toda a coleção.
- lib/server/notion.js resolve schemas e lê/escreve os campos Notion; lib/server/sync.js valida alterações, conflitos e vínculos antes de gravar.
- lib/server/access.js aplica acesso privado/compartilhado. auth.js, google.js e qrAuth.js cuidam da autenticação; coordination.js e routing.js cuidam de concorrência e roteamento de bancos.
- lib/server/backup.js implementa cópia e restauração. Recados, busca de mídias e cópia de capas usam os módulos e rotas específicos existentes.
- lib/vehicles.js contém as regras dos veículos; vehicleImport.js interpreta os CSVs e prepara a prévia; vehicleImportRunner.js grava lotes pelo fluxo normal de sincronização. vehicleCharts.js prepara séries locais de consumo, custos e totais diários/anuais.
- tests/*.cjs usa assert, compilação SWC e servidores/armazenamentos simulados. Não substitua testes existentes por verificações de texto que não exercitem o comportamento.

## Dados, identidade e sincronização

- Notion é a persistência remota. Diferencie ID local, _notionId e identificadores estáveis usados dentro de JSON. Não use uma referência de página onde se espera um UID lógico.
- Veículos usam registros type/data na mesma coleção. data.uid é estável; data.vehicle e data.category guardam vínculos lógicos. Backups/restaurações devem preservar esses vínculos.
- Valores monetários internos são centavos inteiros; litros têm até três casas decimais. Somar litros em mililitros evita erros acumulados de ponto flutuante. Formate em reais apenas na apresentação.
- null significa desconhecido, não zero. Serviços podem custar zero ou ter valor desconhecido; combustível exige litros e valor positivos. Não transforme dados ausentes em valores reais inventados.
- Datas de domínio são YYYY-MM-DD, sem conversões de fuso que mudem o dia. Apresentação DD/MM/AAAA; mês MM/AAAA. Use o dia atual de Brasília nos fluxos que dependem de HOJE.
- Salvamento é incremental e serializado, com proteção contra edições concorrentes, falhas parciais e reenvio. Preserve rascunhos pendentes e hidratação dos IDs.
- Retornar ao foco pode consultar alterações de outra instância, com agrupamento de eventos e proteção contra sobrescrever formulários/rascunhos. Não introduza varredura periódica de dados enquanto o app está oculto.
- Novas coleções exigem integração completa: estado, diff, schema, acesso, validação, dependências, rascunho, backup, documentação e testes. Uma mudança visual ou campo dentro de Dados não exige novo banco por padrão.
- Não execute migrações, importações, limpezas ou gravações nos serviços reais como verificação de código. Use os ambientes simulados; executar algo em produção deve fazer parte do pedido do usuário.

## Contas e segurança

- Somente as duas contas Google autorizadas na configuração do servidor podem entrar. Dados antigos privados sem proprietário pertencem à conta principal.
- Privados por conta: Acompanhamento (nutrition), Inbox, Diário, Hábitos e registros, Bem-estar pessoal/medições e Entretenimento.
- Projetos, Marcos e Tarefas são privados por padrão e podem ser compartilhados. Projeto compartilhado obriga suas tarefas a serem compartilhadas, mas não possui responsável fixo. Cada tarefa compartilhada exige responsável válido; a criação rápida no projeto deve exigir essa escolha.
- Compras, Aniversários, Finanças e Veículos são compartilhados. Preserve a identificação de quem e quando fez a última alteração pelo app.
- Ciclo da Letícia é sempre dela; nesta versão de teste ambos veem e editam. Não converta esses registros em cópias privadas de cada conta.
- Recados têm remetente/destinatário protegidos no servidor; somente o destinatário confirma leitura. Backup/restauração é exclusivo da conta principal.
- Contexto Pessoal/Trabalho não é uma fronteira de segurança. Valide acesso no servidor, nunca apenas escondendo controles.
- Sessão QR dura no máximo uma hora; dez minutos sem interação bloqueiam a sessão. O código só desbloqueia o navegador previamente autorizado, sem estender a validade. Preserve revogação, proteção contra tentativas e confirmação no celular com sessão Google.
- Sessões temporárias não persistem dados privados/rascunhos em IndexedDB. Não exponha tokens, cookies, segredos ou valores reais de ambiente em arquivos, logs ou ZIPs.
- Preserve proteção de origem, checagem de identidade, locks e validação em rotas de escrita. Não confie apenas na validação do formulário.

## Interface e navegação

- Preserve a identidade escura e a paleta/ícones atuais. Reutilize estilos antes de criar outro padrão. Mantenha contraste, rótulos acessíveis e foco de teclado.
- No desktop, Inbox permanece à esquerda, separado pela linha vertical; o conteúdo aproveita o restante da largura. Abas mobile rolam horizontalmente sem barra aparente.
- Abas principais inativas mostram só ícone; a selecionada revela o nome com transição breve. Ordenar abas no mobile revela todos os nomes: primeiro toque seleciona a origem, segundo insere imediatamente antes do destino e limpa a seleção; tocar na mesma desmarca. Arrastar apenas rola nativamente, sem captura de ponteiro ou touch-action:none, inclusive ordenando. Concluir limpa seleção e recolhe inativas. Desktop mantém drag e Alt+seta com moveTab; mobile usa moveTabBefore para inserir antes em ambas as direções. Preserve rótulos acessíveis, tooltip, aviso COMPARTILHADO com o nome, foco de teclado e prefers-reduced-motion.
- Contextos ficam centralizados no espaço entre a marca e o botão de atualizar; tamanho não muda quando opções estão bloqueadas.
- Pessoal fixo: Diário, Finanças, Aniversários, Bem-estar/Hábitos, Entretenimento, Recados, Veículos e Acompanhamento. Projetos, Tarefas e Compras mantêm Pessoal/Trabalho conforme a interface existente.
- Navegações com calendário usam ordem DOM/teclado seta esquerda → campo digitável → seta direita → calendário → Hoje. DateInput aceita afterInput para colocar a seta direita antes do calendário embutido; formulários sem navegação continuam com campo e calendário.
- Use DateInput, MonthInput e MonthPicker. Datas aceitam dia/mês e completam o ano ao concluir; a máscara insere barras. Preserve calendário como alternativa. Mês digitado sozinho completa o ano no componente existente.
- Use ModalLayer e o sistema de retorno existentes: animação breve, retorno fecha a camada superior, proteção de saída nas abas principais. Selecionar texto e soltar fora do painel não pode fechá-lo.
- Novos projetos/tarefas focam título vazio com placeholder; entradas intocadas são descartadas ao fechar. Não recrie placeholders como registros persistidos.
- Inbox mobile aceita múltiplas linhas; desktop mantém seus atalhos. Preserve conversões e confirme quando o fluxo existente exige.
- PWA usa standalone: não volte para fullscreen, que causou flickering no Android. Não altere autenticação, histórico ou rolagem para contornar novamente esse problema já identificado.
- Links seguem os componentes seguros existentes. Preserve a abertura externa e os caminhos internos/autenticados de anexos.

## Regras das áreas existentes

- Marcar projeto como done ou cancelled com pendências exige confirmação e conclui tarefas e marcos vinculados, incluindo itens remotos recentes. Preserve completedAt dos já concluídos; grave o status final do projeto existente após os filhos. Cancelled mantém o projeto cancelado e os filhos concluídos, sem exclusão. Reabrir não reabre filhos. readSnapshot parcial deve consultar filhos por relação em ambas as transições, inclusive done → cancelled ou cancelled → done.
- Retentativa de conclusão de projeto reconcilia também tarefas que já chegam done da UI, preservando completedAt confirmado remotamente quando a base ainda não estava concluída. sameCompletionTime aceita apenas igualdade ou truncamento exato de segundos/milissegundos do valor candidato, nunca qualquer horário dentro do mesmo minuto. Conflitos reais continuam protegidos. synchronize devolve taskCompletions somente dos registros envolvidos; hydrate adota status/data confirmados apenas se esses campos não foram editados desde o snapshot enviado, preservando reabertura e texto durante o envio. Não resolver essa falha descartando rascunhos ou desativando proteção de concorrência.
- Projeto excluído também exclui tarefas e marcos associados. Concluído/cancelado preserva histórico; prazo de marco é referência, sem atraso próprio, e não ultrapassa o prazo global definido.
- Tarefa não usa status Cancelada; mantenha exclusão e anexos. Compartilhamento removido pede confirmação com indicação do destino privado.
- Tarefas em aberto desempatem por inclusão crescente após status/data (e após o critério explicitamente selecionado em Tarefas); novas ficam abaixo, tanto no quadro quanto dentro do projeto/marco. Concluídas mantêm newestCompleted decrescente. _createdAt é metadado, fora de TASK_FIELDS/diff: registrar localmente nas três criações (Tarefas, Projeto e Inbox) e recuperar no decode pelo timestamp dos IDs LifeOS existentes; usar LifeOS Criado originalmente/created_time como fallback externo. Não criar novo campo Notion nem escrever em massa só para ordenar. Não alterar a ordenação de Compras.
- Diário tem uma entrada por data, leitura bloqueada ao retornar, desbloqueio explícito e ausência de marcador quando texto/anexos não constituem entrada. Conversão do Inbox usa hoje e confirma reabertura quando necessário.
- Hábitos ficam dentro de Bem-estar. Ícones principais marcam somente hoje; correções passam pelo resumo mensal. Alterações fora de hoje e exclusões pedem confirmação. Encerrar/recuperar preserva histórico e pede confirmação; resumo anual é leitura e abre o mês.
- Pressão admite múltiplas medidas/dia e média diária; peso/gordura tem apenas uma entrada/dia. Ocultar uma série/escala do gráfico não impede registrar seu valor. Toggle da escala direita ocupa a mesma linha do resumo numérico de pressão/peso, sem linha exclusiva; MeasurementChart recebe summary/summaryNote para manter o controle junto aos valores.
- Compras não guarda histórico de itens concluídos. Preserve ordenação manual de itens/listas e integração do Inbox. Busca usa nome da lista OU texto de qualquer item restante, sem diferenciar acentos/caixa, mantendo contexto e ordem manual.
- Finanças mantém entradas/saídas, categorias compartilhadas e aposentadoria de categorias sem apagar lançamentos. Edições fora do mês atual usam as confirmações existentes; Sankey não permite arrastar barras.
- Entretenimento mantém quatro seções: leituras, jogos, séries e filmes. Cada seção tem página, filtros/status, avaliação, capas, visualização compacta/completa e resumo mensal/anual. Conclusão exige data; preserve ordem dos concluídos e ordem de criação dos demais. Preserve atribuições exigidas pelos provedores, inclusive TMDB na área de filmes.
- Recados: um envio por remetente/dia, confirmação antes de enviar, título/texto/imagem e calendário. O coração de aviso substitui somente o ícone da marca, preserva LifeOS escrito e abre Recados apenas enquanto houver recado recebido de hoje não lido.

## Acompanhamento: comportamento atual

- Coleção privada nutrition, um banco NOTION_NUTRITION_DATABASE_ID com Nome/Data/Tipo/Dados. Tipos settings, day, entry e food. JSON usa data.uid estável; base nutricional/receita é copiada no lançamento. Editar ou retirar alimento não reescreve histórico.
- Resumo alimentar mostra Café da manhã, Almoço, Lanche e Jantar por padrão; Ceia/Outros aparecem com lançamentos, na ordem de MEALS. Desktop usa uma única linha de cartões adaptáveis; mobile em retrato mantém uma coluna e em paisagem (pointer:coarse, até 1400px) usa duas colunas com fluxo por linhas.
- Água, litros, sono, aeróbico e musculação independentes de Bem-estar e Hábitos. Sono/litros não mudam pesos. Qualidade = (água 10% + aeróbico OU musculação 20% + total dentro da meta 70%) × (kcal dentro / kcal totais). Sem calorias, sem nota; acima de 70% é boa adesão. Médias incluem apenas dias com calorias.
- Ao adicionar/salvar um lançamento alimentar ou limpar a busca, os detalhes e a edição da seleção são fechados e o painel volta ao estado inicial. Limpar não altera lançamentos já salvos.
- Busca geral de alimentos e ingredientes começa vazia e recolhe ao limpar. Favoritos/Minhas receitas mostram todos os itens ativos ao abrir, com filtro ao digitar e ordem alfabética; trocar guia limpa a busca anterior. Não consultar OFF para listar itens salvos; OFF mantém busca explícita. Backup de manutenção em Importacao/TACO inclui JSON idêntico ao catálogo e CSV com a mesma lista.
- Busca local integra TACO e todos os alimentos pessoais ativos, inclusive favoritos e produtos OFF salvos, sem duplicar IDs. Meus alimentos é um toggle que filtra os itens salvos; desligar volta à busca integrada. Não há seletor Base brasileira. Resultados identificam TACO/Próprio e preservam origem OFF. Produtos / marcas mantém consulta online explícita separada.
- TACO oficial local em lib/data/taco.json, energia por 100 g; preserve proveniência, valores e preparação. Não invente energia para ausentes. OFF busca explícita com cache/limite e foto validada do domínio images.openfoodfacts.org, sempre com fallback local e créditos. Não introduza serviços pagos ou chave extra.
- Receitas calculam kcal por ingredientes e peso pronto; gramas e ml não são intercambiáveis. Porções exigem quantidade base conhecida. Nova seleção de alimento com porção inicia em 1 porção; sem porção, 100 g/ml. Preserve a porção pessoal em novas buscas do mesmo produto e não substitua a quantidade ao editar lançamento antigo. Validação server acompanha cálculo, unicidade por dono/dia e UID, privacidade e detecção de conflitos. Catálogo local não vai para Notion.
- Novos campos/coleções precisam preservar integração de diff, rascunhos, hidratação, backup e retorno ao foco. Fotos de produtos permanecem links externos nesta primeira versão; não alegar cópia de imagens no backup.

## Veículos: comportamento atual

- Aba compartilhada, Pessoal fixo, categorias globais para carro e moto. Ícones são Microsoft Fluent Emoji locais com licença; mantenha opções e cores, sem imagens remotas ou ilustrações substitutas não solicitadas.
- Há exatamente dois cartões de informações antes das tabelas: resumo financeiro e consumo/combustível.
- Resumo financeiro usa um único MM/AAAA compacto e centralizado, setas, MonthPicker e Hoje. Mostra combustível no mês/ano e demais despesas no mês/ano. O ano acompanha o mês escolhido. Acumulado global fica discreto no rodapé: despesas + combustível = total; não destaque esses totais nem mostre avisos de registros fora das somas.
- Segundo cartão reúne última média, média geral, custo/km e último preço por litro. O último preço vem do abastecimento cronologicamente mais recente, com os desempates de orderedFuel, e é valor total ÷ litros totais. Em mistura, isso é média ponderada, igual à tabela, não média simples dos preços dos componentes.
- Valores dos cartões selecionam o gráfico local: consumo (padrão e retorno), custo/km dos últimos 12 intervalos completos, preço/litro dos últimos 12 abastecimentos, despesas/combustível diários no mês selecionado ou totais por ano de todo o histórico. Dias vazios aparecem como zero, fevereiro respeita anos bissextos, e gastos não incluem combustível. O gráfico anual não deve virar um gráfico dos meses do ano selecionado. Não introduzir consultas extras ao Notion para mudar gráficos. Usar seleção temporária, reiniciando em consumo ao trocar veículo/aba ou reabrir.
- Abastecimento não oferece seletor de categoria nem prazo de manutenção em km/data; mantém observações e categoria interna fuel. Despesas não oferecem Combustível e não se convertem em abastecimento pelo seletor. Títulos identificam o veículo: Novo abastecimento em <nome> / Nova despesa em <nome>; editar também preserva essa identificação.
- Novo abastecimento abre pelo ModalLayer no mesmo painel de Nova despesa; não reintroduza formulário expandido abaixo da tabela. Preserve combustíveis mistos, valores/litros, posto/favoritos, tanque cheio e interrupção de média.
- Abastecimentos ficam somente na tabela própria. A tabela de despesas exclui combustível, mostra km do evento e mantém filtros de categoria. Ambas começam com cinco linhas e expandem em Ver todos. O rodapé da tabela expandida soma todo o filtro escolhido.
- Valor, preço/litro e consumo dos abastecimentos, e valor das despesas, alternam crescente → decrescente → padrão. Valores ausentes ficam no fim. Ordenação visual não altera o cálculo cronológico; não persistir entre abas/reaberturas.
- Km de lançamento posterior deve ser maior ou igual aos anteriores. Histórico inserido também não pode ultrapassar registros posteriores. Mesmo dia admite várias entradas. Formulário e servidor devem impedir inconsistências.
- Serviço: duração em km + km do evento gera data.nextKm; a duração fica em data.durationKm. Ambos são persistidos no JSON de Dados. Validar km base, duração inteira positiva e igualdade da soma. A meta associada aparece automaticamente nos lembretes, sem criar registro duplicado. Data de vencimento é independente; lembrete avulso mantém km absoluta. Preserve metas antigas sem base válida até edição explícita.
- Abastecimento misto é um registro com uma data/km/condição do tanque e até vinte componentes. Some litros/valores uma vez. Primeiro tanque cheio estabelece referência; parciais posteriores entram no próximo fechamento. Média geral é distância total ÷ litros dos intervalos válidos, não média simples.
- missedPrevious interrompe o intervalo incompleto. Cheio reinicia referência; parcial aguarda o próximo cheio. Última média fica vazia até fechar novo intervalo, preservando médias anteriores válidas e despesas históricas.
- Posto no abastecimento é texto histórico; editar/excluir favorito não reescreve lançamentos antigos.
- Importações mantêm os modelos LifeOS documentados, prévia, confirmação, IDs estáveis por veículo/origem, lotes de cinco, retomada e proteção de edições posteriores. São aditivas; não sobrescreva nem duplique registros já importados.
- CSVs pessoais ficam fora da pasta do código entregue. Mantenha componentes de misturas em combustiveis_json; não trate duas linhas do mesmo abastecimento como dois tanques. Regra de tanque cheio >18 L e estimativas documentadas foram autorizadas somente na conversão da planilha do carro; não generalize para lançamentos novos ou dados da moto.

## Verificação e entrega

- Execute verificações proporcionais à mudança. Para alterações de regras/servidor, use npm test; para telas/Next, valide npm run build. Rodar node tests/vehicles.cjs e node tests/vehicle-import.cjs ajuda a isolar veículos; mantenha a suíte completa para integração relevante.
- Cubra cálculos com centavos/litros, vazios/zeros, misturas, intervalos interrompidos, edição, repetição após falha e autorização. Não use serviços reais para esses testes.
- Verifique layout mobile/desktop quando houver ferramenta disponível. Build e renderização simulada não provam teste em Android/iOS; informe os limites sem alegar testes que não ocorreram.
- Preserve o fluxo de backup e o roteamento ativo; restauração não pode misturar IDs de bancos ou perder relações, anexos e proprietários.
- Atualize README e, quando pertinente, este arquivo. Entregue um ZIP completo com código em lifeos/ e CSVs pessoais separados em Importacao/. Incluir .env.example sem segredos; excluir node_modules, .next, caches, ambientes locais e credenciais. Valide a integridade do ZIP.
- Informe o que mudou, verificações feitas e se há alteração de Notion/variáveis ou necessidade de reimportar. Se não houver, diga isso claramente. Não execute deploy só porque o pacote foi preparado; siga o escopo pedido pelo usuário.

## Cabeçalhos de navegação

As páginas principais não repetem o título ou o subtítulo da aba ativa. Recados mantém seu título e subtítulo. Preservar títulos internos de cartões, seções, detalhes e formulários, além de ações e filtros de data. Guias únicas sem escolha (Meu dia em Acompanhamento e Garagem em Veículos) não são exibidas.

Botões principais de inclusão em Projetos, Tarefas, Compras, Aniversários e Veículos ocupam a linha de status de sincronização, alinhados à direita. PageActions usa um portal para preservar os manipuladores/estado da própria tela e desaparece ao sair dela. Gerenciar categorias de Finanças fica na linha dos filtros de data, à direita.

O ícone da aba Aniversários fica dourado quando há contatos na lista dos próximos 7 dias (hoje e os seis dias seguintes). Usa os contatos já carregados e a mesma regra do resumo, sem filtro da busca e sem consulta extra. Sem aniversários nessa janela, retorna ao ícone padrão; só o ícone recebe cor.

Aniversários admite notes (Observações) opcional, até 5.000 caracteres, com múltiplas linhas e links na lista. Campo rich_text Observações criado automaticamente no schema existente. Incluir notes no diff e validação; preservar contatos antigos sem o campo e compartilhamento das duas contas.


## LifeOS Captura Android

- android-capture/ é o app nativo auxiliar somente para criação de Inbox; não expandir para leitura/histórico ou outras abas sem pedido. Widget mostra botão e apenas relógio dourado/check verde (cinza sem conexão), nunca texto das capturas.
- Java, minSdk 26, compile/target 35, WorkManager 2.10.0; usar fila SQLite durável com textos criptografados no Android Keystore. Guardar captura e limpar rascunho na mesma transação. Retirar da fila apenas após confirmação do ID. Sem polling permanente ou serviço sempre ativo. Preservar filas/rascunhos ao sair e não misturar proprietários no pareamento.
- Credenciais nativas são de 90 dias e restritas ao endpoint de criação. Pareamento por sessão Google existente e código de conferência; prova do aparelho não vai na URL do navegador. Aprovação e revogação atômicas em Redis. Tokens do app não são sessões web, e sessões QR não podem autorizar dispositivos. API de envio usa lock/manutenção/roteamento ativos, proprietário derivado da credencial e consulta por ID exato, nunca snapshot completo.
- Recibos técnicos sem texto ficam no Redis para idempotência, inclusive após conversão/exclusão. Resposta ambígua sem registro encontrado permanece pendente; não repetir POST cegamente. notionStatus é classificação interna de uma resposta HTTP do Notion. Somente recusas explícitas 400/401/403/404/413/422/429 de criação permitem marcar recibo retryable, preservando digest. Rede/5xx/resultado desconhecido e recibos sending antigos continuam ambíguos; não liberá-los automaticamente.
- Agendamento Android inspeciona e agrupa trabalhos em executor serial fora da UI; manter sucessor ao worker em execução para não perder uma captura que chegue enquanto ele termina. Tentativa manual substitui trabalho adiado, sem cancelar conscientemente uma requisição em curso. Preservar IDs e remover local apenas após saved+ID correspondente; não confundir relógio de pendência com requisição ativa. Horários locais lastAttemptAt e lastSavedAt servem para diagnóstico, sem polling remoto. npm run test:android-queue requer JDK 17 e testa o worker Java real com doubles host, não um dispositivo.
- Android applicationId app.lifeos.capture, assinatura estável, versionCode crescente. Não incluir .gradle, build/, local.properties, JKS, senha ou ZIP de assinatura no código/GitHub. Assinatura entregue separadamente e mantida para futuras atualizações. Sem dependência de novo cliente OAuth ou banco.
- README é também o guia Android único; não criar instruções paralelas. Testes capture.cjs simulam serviços e executam Lua de produção; não usar produção para validar o APK. Nunca alegar teste em aparelho quando houve apenas build/lint.

Widget Captura Android 1.0.3 ocupa uma linha horizontal de duas colunas, redimensionável até quatro conforme launcher. Marca adaptável: ícone + LifeOS (OS azul) a partir de 240dp; em largura menor, só ícone. Texto de ação 18sp. Transparência do fundo de 0 a 100% configurável na tela principal, persistida localmente como widgetTransparency; aplicar só à imagem do fundo, preservando texto/ícones. Abre QuickCaptureActivity com tema Dialog sobre a home, teclado e campo multilinha; fecha ao enfileirar e mantém rascunho ao fechar sem enviar. Não simular EditText dentro de RemoteViews. CaptureActivity é apenas a interface principal/configuração. Mesmo applicationId/assinatura, versionCode 4.

## Algum dia: piloto gráfico e editor rico

- Coleção privada someday, um banco NOTION_SOMEDAY_DATABASE_ID (Nome/Tipo/Contexto/Dados/Anexos). Registros type area/idea com data.uid estável; data.area referencia UID lógico da área. Catálogo de áreas privado, aplicável aos dois contextos. Renomear preserva vínculos; ocultar preserva histórico e impede novas seleções.
- lib/someday.js valida JSON permitido do editor e converte ideias. Integrar coleção ao diff, rascunhos, hidratação, leituras parciais/retorno ao foco, autorização, upload e backup. Nas leituras parciais, carregar somente registros necessários e áreas, sem consultar todo o acervo.
- components/IdeaArt, SomedayView e IdeaEditor são piloto exclusivo. Fluent Emoji 3D local com licença MIT; cores e estilos sd-* isolados. Não estender o redesign a outras abas sem aprovação. Tiptap open-source, versões exatas; sem cloud/pacotes pagos. Carregar editor sob demanda.
- Imagens coladas/enviadas passam por resize local (até 1600px), upload autenticado e propriedade Anexos. Documento ideaImage referencia nome de arquivo único e estável, não ID mutável da lista nem URL assinada: precisa sobreviver a hidratação e restauração. NodeViews recebem anexos atualizados por contexto React. Excluir anexo remove suas referências na mesma alteração.
- Prévia de link usa lib/server/linkPreview e endpoint autenticado: apenas HTTPS público, validação DNS em cada redirecionamento e IP fixado à conexão, sem cookies/auth encaminhados, limites de tempo/tamanho e cache/limite por conta. Nunca inserir HTML remoto bruto. Miniaturas remotas são referências; não alegar que entram no backup.
- Conversão para tarefa/projeto é cópia confirmada de texto simples e anexos; original rico permanece. Atualizar URLs assinadas antes de copiar. Destino usa ID estável; gravar primeiro o destino, depois marcador na ideia, preservando idempotência na retomada. Não transformar em vínculo de página Notion.
- Inbox integra Algum dia por INBOX_TARGETS.algumdia (kind someday). Toda leitura de target.kind deve ser protegida; abas sem destino continuam abrindo entradas sem erro.
- Testar validação, acesso entre contas, dependências de áreas, conversão com falha parcial, links/SSRF, arquivos e backup restaurado. QA de browser pode usar serviços simulados; nunca usar produção para criar ideias de teste.

## Editor amplo e catálogo integrado de áreas

- SomedayView abre ideias em painel da própria página, ocupando a largura do conteúdo como ProjectsView; a coleção é recolhida durante a edição. Não voltar à barra lateral estreita nem ao modal estreito no mobile. Preserve retorno, holdEditor, rascunho intocado e bloqueio de saída durante upload.
- AreaManager/IdeaPalette são reutilizados pelo cadastro acessível nas duas abas. Sem botões de criar áreas sugeridas/copiar nomes. Inbox oferece somente a integração autorizada para criar ideias. Os cartões/ilustrações aprovados permanecem restritos a Algum dia; só o seletor e cadastro de áreas são integrados a Projetos.
- Projetos mantém area como nome no select Área existente do Notion; ideias mantêm data.area como UID lógico estável no catálogo privado someday. Nenhum novo campo ou banco. saveProjectArea renomeia a área e os projetos correspondentes em um único snapshot local, preservando status/contexto, conteúdo e anexos; o diff salva somente as alterações. Usar a mesma função pelo hook saveArea, sem setters independentes que possam perder metade da mudança.
- registerProjectAreas registra nomes dos projetos ausentes no catálogo ao carregar/atualizar dados, somente quando somedayConfigured e conta estão disponíveis. Não reescreve projetos na importação, não duplica áreas ocultas e limita o catálogo a 100; valores legados excedentes continuam selecionáveis. IDs de importação determinísticos por conta/nome evitam propostas diferentes por navegador. Catálogo privado, nos dois contextos, não muda acesso de projetos compartilhados.
- Renomear/ocultar preserva UID e vínculos existentes; seleção oculta só é permitida para manter o valor atual. Conversão de ideia para projeto usa o nome atual da área. Usar fluxo normal de conflitos, rascunho, backup e retentativa; não executar migração manual em produção.


## Catálogo ampliado de ilustrações

- lib/illustrations.js é o catálogo único das 359 Fluent Emoji 3D, com IDs estáveis art-*, rótulos, temas, termos de busca e caminhos locais. Arquivos WebP com transparência em public/emoji/fluent-expanded/; preservar LICENSE.txt e sources.json com revisão upstream. Não substituir valores legados nem remover arquivos anteriores.
- IllustrationPicker atende IdeaPalette (ideias e áreas compartilhadas com Projetos), NutritionView (somente alimentos/bebidas) e HabitsView (somente catálogo de emojis; códigos legados aceitos nos dados). Busca local sem acentos, tema, escolha atual visível mesmo filtrada e grade com altura limitada. Não criar requisição externa para escolher ícones.
- IDEA_ICONS, FOOD_ICONS e HABIT_ICONS incluem o catálogo relevante para que validação no cliente/servidor, reidratação e backup aceitem os mesmos IDs. IdeaArt/FoodImage preservam os fallbacks anteriores, inclusive fotos de produtos; HabitIcon resolve também os códigos antigos para emojis via HABIT_ILLUSTRATION_ALIASES, sem SVG. Sem migração em massa ou mudança de schema.
- A ampliação dos seletores é autorizada; não redesenhar outras telas nem criar seleção onde não existia. Veículos mantém modelos/cores específicos; Recados mantém emojis de texto independentes.

## Emojis de Bem-estar e alimentação em paisagem

- HabitIcon e WellnessIcon renderizam imagens locais, inclusive para IDs legados, sem ícones SVG. HABIT_ILLUSTRATION_ALIASES mantém códigos antigos válidos em lib/habits e na persistência; o seletor de hábitos oferece somente IDs art-*. Não migrar em massa os dados para mudar o desenho. WellnessIcon traduz também humor, mente, intestino, peso, pressão, energia, estresse e dores; preservar os SVGs estruturais das pétalas e dos gráficos.
- A regra de row-reverse dos hábitos foi removida. Dentro de well-habits, arte tem order:0, nome order:1 e check order:2; não depender do tipo de elemento (svg/img) para posicionamento. Tamanhos responsivos das pétalas usam .habit-art.
- Em paisagem com pointer:coarse e até 1400px, nutrition-meals define repeat(2,minmax(0,1fr)), grid-auto-flow:row e grid-auto-columns:auto. Essa regra prevalece sobre o fluxo em coluna do desktop e mantém a ordem das refeições. Não alterar a disposição de retrato ou desktop.

## Inbox para Algum dia

- moveInboxToSomeday recebe o snapshot e ID da entrada, valida configuração/título/conteúdo antes de remover a origem e devolve estado + ID. Primeira linha vira título de até 200 caracteres; demais linhas viram parágrafos de texto simples (incluindo vazios), sem HTML remoto ou interpretação de área/contexto. Área ativa obrigatória, escolhida antes da conversão; contexto inicial Pessoal editável e estilo da área.
- convertInboxToSomeday do hook altera someday e inbox em um único snapshot local, pelo fluxo normal de rascunhos e sincronização. ID/UID de destino determinísticos por conta e origem, inboxSourceHash identifica alteração posterior do texto. Retentativa preserva edições da ideia existente e recusa apagar origem alterada. Servidor grava upserts antes de exclusões; testar falha ao arquivar origem após criar destino e reenvio sem duplicação.
- Página abre o editor amplo por openRequest consumido via onOpenHandled. Não reabrir uma ideia antiga ao voltar à aba. Nenhum novo banco/campo/variável/APK. Não alterar outras conversões do Inbox.

- SomedayView mantém Gerenciar áreas e o contexto juntos em .sd-edit-controls (uma linha, desktop/mobile). Em telas estreitas o rótulo Contexto pode ficar acima do seletor dentro da própria coluna; os controles permanecem lado a lado. Não mostrar Sem prazo no rodapé dos cartões, nem deixar rodapé vazio ou separador inicial quando houver apenas Transformada.

## Gavetas e área obrigatória em Algum dia

- Página inicial de SomedayView mostra somente gavetas das áreas existentes. Mostrar todos é um botão ao lado de Gerenciar áreas, nunca um card; não mostrar a inscrição Abrir gaveta. Não criar gaveta especial para ideias sem área. Cards de ideias aparecem na segunda página. selectSomedayIdeas e somedayDrawers são funções puras; a pesquisa ignora área/contexto/favoritas para buscar no acervo privado carregado. Sem novas consultas de rede. Voltar fecha editor antes de retornar às gavetas.
- Criação parte de uma área ativa: usar a gaveta atual ou escolher em ModalLayer antes de abrir o rascunho. Não inserir rascunho intocado no estado remoto. Seletor de área não oferece valor vazio salvável. Ideias legadas sem área são lidas, mas precisam receber uma área antes de qualquer edição/favorito/promoção. Nenhuma atribuição ou migração em massa.
- Validação estrutural validateSomeday continua aceitando leitura/backup de legados; servidor exige área em cada upsert de ideia, mantendo legados inalterados fora do diff. Conservar validação de vínculo e áreas ocultas. Exclusões continuam permitidas.
- Inbox solicita área em diálogo sem remover a origem até confirmar. moveInboxToSomeday e convertInboxToSomeday recebem areaUid e validam área ativa; retentativa preserva a área/edições do destino já salvo. Destino antigo sem área recebe a escolha válida na retomada. Cancelar ou faltar área mantém Inbox.

## Datas padrão e PWA aberto por vários dias

- lib/useDateRollover.js fornece acompanhamento local do dia de Brasília para estados de data já existentes. Não remonte abas nem limpe rascunhos para atualizar datas. Registra foco, pageshow, visibilidade, lifeos-refresh e lifeos-refresh-date; timer local de 30s somente atua quando visível. Sem rede; limpar listeners/timer ao desmontar. Atualizar dispara lifeos-refresh-date antes da consulta remota, inclusive se ela falhar.
- Setter retornado marca datas manuais; escolher Hoje reativa o modo automático. blocked preserva formulários em preenchimento e a próxima entrada retoma o padrão ao liberar. Getter currentDefault confere a hora na própria ação, sem depender de timer. Validar meia-noite no fuso de Brasília, virada de ano, foco/retorno, alteração manual e digitação incompleta.
- Bem-estar, alimentação, Finanças, Diário e Recados usam o hook para os respectivos dias padrão. Não alterar datas de registros existentes, intervalos de relatórios escolhidos ou vencimentos opcionais de projetos/tarefas. Veículos já calcula habitToday ao abrir EntryForm. Novos hábitos e conclusão de mídia consultam habitToday na ação.
- InlineMeasurement recebe defaultDate e resolve a data ao iniciar o preenchimento se ainda estiver limpo. dirty/dateTouched preservam o dia em progresso e a data manual. Limpar/salvar volta ao padrão atual; não usar o relógio no submit para mudar um lançamento já preenchido.

## Histórico completo de pressão e peso

- MeasurementChart usa fullHistory booleano compartilhado por WellnessView; ambos os gráficos entram/saem juntos do histórico e well-measurements-expanded existe somente nesse modo. Voltar em qualquer gráfico restaura os dois cartões ao padrão. Nunca misturar SVG padrão com a largura expandida por outro gráfico. Padrão preserva doze médias diárias de pressão/doze registros de peso; histórico recebe todas as médias de dailyPressure para pressão e todos os registros de latestMeasurements para peso, sem limitar nem buscar novamente na rede. BPM/gordura mantém toggle independente ao trocar modo. Gráfico histórico tem datas completas e rolagem local em telas estreitas. observeMeasurementChartSize mantém rótulos em 11 pixels visuais via CSS variable e ResizeObserver, com cleanup no callback ref React 19; grid padrão usa minmax(0,1fr) para o conteúdo não impedir recolhimento.
- dailyPressure propaga hasNotes fora de data quando alguma medição do dia tem notes não vazio. Só círculos comentados ficam dourados, nunca linhas; pressão usa hasNotes da média diária nos dois modos; peso usa notes da própria entrada. Não persistir o agregado. Seleção de pressão usa os mesmos pontos pressure-average-* nos dois modos: uma medição abre sua edição, várias abrem o grupo diário pelo fluxo existente.


## Referência Geral

- Coleção privada reference, opcional enquanto NOTION_REFERENCE_DATABASE_ID não estiver configurado; NOTION_REFERENCE_DATA_SOURCE_ID somente se houver múltiplas fontes. FIELDS Nome/Tipo/Dados/Anexos; tipos category/material, sem contexto persistido (Pessoal fixo). UID lógico estável no JSON; material.data.category aponta para categoria exclusiva desta biblioteca. Nunca usar someday/áreas de projetos como armazenamento.
- ReferenceView tem gavetas ilustradas, favoritos, busca geral e editor amplo, sem título/subtítulo extra na página principal. Categorias possuem ícone/cor e descrição opcional. Não inserir dados de exemplo do mockup. Novo material exige categoria ativa; rascunho intocado fica só no editor. Ocultar categoria preserva materiais e mantém gaveta se não vazia. Nenhuma conversão em tarefa/projeto ou prazo.
- Reutilizar IdeaEditor/Tiptap com label acessível específico; manter validação validateIdeaDoc, upload autenticado, resize de imagens, prévias/SSRF e caminhos de anexos autorizados por kind=reference. Arquivos gerais recebem nomes únicos ref-UUID-nome; imagens referenciam nome estável, não índice/URL temporária. Excluir arquivo retira imagens do documento na mesma alteração.
- lib/reference.js valida materiais/categorias/catálogo, pesquisa local (título/documento/links/nomes dos anexos), favoritos e dependências. Servidor valida categorias existentes, identidades imutáveis, nomes ativos únicos, até 100 categorias/5.000 registros e acesso por dono. Delta inclui categoria da referência e consulta somente registros necessários/categorias/dependentes via UID, sem varrer materiais a cada edição.
- Integrar reference à hidratação, stripFiles, preparação de upload, rascunhos, compactação/diff, sincronização, bancos/roteamento/backup e permissão de anexos. Backup usa DB genérico e preserva JSON/nomes de arquivos. Não enfraquecer guarda de restauração de backups com conjunto de bancos diferente. Testar domínio/UI sem cabeçalho duplicado, privacidade de duas contas, conflito, repetição de envio, categoria, arquivos, rascunhos e backup/restauração.


## Busca no Diário

- searchDiaryEntries em lib/diary.js faz busca local no texto de todas as datas, sem acentos/caixa e com todas as palavras da consulta. Retorna entrada original + partes de trecho com marcações, ordenadas por data decrescente. Não criar HTML a partir do texto nem usar regex derivada da consulta. Manter offsets de Unicode para destacar os caracteres originais; limitar prévia a contexto ao redor da primeira ocorrência, com reticências.
- DiaryView troca calendário/navegação mensal por cards de data/trecho ao pesquisar. Alterar consulta fecha a entrada e limpa pedido de edição; clicar resultado abre a entrada em leitura bloqueada, preserva consulta e acompanha a data. Fechar retorna aos resultados; limpar restaura calendário. BackLayer fecha entrada antes da busca. Sem nova consulta de rede ou modificação das entradas; texto de anexos não é indexado.


## Abertura gradual com Inbox prioritário

- Home chama useNotionState({progressive:true,tabOrder}); demais consumidores/testes podem manter a leitura completa padrão. lib/startup.js centraliza grupos, associação de abas, ordem, estado inicial e merge. Inbox sempre primeiro; depois ordem local normalizada das abas, com prioridade explícita após a leitura corrente. Dependências de planejamento (Projetos/Marcos/Tarefas/Algum dia), Finanças, Bem-estar e Entretenimento são lidas/liberadas como grupos. Recados mantém API própria.
- GET /api/notion?group= aceita somente STARTUP_GROUPS via Object.hasOwn, autoriza a sessão e mantém o guard de versão de roteamento antes/depois. readSnapshot recebe selectedKinds sem consultar outras coleções; o marcador _startupGroup identifica a resposta. A leitura completa de GET sem group continua disponível. Não criar consultas paralelas sem rever limites do Notion; há uma leitura de grupo por vez.
- Estado de leitura é independente dos arrays: pending/loading/ready/error. Não renderizar formulários/permitir setters de bancos ainda não lidos. Guardar ensureLoaded também no flush para evitar que placeholders sejam enviados. Conversão do Inbox exige destino pronto antes de remover a origem. registerProjectAreas só roda após planejamento completo.
- Merge de grupo altera somente seus campos/flags; nunca substituir snapshot completo por uma resposta parcial. advanceSyncBaseline atualiza somente coleções efetivamente enviadas e preserva áreas que terminaram de carregar durante um save. Manter fila serial, snapshots de edições em voo, hidratação e rascunhos cifrados. Rascunhos anteriores pendentes usam o fluxo completo de recuperação, antes de ready, sem rebase silencioso.
- geração + usuário + sessão invalidam respostas após sair/trocar conta/desmontar. Comparar _routingVersion entre grupos; mudança bloqueia áreas e escritas, preserva o texto e exige atualização completa pelo fluxo existente. Falha isolada não transforma dados em vazios nem impede outros grupos. Pausar fila em ocultação, bloqueio QR ou manutenção; retomada visível respeita agrupamento/intervalo de foco, com retentativa explícita disponível.
- Testar Inbox antes de outros GETs, ordem de diferentes navegadores, prioridade, campos não solicitados ignorados, edição de Inbox durante carga, novos grupos durante save, grupos com falha/retentativa, pausa/retorno, rascunho anterior, saída com resposta em voo, mudança de roteamento, autorização de GET parcial e regressões da sincronização completa. Não validar com gravações reais no Notion.


## Cadeado compartilhado das tarefas

- TaskDetail mostra SVG azul de cadeado aberto/fechado ao lado de Fechar, fora do fieldset desabilitado. locked booleano é campo de tarefa em TASK_FIELDS/encode/decode; propriedade Notion Edição bloqueada (checkbox) criada automaticamente. sameField normaliza undefined/false como demais booleanos para evitar regravação de tarefas antigas. Privacidade e responsável não mudam; ambos os usuários autorizados de uma tarefa compartilhada podem alternar o estado.
- patchTask impede mudanças manuais quando locked, permitindo unlocked explícito. TaskDetail protege título/fieldset/anexos/exclusão; listas desabilitam checkbox; quadro impede arraste/mudança de marco. Operações parentais que afetem tarefas bloqueadas devem ser recusadas antes de mutações locais/parciais; não contornar o bloqueio em conclusão/cancelamento/exclusão de projeto, contexto/compartilhamento ou exclusão de marco. Ao excluir, desbloquear e salvar primeiro.
- sync revalida o locked real antes de qualquer gravação, independentemente do estado do cliente. Permitir desbloqueio explícito e reenvio idempotente de valores já iguais no servidor, inclusive título+cadeado salvos antes de resposta perdida. Campos de relação e assinaturas de anexos devem ser comparados com os vínculos corretos. Não criar restrição de responsável para alternar o cadeado.
- useTaskLock consulta somente a tarefa aberta com _notionId, usando GET autenticado /api/notion/task-lock, ownedPage e versão de roteamento. Abre/foco/visibilidade + intervalo de 10s, nenhuma nova consulta oculta; uma requisição por vez, limpar listeners/timer e ignorar respostas após fechar ou mudar o cadeado local. receiveTaskLock atualiza apenas locked no estado e na base, sem criar escrita nem descartar texto pendente; ignorar durante save ou alternância local pendente, e rejeitar revisão de bancos diferente.
- Testar alternância pelos dois usuários (inclusive não responsável), campos e anexos protegidos, UI lista/quadro, servidor contra cliente desatualizado, replay idempotente, acesso privado ao endpoint, operações de projeto, rascunhos, consulta oculta/fechamento e backup com checkbox preservado.


## Imagens coladas no Inbox

- Inbox mantém AutoTextarea de texto simples, sem editor rico, seletor de arquivo ou aviso fixo. lib/inboxImages aceita somente itens binários de imagem da área de transferência PNG/JPEG/WebP/GIF até 4 MB cada, até 100; impede colar HTML como imagem remota. Nome único inbox-UUID.ext evita ambiguidades por nome na reidratação/backup. Compose aceita somente imagem; miniaturas abrem em ModalLayer e removem explicitamente, com revogação das URLs locais. Não criar indicação dentro de Conteúdo/Nome no Notion.
- Anexos files em FIELDS.inbox é criado automaticamente se ausente. Integrar diff, stripFiles, preparação de upload, hidratação, rascunhos cifrados e attachment GET privado kind=inbox. storage serializa/restaura File apenas nos anexos Inbox de base/next antes/depois da cifragem; sessões temporárias continuam sem persistência. Reaproveitar upload com prova autenticada e conflito/retentativa existente. Backup genérico inclui a propriedade de arquivos.
- Imagens bloqueiam conversões do Inbox na UI e no dispatcher, exceto Diary; moveInboxToSomeday também recusa antes de criar/remover. Remover todas libera. Texto puro preserva os atalhos, layout e conversões atuais. Excluir remove a entrada pelo fluxo normal (lixeira Notion); não prometer apagamento físico imediato do blob.


## Captura Android 1.0.4: imagem da área de transferência

- ClipboardEditText é texto simples e uma imagem, reutilizado em QuickCaptureActivity e CaptureActivity. Paste de URI content:// e commitContent do IME (MIME anunciado) são explícitos; Android 31+ registra receive-content. Não adicionar seletor de galeria, novos MIME de tarefa ou permissões amplas. Imediatamente copiar bytes enquanto houver permissão, sem buscar HTTP/file URIs. Preservar paste de texto sem estilo. Miniatura/ampliação/remoção só aparecem quando há imagem.
- Limitar leitura8MB/40MP, decodificar com amostragem e normalizar PNG/JPEG até1600px e512KB. A redução também evita exceder CursorWindow: base64 + cifra + base64 do SQLite precisam caber por linha. Não elevar limite local para2MB sem mudar armazenamento para arquivos cifrados ou chunks. Não guardar URI temporária como único conteúdo do rascunho/fila.
- Store schema2 adiciona coluna image cifrada a queue/draft com ALTER TABLE, sem descartar v1. putDraft guarda texto/imagem juntos; enqueue salva ambos e limpa draft na mesma transação. first encaminha imagem no JSON existente; remover só após saved+ID. Pareamento/desconexão reconhecem rascunho só com imagem. Copiar pendentes copia apenas texto e informa existência de imagem, sem retirar captura da fila.
- captureInbox aceita image {mime,base64}, valida binário e limite2MB (corpo até3MB), proprietário continua derivado da prova nativa. Texto puro preserva digest antigo; com imagem, digest abrange texto/MIME/hash binário. Upload autenticado no servidor, nome inbox-UUID.ext estável. Recibo uploaded preserva uploadId para retentativa segura após recusa explícita; sending/5xx/rede continua ambíguo, sem segundo POST. Encontrar página verifica texto e nome da imagem; saved impede recriação após exclusão/conversão. Não guardar imagem/texto nos recibos Redis.
- Entrega exige APK assinado com chave existente, versionCode5/versionName1.0.4 e deploy da API cumulativa. Não afirmar teste em celular quando houve apenas build/lint/worker host. Manter widget sem conteúdo e sem novas consultas remotas.


## Captura Android 1.0.5: receber compartilhamentos

- Exportar somente ShareCaptureActivity para ACTION_SEND text/plain e image/*, category DEFAULT. QuickCaptureActivity do widget continua privada; não adicionar ACTION_VIEW, SEND_MULTIPLE ou permissões amplas. Compartilhamento nunca enfileira/envia sozinho: reutilizar painel e botão existentes.
- SharedCapture interpreta texto/subject e EXTRA_STREAM/ClipData com validação de action/MIME/URI content:// e apenas uma imagem; texto literal até10.000 caracteres, título sem duplicação. Não baixar URLs e não persistir só a URI temporária. ClipboardEditText.importSharedImage reaproveita cópia/normalização local e suprime callback até salvar texto/imagem juntos no rascunho.
- Preservar rascunho existente: confirmar append de texto; se ambas as entradas têm imagem, recusar a nova sem substituir a atual. Não truncar o texto pela LengthFilter: conferir soma antes. shareHandled em onSaveInstanceState impede reaplicar compartilhamento ao recriar janela. Não sobrescrever rascunho se sua leitura falhar.
- Mesmo banco local schema2 e API de 1.0.4, versionCode6/versionName1.0.5, assinatura existente. Sem novo deploy obrigatório se API de imagens estiver publicada. tests/android-share.cjs executa SharedCapture Java real com doubles Android; não alegar teste de chooser/aparelho.


## Miniaturas nos cards de Algum dia

- ideaCardPreview seleciona a primeira ideaImage disponível na ordem do documento por attachmentId = nome estável do anexo; nunca usar posição da lista de anexos ou ID efêmero como vínculo. Resolver pageId/index/nome no endpoint autenticado kind=someday, com fallback seguro HTTPS de anexos ainda sem pageId. Ignorar referências ausentes e arquivos que não aparecem no documento.
- Retirar marcadores de imagem apenas da prévia visual, preservando ideaText, busca, conversões, documento e metadados. Cards com imagem e texto mostram ambos; só imagem dispensa texto genérico. Miniatura lazy/async, proporção preservada com object-fit:contain, falha não quebra abertura do card. Miniatura de 66×66px fica no heading ao lado do título, substituindo o ícone da categoria, sem uma segunda imagem grande abaixo. Cards sem imagem não têm ícone nem espaço vazio reservado; manter tag da área e demais informações. Ilustrações das gavetas permanecem. Não estender a mudança a Referência Geral ou gavetas de áreas sem pedido.


## Aviso de manutenção no ícone da aba Veículos

- hasVehicleMaintenanceAlert reutiliza maintenanceAlerts para todos os veículos da garagem: true somente se existir near/overdue ativo. Respeitar warningKm individual, 30 dias, maior km dos lançamentos e completed. Não limitar ao veículo selecionado nem acender para scheduled ou registros órfãos.
- Home só calcula aviso após veículos carregados/configurados e sessão ready. Dia local de Brasília acompanha useDateRollover, sem novas consultas de rede. TabIcon recebe highlighted e aplica vehicle-notice apenas a veiculos; CSS usa o mesmo dourado/sombra de birthday-notice, somente no SVG. Preservar aviso de Aniversários e estado/ordem/cores do restante da aba; rótulo acessível informa manutenções próximas/vencidas.


## Distância entre abastecimentos

- fuelEntryMetrics inclui distance derivada da diferença de hodômetro entre abastecimentos consecutivos registrados, inclusive parciais, por veículo e segundo orderedFuel. Não usar distância do intervalo de tanques cheios de fuelSummary nem km inicial do cadastro. Usar todo histórico antes de limitar/ordenar visualmente a tabela.
- Primeiro abastecimento ou km ausente/inconsistente retorna null (—); zero é válido. missedPrevious mantém diferença entre registros conhecidos, sem modificar a interrupção de consumo. Distância somente de leitura ao lado de Km, unidade km, sem persistência/schema ou nova importação. Recalcular após edição/exclusão/inserção, não misturar veículos.


## Bloqueio manual da sessão QR

- AccountMenu mostra Bloquear sessão somente com user.temporary e onLock. Home fornece remote.lockQr. A ação fecha o menu e usa, via qrLockAction, a mesma função lock do efeito de inatividade; não duplicar autorização, expiração, código, flush ou timers. Limpar referência ao trocar/desmontar a sessão. Login Google não recebe bloqueio por código.
- Bloqueio local imediato, POST action:lock existente, expiração/revogação pelo fluxo normal existente. Expiração absoluta nunca muda; lock não renova lastSeen/codeHash no servidor. Não chamar heartbeat nem unlock como parte do bloqueio. Preservar pendências em memória, sem persistência QR, e retomar só após desbloqueio; não esperar salvar antes de ocultar a tela.
- Testar menu temporário/permanente, bloqueio repetido, texto pendente, reaproveitamento do código, exp e TTL fixos e retorno ao login após expiração. Nenhuma mudança no Notion/APK ou deploy automático.


## Rich text no Diário

- DiaryEntry reutiliza IdeaEditor carregado sob demanda, incluindo colagem/upload de imagens e prévias HTTPS. Preservar bloqueio ao reabrir e botão explícito de edição; entradas apenas com anexo também são existentes. Não redesenhar calendário ou busca. Upload bloqueia conclusão/fechamento/troca de data; holdEditor protege edição contra refresh remoto. Atualizações consecutivas de imagem/documento usam latest ref para não perder anexos antes do render.
- diary.doc é JSON Tiptap permitido por validateIdeaDoc, em campo rich_text Documento criado automaticamente no banco existente. diary.text é projeção ideaText consistente para consulta; incluir doc no diff, encode/decode e validação de servidor. Documentos novos até 30.000 caracteres/80.000 de JSON conforme validação compartilhada; legados até 10.000. Documento vazio remoto normaliza null, sem migração em massa.
- legacyDiaryDoc converte markdown simples (título, listas, negrito/itálico) só ao editar; leitura legada segue existente. Imagens usam nome estável dos anexos e endpoint privado kind=diary. DiaryDocument renderiza JSON sem HTML bruto, links HTTPS seguros, sem controles de edição. Remover arquivo retira ideaImage correspondente na mesma atualização. Backup genérico preserva Documento/nomes e copia bytes dos anexos.
- appendInboxToDiary acrescenta parágrafos literais ao documento rico existente sem desmontar imagens/marks/cards; mantém fluxo/confirmações e valida tamanho antes de retirar Inbox. Busca deriva texto visível do documento em todas as datas. Testar round-trip no servidor, conflitos de formatação, validação/links/imagens, compatibilidade, busca, Inbox e callbacks consecutivos sem render.


## Inbox com imagens para o Diário

- Exceção exclusiva kind=diary no Inbox e dispatcher. moveInboxToDiary aplica uma única atualização inbox/diary no hook, com ensureLoaded/QR e validação antes de remover origem. Usa estado atual, não cópia antiga do modal. Manter confirmação quando hoje já existir e reabertura para edição; texto e imagens acrescentados ao corpo do Diário, sem dependência do endereço do Inbox. Outras conversões seguem bloqueadas.
- appendInboxToDiary preserva doc/marks/cards e anexos existentes, aceita imagem sem texto, limite total de 100 anexos e nomes sem colisão. IDs de anexos do destino derivados do item/arquivo de origem. Inserir ideaImage por nome estável automaticamente ao converter imagens do Inbox. Copiar bytes File pendentes; storage cifrado serializa Files de Inbox e Diário com formato anterior compatível; stripFiles retira binário do payload. QR continua sem persistência.
- Arquivos já persistidos levam inboxSourceId transitório. No servidor, nova imagem de Diary que não está entre arquivos atuais é resolvida pelo nome na entrada Inbox incluída nas exclusões do mesmo delta, com acesso/conflitos existentes. Usar URL atual retornada pelo Notion, ignorando URL do cliente; gravar destino antes de arquivar origem. Hidratação devolve kind=diary/pageId do destino e descarta marcador. Reenvio após falha no arquivamento deve preservar o destino único e não duplicar texto/anexos. Sem novo endpoint/schema/migração.


## Follow-ups integrados a On hold / Follow-up

- tasks.recurrence opcional usa JSON version2: mode/unit/every/anchor/next/weekdays e lastCheck null ou {id,date,next}. Não armazenar histórico, contagem, estado de pausa/encerramento ou comentários. Campo rich_text Recorrência e TASK_FIELDS existentes; mesma privacidade, compartilhamento, responsáveis, cadeado, diff, hidratação, rascunhos e backup. Nenhum banco/variável/APK novo. Valor Notion On hold preservado.
- Todo acompanhamento novo/aberto usa status hold. Checkbox/botão Acompanhamento feito usa completeFollowup: somente se devido e desbloqueado, substitui lastCheck, calcula próxima data e mantém hold. Nunca acumular consultas. Desligar o toggle remove recurrence, define hold/completedAt null e preserva os campos comuns sem confirmação adicional. Não há controles de histórico, comentário, pausa, retomada ou encerramento. Observações ficam em task.notes.
- makeFollowup cria version2; compactFollowup projeta somente os campos permitidos. Legados version1 permanecem legíveis/validados, sem mutar baselines ou gravar em massa. Última entrada antiga pode sustentar o check; editar programação/consultar converte a version2 e descarta histórico/comentários antigos. Antigo paused não suspende mais individualmente a programação; antigo ended/status done permanece concluído até ação explícita. Não copiar comentários antigos automaticamente para notes.
- after conta do dia efetivo; fixed usa âncora, múltiplos e dias semanais, recuperando dia31 após meses curtos. Dias ISO UTC, hoje de Brasília. Pular ciclos perdidos até próxima data estritamente futura; repetição de clique antes da próxima data é no-op. Servidor valida version2 e legado version1, inclusive registro remoto + keys contra cliente antigo que tenta status done sem remover recurrence.
- closeProjectTask conclui tarefas abertas e remove recurrence ao concluir/cancelar projeto confirmado, sem consulta fictícia. Preservar já concluídas e completedAt. Servidor inclui filhos recentes; no replay após falha parcial adotar também recurrence:null confirmada remotamente. Exclusão de projeto exclui filhos; reabertura não reativa. Respeitar tarefas bloqueadas.
- taskVisibleOutsideProject oculta tarefas de projetos paused da lista global, contagem, busca e aviso; dentro do projeto continuam visíveis. Pausar projeto não muda dados/datas, retomar restaura visibilidade e atraso. hasFollowupNotice/Home usam relógio local e dourado existentes, sem polling extra.
- Testar cálculos, limite/datas/bissexto, check repetido, versão legada, ausência de comentários/histórico, toggle que retorna hold preservando campos, compartilhamento/cadeado, servidor/rascunhos/conflitos/reenvio, conclusão/cancelamento/exclusão de projeto. npm test e npm run build; não gravar em produção para verificar.


## Imagens do Inbox no corpo do Diário: correção de referência

- appendInboxToDiary retira pageId/index/kind/url de origem ao copiar o arquivo local; inboxSourceId continua transitório exclusivamente para resolução do arquivo no servidor. Cria nós ideaImage por nome estável no documento, preservando linhas vazias como paragraph sem text vazio, conteúdo rico anterior e anexos. Hidratação aplica bindDiaryAttachments somente aos metadados: nunca transformar doc/text da baseline em conteúdo que ainda não foi salvo.
- bindDiaryAttachments usa a página do Diário para arquivos persistidos, normaliza índices e kind=diary; pendentes não mantêm a rota privada do Inbox e só recebem a referência final confirmada pelo save. Testar result.files da conversão e GET kind=diary após arquivar origem (302), origem excluída (404) e outra conta (403). Não liberar GET de Inbox excluído nem enfraquecer acesso.
- diaryPresentation converte imagens geradas de Inbox e diary-inline-* não referenciadas em nós visuais sem mutar registros/base nem gravar em massa. Permite mostrar transferências anteriores quando o arquivo ainda está no Diário; a próxima edição persiste o documento. Não prometer restaurar bytes ausentes na base.
- diaryManualAttachments exclui backing files do corpo da listagem de anexos manuais. setDiaryManualAttachments preserva arquivos inline ao incluir/excluir manuais; setDiaryDocument retira backing file quando a última referência é removida. IdeaEditor aceita imagePrefix opcional, usado somente no Diário como diary-inline-; outras áreas preservam nomes/comportamento. ProjectAttachments aceita nameForFile opcional para evitar que nomes manuais reservados sejam confundidos com imagens automáticas.


## Toggle de acompanhamento nos detalhes da tarefa

- button role=switch aria-checked fica abaixo de todos os campos principais, incluindo notas/anexos, antes de excluir. Off por padrão; ligar cria makeFollowup + hold/completedAt null, preservando campos comuns. FollowupFields contém apenas programação e Acompanhamento feito. Desligar explícito sempre recurrence:null + hold/completedAt null, inclusive em registros legados encerrados; não reativar recurrence automaticamente ao receber null.
- Respeitar cadeado no disabled e handler; teclado/foco/aria-controls e prefers-reduced-motion. Azul LifeOS discreto. O checkbox de consulta mantém o toggle ligado.

## Check visual do ciclo de follow-up

- Checkbox nas listas de Tarefas/projeto = status done OU followupChecked(task,today). Último lastCheck (fallback legado history.at(-1)) marca quando date <= hoje < recurrence.next e last.next igual à programação atual. Futuro sem consulta fica vazio; reprogramação não herda check antigo.
- Azul/desabilitado até a próxima data, depois vazio/habilitado, respeitando cadeado. Não riscar título/mover para Concluídas. useDateRollover acompanha Brasília/foco/sessão aberta, sem rede/escrita/reset persistido. A indicação é substituída, nunca acumulada em histórico.
