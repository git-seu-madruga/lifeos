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

- Concluir projeto com pendências exige confirmação e conclui tarefas e marcos vinculados, incluindo itens remotos recentes. Preserve completedAt dos já concluídos; grave a conclusão do projeto existente após os filhos. Reabrir não reabre filhos.
- Projeto excluído também exclui tarefas e marcos associados. Concluído/cancelado preserva histórico; prazo de marco é referência, sem atraso próprio, e não ultrapassa o prazo global definido.
- Tarefa não usa status Cancelada; mantenha exclusão e anexos. Compartilhamento removido pede confirmação com indicação do destino privado.
- Diário tem uma entrada por data, leitura bloqueada ao retornar, desbloqueio explícito e ausência de marcador quando texto/anexos não constituem entrada. Conversão do Inbox usa hoje e confirma reabertura quando necessário.
- Hábitos ficam dentro de Bem-estar. Ícones principais marcam somente hoje; correções passam pelo resumo mensal. Alterações fora de hoje e exclusões pedem confirmação. Encerrar/recuperar preserva histórico e pede confirmação; resumo anual é leitura e abre o mês.
- Pressão admite múltiplas medidas/dia e média diária; peso/gordura tem apenas uma entrada/dia. Ocultar uma série/escala do gráfico não impede registrar seu valor. Toggle da escala direita ocupa a mesma linha do resumo numérico de pressão/peso, sem linha exclusiva; MeasurementChart recebe summary/summaryNote para manter o controle junto aos valores.
- Compras não guarda histórico de itens concluídos. Preserve ordenação manual de itens/listas e integração do Inbox.
- Finanças mantém entradas/saídas, categorias compartilhadas e aposentadoria de categorias sem apagar lançamentos. Edições fora do mês atual usam as confirmações existentes; Sankey não permite arrastar barras.
- Entretenimento mantém quatro seções: leituras, jogos, séries e filmes. Cada seção tem página, filtros/status, avaliação, capas, visualização compacta/completa e resumo mensal/anual. Conclusão exige data; preserve ordem dos concluídos e ordem de criação dos demais. Preserve atribuições exigidas pelos provedores, inclusive TMDB na área de filmes.
- Recados: um envio por remetente/dia, confirmação antes de enviar, título/texto/imagem e calendário. O coração de aviso substitui somente o ícone da marca, preserva LifeOS escrito e abre Recados apenas enquanto houver recado recebido de hoje não lido.

## Acompanhamento: comportamento atual

- Coleção privada nutrition, um banco NOTION_NUTRITION_DATABASE_ID com Nome/Data/Tipo/Dados. Tipos settings, day, entry e food. JSON usa data.uid estável; base nutricional/receita é copiada no lançamento. Editar ou retirar alimento não reescreve histórico.
- Resumo alimentar mostra Café da manhã, Almoço, Lanche e Jantar por padrão; Ceia/Outros aparecem com lançamentos, na ordem de MEALS. Desktop usa uma única linha de cartões adaptáveis; mobile mantém uma coluna.
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
