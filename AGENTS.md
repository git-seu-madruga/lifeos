# LifeOS — manutenção

Estas orientações valem para todo o repositório. Pedidos posteriores do usuário prevalecem sobre decisões antigas. O código e seus testes definem o comportamento efetivo; protótipos, sugestões e versões anteriores não devem ser apresentados como recursos implementados.

## Escopo, autorização e documentação

- Preserve funcionalidades anteriores e limite mudanças à área solicitada. Não redesenhe outras telas, troque dependências ou crie migrações como efeito colateral.
- Prepare implementação, revisão e verificações antes de solicitar aprovação. Cada commit no GitHub precisa de confirmação explícita do usuário; aprovação de um commit não autoriza os seguintes. Commit/deploy não decorrem automaticamente de preparar um ZIP. Após publicação autorizada, confirme o resultado da Vercel antes de anunciar sucesso.
- `README.md` é o guia de instalação, configuração e uso atual; este arquivo contém contratos de manutenção. Atualize os dois quando necessário, substituindo informações superadas em vez de acumular notas de versões. Não crie novos guias INSTRUCOES-*.md.
- Documentação pública e `.env.example` não devem conter nomes/emails reais das contas, domínio instalado, IDs reais de bancos, históricos pessoais, placas, custos de uma importação particular, credenciais ou material de assinatura. Use papéis genéricos e campos vazios. Preserve licenças e atribuições de terceiros. Limpar arquivos atuais não reescreve o histórico Git.
- Não remova configurações ou fallbacks legados do código para limpar documentação. Alterações de identidade, acesso, domínio, bancos e roteamento exigem trabalho específico; não altere os valores efetivos do ambiente.

## Estrutura e dependências

Next.js 15, React 19, App Router, Notion, Upstash Redis, autenticação Google e PWA; Tiptap 3 com versões exatas. Preserve `package.json`/lockfile, a menos que a atualização de dependências faça parte do pedido.

| Local | Responsabilidade |
| --- | --- |
| `app/page.js` | Composição, abas/contexto, Inbox, sessão, modais e indicadores |
| `components/` | Telas e controles reutilizáveis |
| `lib/useNotionState.js` | Estado, drafts, fila de salvamento, hidratação, foco e sessão |
| `lib/notionDiff.js`, `lib/startup.js` | Diff/compactação e grupos de abertura gradual |
| `lib/server/notion.js`, `lib/server/sync.js` | Schema, leitura/escrita, validação, acesso, conflitos e relações |
| `lib/server/access.js`, `auth.js`, `google.js`, `qrAuth.js` | Autorização e autenticação |
| `lib/server/coordination.js`, `routing.js`, `backup.js` | Locks, bancos ativos e backup/restauração |
| `lib/someday.js`, `planningDocument.js`, `diary.js` | Documentos ricos, projeções e conversões |
| `lib/vehicles.js`, `vehicleCharts.js`, `vehicleImport*.js` | Regras, séries e importação de veículos |
| `android-capture/` | Captura Android com widget, fila e compartilhamento |
| `tests/*.cjs` | Assert/SWC e serviços simulados; não serviços reais |

## Dados e sincronização

- Notion é a persistência remota. Diferencie ID local, `_notionId` e UID lógico dentro de JSON. Não use ID de página no lugar de UID estável. Relações e backups precisam conservar esses contratos.
- Datas de domínio são `YYYY-MM-DD`; não aplique conversão de fuso que mude o dia. Hoje é calculado em Brasília. Valores monetários são centavos inteiros; litros têm até três casas. Some litros em mililitros; `null` significa desconhecido, não zero.
- Escritas são incrementais, serializadas e protegidas contra concorrência/reenvio. Mantenha base, snapshot em voo, rascunhos pendentes, bindings, arquivos e conflitos. Não resolver falha descartando drafts, ignorando locks ou sobrescrevendo a coleção inteira.
- Novos campos precisam de diff, encode/decode, validação, hidratação, rascunhos e backup compatíveis. Novas coleções exigem também schema, acesso, grupos/dependências e roteamento. Dados estruturados novos não justificam automaticamente um banco adicional.
- `compactSyncState` carrega registros alterados e dependências; leituras por ID/relação não devem virar varredura global por edição. Upserts de destinos precedem exclusões de origem. Repetir uma operação confirmada não deve duplicar registros, texto ou anexos.
- Foco/visibilidade/atualização manual preservam formulários e drafts, agrupam eventos e respeitam operações em curso. Não consultar coleções periodicamente em segundo plano nem sobrescrever edições abertas; use `holdEditor` quando houver formulário local fora do autosave compartilhado.
- Abertura gradual: Inbox primeiro; depois ordem local normalizada das abas, com prioridade da aba escolhida após a leitura corrente. Projetos/Marcos/Tarefas/Algum dia, Finanças, Bem-estar e Entretenimento têm grupos relacionados; Recados usa API própria. Uma leitura de grupo por vez.
- Loading/ready/error são independentes dos arrays. `ensureLoaded` protege setters e flush; placeholders não podem ser enviados como exclusões. Merge parcial altera só campos do grupo. `advanceSyncBaseline` não desfaz dados carregados durante um save.
- Geração, usuário e sessão invalidam respostas atrasadas após saída/troca/desmontagem. Mudança de `_routingVersion` bloqueia grupos e escritas, preserva pendências e exige releitura compatível. Falha de um grupo não esvazia os demais. Pausar fila em ocultação, bloqueio QR e manutenção; drafts completos antigos seguem o fluxo de recuperação, sem rebase silencioso.
- Não execute importações, migrações, limpezas, testes de escrita ou backups reais para verificar código. Use doubles/serviços simulados; produção só quando fizer parte do pedido.

## Acesso, sessão e segurança

- Só as duas contas Google configuradas entram. Conta principal vem da configuração; registros privados antigos sem proprietário pertencem a ela. Pessoal/Trabalho não é uma fronteira de segurança.
- Privados: Inbox, Diário, Hábitos/logs, Bem-estar pessoal/medidas, Entretenimento, Acompanhamento, Algum dia e Referência. Projetos/Marcos/Tarefas são privados por padrão, com compartilhamento opcional. Compras, Aniversários, Finanças e Veículos são compartilhados.
- Ciclo mantém a identidade fixa existente e a permissão atual de ambas as contas; não o converta em cópias privadas por conta. Não exponha a identidade nominal na documentação pública.
- Projeto compartilhado obriga marcos/tarefas compartilhados. Projeto não tem responsável; tarefa compartilhada exige um dos responsáveis válidos, sem restringir a edição a ele. Criação rápida no projeto exige escolha explícita. Retirar compartilhamento confirma retorno ao proprietário original e ajusta filhos remotos recentes.
- Recados deriva remetente/destinatário no servidor; só destinatário confirma leitura. Backup/restauração é da conta principal. Mantenha autorização no servidor para leitura, escrita e anexos, além de checks de origem, identidade, manutenção e coordenação.
- QR: uso único, dois minutos; sessão temporária de até uma hora, dez minutos de inatividade e desbloqueio por código somente no navegador autorizado. Cinco erros encerram. Bloqueio/desbloqueio não estendem a expiração absoluta; revogação e retorno ao login mantêm o fluxo normal.
- `AccountMenu` oferece Bloquear sessão somente para sessão temporária. Use a mesma função de inatividade via `qrLockAction`, sem novo código, heartbeat, renovação ou flush antes de ocultar a tela. Pendências ficam na memória durante o bloqueio.
- Sessões QR não leem/gravam IndexedDB privado, inclusive drafts de Recados, nem autorizam novos aparelhos. Login Google preserva drafts cifrados. Não exponha tokens, cookies, segredos, credenciais de ambiente ou assinatura em logs, código entregue ou ZIP.

## Interface, navegação e carregamento

- Preserve paleta escura, ícones, espaçamentos e acessibilidade. Reutilize DateInput, MonthInput, MonthPicker, ModalLayer, links e anexos. Rótulos/foco/teclado e `prefers-reduced-motion` são parte do comportamento.
- Desktop mantém Inbox à esquerda com divisória vertical. Mobile rola abas sem barra aparente. Inativas mostram só ícone; selecionada revela nome. Ordenação mobile: dois toques (origem/destino), inserção antes, mesma aba desmarca; arrastar só rola, sem captura de ponteiro. Desktop mantém drag e Alt+seta.
- Contexto centralizado; áreas pessoais bloqueiam Trabalho/Todos. Cabeçalhos principais não repetem nome/subtítulo da aba, exceto Recados. Ações principais de inclusão usam PageActions; preserve portal e estado do componente.
- Calendários seguem seta esquerda → campo → seta direita → calendário → Hoje. Dia/mês completa ano ao concluir; mês sozinho completa ano. `useDateRollover` acompanha Brasília/foco/pageshow/visibilidade/refresh e timer local visível de 30s, sem rede. Respeita data manual e formulário em preenchimento; não remonte/limpe formulário na virada.
- ModalLayer/BackLayer fecham somente camada superior com animação breve. Selecionar texto e soltar fora não fecha painel. Preserve proteção de saída e não acumule entradas de histórico. PWA é standalone, não fullscreen; não reintroduza contornos de autenticação/rolagem para flickering já corrigido.
- `app/page.js` usa `next/dynamic` com imports literais no escopo do módulo para as 13 telas principais. Renderiza só aba selecionada com dados prontos; placeholder tem `role=status`. Não carregar antecipadamente todas as telas, recriar componentes/estado globais por render nem modificar a política de sincronização para dividir código. Inbox/login/navegação e componentes globais permanecem no pacote principal; AreaManager já é dinâmico.

## Projetos, tarefas e follow-up

- Projeto done/cancelled com pendências exige confirmação e conclui tarefas/marcos, incluindo filhos remotos recentes. Gravar filhos antes do status final do projeto existente. Preservar `completedAt` já confirmado; reabrir não reabre filhos. Transições done↔cancelled também consultam filhos por relação no snapshot parcial. Excluir projeto exclui todos os filhos; tarefas não têm status Cancelada.
- Reenvio de conclusão reconcilia filhos já done na UI. `sameCompletionTime` aceita igualdade ou truncamento exato do horário candidato a segundos/minutos; nunca qualquer horário do mesmo minuto. `taskCompletions` só hidrata envolvidos e não apaga reabertura/texto editados durante envio.
- Marcos não ultrapassam prazo final. Contexto/compartilhamento do projeto são herdados. Pausar projeto só oculta suas tarefas das listas/buscas/contagens/aviso globais; dentro dele continuam visíveis, com datas inalteradas. Retomar devolve visibilidade e atraso existente.
- Aberto: status/data antes do desempate por criação crescente; concluído: conclusão decrescente. `_createdAt` é metadado, fora do diff/TASK_FIELDS: criar nos três fluxos, recuperar dos IDs antigos e timestamps do Notion. Não regravar registros em massa só para ordenar; Compras mantém sua ordem própria.
- Títulos novos focam vazios com placeholder; `_untouchedDraft` não entra em snapshots persistidos. Fechar descarta somente intocados; edição real promove o registro. Não salvar placeholders como títulos.
- Cadeado `locked` usa Edição bloqueada automática. Ambos autorizados podem alternar; UI, `patchTask` e sync revalidam bloqueio real. Proteger campos, anexos, check, exclusão, arraste, marco e operações parentais afetadas. Desbloqueio explícito é permitido; replay já igual é idempotente. Não criar regra de responsável para o cadeado.
- `useTaskLock` consulta só tarefa aberta persistida, com acesso/roteamento, foco/visibilidade e intervalo visível de 10s; uma chamada em voo, sem leitura oculta. Não sobrescrever estado local durante save/toggle; limpar listeners/timer ao fechar.
- Follow-up é tarefa `hold`, na lista **On hold / Follow-up**. `recurrence` v2: `{version,mode,unit,every,anchor,next,weekdays,lastCheck}`; `lastCheck` é nulo ou `{id,date,next}`. Sem histórico, contagem, comentários separados ou estado de pausa/encerramento.
- `completeFollowup` só atua quando devido e desbloqueado, substitui recibo, calcula próxima data estritamente futura e mantém hold. Antecipado/repetido é no-op; não acumular ciclos atrasados. `after` parte da consulta efetiva; `fixed` mantém âncora/dias semanais e recupera dia31 após meses curtos. Reprogramar manualmente redefine âncora/próxima data, sem mudar intervalo.
- Toggle fica abaixo dos campos comuns; ligar cria regra + hold/completedAt nulo. Desligar remove recurrence, volta a hold e preserva dados comuns, inclusive legado encerrado. Prazo é informativo; não há encerramento automático. Projeto concluído/cancelado remove recorrência ao concluir os filhos; reabrir não a recria.
- Legado v1 continua legível/validado, sem migração em massa; `compactFollowup` projeta campos v2 após edição/check. Último recibo legado pode sustentar check visual. Antigo paused não suspende individualmente; antigo ended/done permanece done até ação explícita. Não copiar comentários antigos para notes por conta própria.
- Check visual = done ou recibo com `date <= hoje < next` e programação correspondente; azul/desabilitado até nova data, sem riscar título ou mover para Concluídas. Reprogramação não herda check antigo. Relógio local, sem escritas de reset; aviso dourado ignora tarefas de projetos pausados.

## Documentos ricos, anexos e conversões

- IdeaEditor é carregado sob demanda e usa JSON permitido por `validateIdeaDoc`, não HTML bruto. Permite títulos2/3, listas/marks, links HTTPS seguros, `ideaImage`, `ideaBookmark` e `ideaEmoji`. Limites:30.000 caracteres/80.000 JSON; Recados limita mensagem a12.000. Imagens não são base64 no documento.
- `ideaImage` vincula nome único estável do anexo; nunca índice/ID efêmero/URL assinada como identidade. Upload autenticado até4MB; resize local1600px para JPEG/PNG/WebP, GIF preservado. Remoções de arquivo/nó mantêm documento e backing files consistentes, preservando manuais. URLs locais são revogadas; pendentes não carregam rota de outra página.
- `ideaEmoji` é atom inline com ID do catálogo; resolver via `illustrationById` na validação/renderização, sem URL arbitrária. Projeção textual usa o rótulo. Picker completo está habilitado em Recados e descrições de tarefas/projetos; não criar seletores em outras telas por inferência.
- `Documento` automático em Diário/Recados/Projetos/Tarefas; encode/decode JSON e diff compatíveis com ausência/nulo. Projeções `text`, `notes` ou `description` precisam corresponder ao documento. Abrir texto legado não persiste migração. Arquivos e JSON entram no backup genérico.
- PlanningDescription usa `planningDocument` e ref atual entre callbacks de imagem/documento. `doc` em PROJECT_FIELDS/TASK_FIELDS; sync valida documento, projeção e backing file inequívoco. Imagens `planning-inline-*`, rotas kind=tasks/projects e lista manual separada. Cadeado oferece leitura sem editor e protege callbacks; upload protege fechamento/exclusão do painel e toggle manual do cadeado. Não mudar status/recurrence ao editar descrição.
- DiaryEntry abre bloqueado e libera edição explicitamente. `legacyDiaryDoc` interpreta o legado somente no fluxo previsto; `DiaryDocument` renderiza JSON seguro e recebe kind correto. Upload protege conclusão/fechamento/troca de data; ref evita perder anexos em callbacks consecutivos. `bindDiaryAttachments` altera só metadados, não baseline/doc. `diaryPresentation` recupera apresentação inline de arquivos transferidos antigos sem gravar em massa nem prometer restaurar bytes ausentes.
- Inbox é texto simples, com atalhos/paste preservados e clipe discreto em compose/entrada. Até100 arquivos de4MB, nomes `inbox-file-UUID-*` e legado `inbox-UUID.ext`. Não aceitar HTML remoto como imagem colada nem implementar drag/drop sem pedido. Prévia lazy; arquivos genéricos abrem em nova aba com noopener/noreferrer, sem forçar download.
- Imagem do Inbox abre painel Ajustar/100%/Abrir em outra aba; tamanho original intrínseco e viewport rolável. Clique/Enter/Espaço alternam ajuste; reabrir reinicia ajuste. Não baixar outro arquivo nem estender esse zoom a outras áreas por inferência.
- Conversão com anexos só para task/project/diary/someday; bloquear demais integrações com arquivos, sem descartá-los. Task/project: título na primeira linha, notas nas demais, fallback nome do arquivo. Diário: hoje, append literal preservando marks/cards e confirmação/reabertura; imagens inline, documentos manuais. Algum dia: área/título obrigatórios e imagens inline. Recados só remove Inbox após envio confirmado. Não criar integração de Referência por inferência.
- `copyInboxAttachments` remove pageId/index/kind/url da origem. Destino tem novos IDs e marcador transitório `inboxSourceId` para resolver arquivo persistido. O servidor exige origem autenticada nas exclusões do mesmo delta, resolve por nome/URL atual, salva destino antes de arquivar origem e hidrata referências do destino. Nunca liberar GET de Inbox excluído para corrigir link.
- `moveInboxToPlanning`, `moveInboxToDiary`, `moveInboxToSomeday` atualizam coleções atomicamente no hook, com ensureLoaded/QR e IDs estáveis. Replay/falha parcial não duplica conteúdo. Não identificar tarefas/projetos pelo título; Compras mescla nomes conforme sua regra própria.
- Storage cifrado serializa Files em Inbox e destinos de base/next e nos attachments da raiz dos drafts de Recados. `stripFiles` remove bytes do payload; hidratação conserva edições em voo. QR não persiste drafts.
- Link preview: HTTPS público, validação DNS a cada redirecionamento, IP fixado, sem cookies/auth encaminhados, tempo/tamanho/cache limitados. Renderizar dados seguros, não HTML remoto; miniatura externa não é backup do site.

## Algum dia, áreas, biblioteca e pesquisa

- Someday privado: registros area/idea, `data.uid`, área referenciada por UID; Reference privado: category/material, catálogo independente. Estrutura Tipo/Dados no mesmo banco de cada coleção. Não trocar UID por nome ou ID de página.
- Algum dia abre gavetas só das áreas existentes; Mostrar todos ao lado de Gerenciar áreas, sem gaveta especial ou texto Abrir gaveta. Pesquisa global ignora gaveta/contexto/favoritos para localizar no acervo carregado, sem rede. Área é obrigatória para edição/favorito/promoção; legados sem área podem ser lidos sem migração automática.
- Ideia abre no painel amplo; não replicar ilustração da categoria no topo. Card externo usa primeira `ideaImage` resolvível na ordem do documento por nome estável, miniatura66px e texto; sem imagem, não reservar ícone/espaço. Manter ícones das gavetas e tag de área. Não estender esse layout a Referência sem pedido.
- Gerenciar áreas/contexto ficam juntos; nenhum rodapé Sem prazo. Voltar fecha editor antes da gaveta. Hold/draft intocado/upload e navegação devem ser preservados.
- Catálogo privado de áreas serve Algum dia e Projetos nos dois contextos. Projetos persistem nome em Área; ideias persistem UID. Renomear ajusta projetos e catálogo em um snapshot; ocultar preserva vínculos. `registerProjectAreas` só após planejamento pronto/configurado, IDs determinísticos e limite100; não reescrever projetos na importação.
- Promover ideia cria cópia confirmada de texto/anexos e mantém original. Atualizar URLs antes da cópia; destino antes de marcador na ideia. Não converter automaticamente o documento rico nessa integração sem pedido. Retentativas não duplicam destino; mudanças posteriores da origem não podem ser descartadas por replay.
- Diário pesquisa texto de todas as datas por termos sem acentos/caixa, com todos os termos, data e trecho destacado por offsets Unicode. Durante busca recolhe calendário; resultado abre leitura bloqueada, preserva consulta e retorno. Sem HTML de usuário/regex derivada da consulta ou consulta remota; não indexar bytes de anexos.

## Bem-estar, hábitos e alimentação

- Pressão permite múltiplas medidas/dia e média; peso/gordura permite uma por data. Histórico usa médias diárias, mantém toggles BPM/gordura e ocupa uma linha por gráfico; voltar restaura largura e fontes normais com ResizeObserver. Ponto dourado indica comentário em qualquer medida representada; cores das séries não mudam.
- Toggle da escala direita fica na linha do resumo, não em faixa exclusiva. Ocultar série/escala não bloqueia seu cadastro. Pontos permitem leitura/edição pelos fluxos existentes.
- Hábitos dentro de Bem-estar: ícone marca só hoje, resumo mensal corrige outros dias e pede confirmação para correções/exclusão. Encerrar/recuperar preserva histórico; anual é leitura e abre mês. Emoji sempre à esquerda do nome, inclusive legado; manter SVGs estruturais de pétalas/gráficos.
- Nutrition privado em um banco, tipos settings/day/entry/food e UID estável. Lançamentos guardam snapshot dos alimentos/receitas; editar catálogo não muda passado. Água, sono e exercícios são independentes de Bem-estar.
- kcal, ingredientes/peso pronto e porções seguem regras de `nutrition.js`; não intercambiar g/ml nem inventar calorias ausentes. Porção conhecida começa em1; demais100g/ml. Preferências próprias valem em nova seleção, não reescrevem lançamento em edição.
- Busca geral/ingredientes começa vazia, filtra TACO e salvos sem duplicar e recolhe ao limpar. Favoritos/receitas abrem todos, alfabéticos, sem consulta externa; guias limpam busca. OFF só busca explícita, com cache/limites e domínio de foto validado. Fotos externas não são copiadas ao Notion nesta versão.
- TACO local preserva IDs, nomes, valores, licença/procedência e ausentes. Qualidade: água10%, exercício20%, calorias na meta70%, multiplicado pela fração de kcal dentro; sem calorias não há nota, acima de70% boa adesão. Manter servidor consistente com cliente.
- Refeições fixas em ordem: café/almoço/lanche/jantar; ceia/outros com lançamentos. Desktop em linha; mobile retrato uma coluna, paisagem coarse até1400px duas colunas por linhas. Seleção/salvamento/limpeza recolhem detalhes, sem alterar lançamentos anteriores.

## Veículos

- Compartilhado, Pessoal fixo; carro/moto, cores/ícones Fluent Flat existentes, categorias e postos compartilhados. Não misturar cadastros ou reescrever texto histórico do posto ao alterar favorito.
- Dois cartões antes das tabelas: financeiro e consumo/combustível. Um mês compacto controla mês/ano, com Hoje e total acumulado discreto. Valores selecionam gráficos locais de consumo, custo/km, preço/litro, diário e anual; trocar veículo/reabrir restaura consumo, sem consultas adicionais.
- Abastecimento e despesa são painéis separados com nome do veículo; abastecimento sem categoria/prazo de manutenção, despesas sem Combustível. Ambas as tabelas começam com cinco registros; cálculos usam todo histórico antes de ordenar/limitar. Ordenação crescente/decrescente/padrão não persiste. Expandida soma filtro.
- Km posterior não pode ser menor; inserção histórica não pode ultrapassar eventos seguintes. Mesmo dia admite vários. `currentKm` usa maior km válido de cadastro/combustível/despesas; alertas não podem ignorar manutenção ou abastecimento recente.
- Mistura: uma parada, até20 componentes, somar valores/litros uma vez. Primeiro cheio estabelece referência; parciais até próximo cheio. Média geral ponderada por distância/litros de intervalos válidos. `missedPrevious` interrompe intervalo; cheio reinicia referência, parcial aguarda cheio. Última média fica ausente até novo intervalo válido; gasto/histórico e médias anteriores permanecem.
- `fuelEntryMetrics.distance` = diferença entre abastecimentos consecutivos por veículo e `orderedFuel`, inclusive parciais. Primeiro/ausente/inconsistente é nulo; zero válido. Não usar distância do fechamento entre cheios nem persistir coluna derivada.
- Serviço: km do evento + duração inteira positiva = nextKm; duração em Dados. Próxima data é independente; lembrete avulso usa km absoluta. Preservar legado sem base válida até edição. Manutenção near/overdue usa margem individual (padrão500km) ou30dias, ignora concluído/órfão e acende só SVG da aba em dourado por toda garagem, sem rede extra.
- Importação CSV aditiva, prévia/confirmação, ID estável por veículo/origem, lotes5 e retomada. Preservar misturas em componentes; não duplicar parada. Serviço pode ter valor zero/desconhecido, combustível exige litros/valor positivos. Estimativas/regras de planilha particular não viram regras gerais. Históricos pessoais ficam fora do código/GitHub.

## Demais áreas e catálogo gráfico

- Compras: ordem manual de listas/itens, novos e Inbox no início; check remove sem histórico. Busca nome OU conteúdo de qualquer item restante, sem acentos/caixa e sem mudar ordem/contexto.
- Finanças: centavos, categorias Entrada/Saída compartilhadas, aposentadoria preserva lançamentos, confirmações fora do mês e Sankey sem arraste. Aniversários: ano opcional, notes até5.000; aviso dourado hoje+seis dias, calculado localmente.
- Entretenimento mantém seções principais, filtros/status, avaliação/comentário/capas, resumo mensal/anual e data de conclusão obrigatória. Itens concluídos por data, demais por criação. Preserve créditos dos catálogos, especialmente TMDB.
- Recados: um envio por remetente/dia de Brasília, confirmação e leitura imutável após enviar. IdeaEditor rico sob demanda, catálogo completo, imagem colada pelo endpoint `/api/recados/image`; provas da própria conta, nomes únicos e no máximo100. Retry compara documento/texto/título/nomes; texto simples com imagem antiga continua legível. Draft rico/File cifrado nas sessões Google; QR só memória. Aviso substitui apenas ícone da marca enquanto recebido de hoje não lido.
- Catálogo único:359 Fluent3D +17 próprios art-3d-* (oito filamentos), com IDs antigos preservados. Busca por tema/cor/termos sem acentos e grade limitada. FOOD_ILLUSTRATIONS filtra alimentos. IdeaArt/FoodImage mantêm fallbacks, HabitIcon resolve aliases legados sem migrar dados.
- Assets Fluent preservam fontes/licenças; próprios WebP128 transparentes têm README/sources com hashes, sem atribuição indevida à Microsoft. Não gerar imagens ou usar serviço remoto em runtime. Carregamento adicional do catálogo somente ao clicar no seletor foi adiado; não implementar sem novo pedido.

## Android Captura

- Auxiliar exclusivo de criação de Inbox; não adicionar leitura/histórico de outras abas. Java/JDK17, minSdk26, compile/target35, WorkManager e Gradle fixados; applicationId estável, versão1.0.5/code6. Próximo APK usa assinatura igual e versionCode crescente; não enviar chaves/senhas/builds/caches ao código.
- Widget só ação e status (relógio/check/cinza), sem conteúdo; janela compacta multilinha com rascunho, transparência apenas do fundo e tamanho adaptável. Não simular EditText no RemoteViews nem consultar Notion para o relógio.
- Pareamento por sessão Google, código e aprovação; credencial90dias restrita à captura. Tokens nativos não são sessão web e QR não pareia dispositivos. API deriva dono da credencial, usa coordenação/manutenção e busca por ID exato, nunca snapshot completo.
- SQLite com bytes/texto cifrados no Keystore; guardar captura e limpar draft na mesma transação, preservar fila/proprietário na atualização/desconexão. WorkManager serial agrupa pedidos e garante sucessor quando chega captura ao final do worker. Tentativa manual não cancela envio em voo; pendente não significa requisição ativa.
- Recibo Redis técnico sem texto protege idempotência mesmo após conversão/exclusão. Só recusas explícitas de criação permitem retry; rede/5xx/resultado desconhecido continuam ambíguos, sem novo POST cego. `uploaded` preserva uploadId; check só com saved/ID confirmado.
- ClipboardEditText recebe URI/IME/receive-content de uma imagem, copia bytes enquanto autorizado e normaliza até1600px/512KB; limitar leitura8MB/40MP e API2MB/corpo3MB. Não persistir só URI temporária. Schema2/legado preservado; imagem+texto entram juntos no draft/fila.
- ShareCaptureActivity é a única exportada para ACTION_SEND text/plain e image/*, DEFAULT. Sem ACTION_VIEW, SEND_MULTIPLE ou permissões amplas. Revisão e confirmação antes de enviar; preservar draft existente, não substituir imagem/truncar texto, não baixar URLs e não reaplicar após recriação. QuickCaptureActivity permanece privada.

## Backup, verificação e entrega

- Backup da conta principal, bancos das duas contas, manutenção com TTL e cópias verificadas de propriedades/relações/bytes. Retenção3 só após nova cópia concluída. Não produzir backup parcial como completo; limitar arquivos20MB/blocos suportados/paginação. Upload comum continua4MB.
- Restauração exige confirmação e safety backup, copia para novos bancos e ativa só após verificar pelo roteamento Redis. Não apagar originais, limpar Redis, misturar conjuntos de bancos ou relaxar guarda para restaurar conjunto incompatível. Preserve identidade e relações; URLs de sites/fotos externas não equivalem a backup dos bytes.
- `npm test` para mudanças de regras/servidor/integração; `npm run build` para UI/Next. Testes CJS devem exercitar comportamento, não só espelhar texto do código. Não alegar teste de aparelho quando houve apenas doubles/build/Java host. Verifique layout quando houver ambiente disponível.
- Cobrir privacidade/compartilhamento, cadeados, formato legado, incrementos/drafts, falha parcial/replay, arquivos de destino após exclusão do Inbox e formatação isolada. Nova falha ou mudança justifica repetir checks; não ampliar indefinidamente após passarem sem nova causa.
- Entrega cumulativa em ZIP quando aplicável, código em `lifeos/`; importações privadas, se incluídas por autorização do usuário, ficam separadas em `Importacao/` e nunca são enviadas ao GitHub. Incluir `.env.example` sanitizado; excluir dependências, caches, ambientes reais, credenciais, APKs e assinatura. Verificar integridade e bytes alterados do pacote.
- Informar resultado, validação, alterações necessárias de schema/variáveis e limites materiais. Documentação sozinha não exige executar testes de produção ou rebuild de APK. Respeitar a confirmação por commit e a confirmação do provedor após deploy.
