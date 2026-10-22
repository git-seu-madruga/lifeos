# LifeOS — Guia de configuração e uso

Documento único da versão atual. Este README substitui os arquivos INSTRUCOES das entregas anteriores e deve ser atualizado nas próximas revisões, sem acumular orientações de versões antigas.

## Algum dia em gavetas por área

A primeira página mostra blocos visuais das áreas, com ilustrações, cores e contagens. Abra uma área para ver os cartões de ideias no formato já existente. O botão Mostrar todos, ao lado de Gerenciar áreas, reúne as ideias. A grade contém somente áreas cadastradas, sem card Todos nem inscrição Abrir gaveta. Gerenciar áreas continua usando o mesmo cadastro de Projetos. Áreas ocultas com ideias ainda podem ser consultadas, mas não recebem novas seleções.

A pesquisa é geral: ao digitar, aparecem diretamente as ideias encontradas em todas as áreas, contextos e favoritas, sem depender da gaveta aberta. Ao limpar a pesquisa, retorna a navegação anterior. Não são feitas consultas adicionais para trocar gavetas ou buscar nos dados carregados.

**Área obrigatória:** novas ideias precisam de uma área ativa. Em uma gaveta de área ativa, Nova ideia já a utiliza; na página inicial ou em Todos, você escolhe antes de abrir o editor. No Inbox, a área é escolhida antes de concluir a transformação, e cancelar mantém a entrada na origem. Título e demais linhas continuam indo para título/conteúdo. O servidor também rejeita salvamentos de ideias sem área.

As gavetas são somente as áreas cadastradas; Mostrar todos é um botão no cabeçalho. Não há gaveta de organização de ideias sem área. A área continua obrigatória para novos salvamentos; nenhum registro existente é excluído por esta alteração.

Não exige novos bancos, campos, variáveis ou APK. Publique o pacote cumulativo completo e recarregue o app.

## Ajustes compactos de Algum dia

No editor de ideias, Gerenciar áreas e a seleção de contexto ficam na mesma linha no desktop e no celular. Os cartões não mostram mais Sem prazo no rodapé; continuam mostrando anexos e Transformada quando aplicável. Não exige alterações no Notion, variáveis ou APK. O pacote inclui a integração anterior do Inbox.

## Correção e integração do Inbox com Algum dia

Corrigido o erro de aplicativo ao abrir uma entrada do Inbox em abas sem destino de conversão definido. Todas as consultas ao destino são protegidas, inclusive para abas futuras.

Na aba Algum dia, a entrada do Inbox pode ser transformada em ideia: primeira linha como título, demais linhas como conteúdo. A área é escolhida antes de concluir; a ideia abre para completar os outros detalhes. Não exige banco/campo novo, variável adicional ou atualização do APK se Algum dia já estiver configurado. Publique este pacote completo e recarregue o app. As melhorias anteriores de alimentação, emojis e Bem-estar estão incluídas.

## Catálogo ampliado de ilustrações

359 ilustrações Microsoft Fluent Emoji 3D, organizadas por viagens e lugares, videogames e lazer, esportes e academia, água e clima, frutas e vegetais, refeições, doces e bebidas, natureza e animais, trabalho e organização, informática e tecnologia, saúde, casa, estudos e criação. A seleção oferece busca em português (sem exigir acentos), filtro por tema e identificação da escolha atual.

- **Algum dia e cadastro de áreas de Projetos/Algum dia:** 369 opções, incluindo as 10 anteriores.
- **Acompanhamento/alimentação:** 122 opções para alimentos e receitas, incluindo as 21 anteriores e 101 novas.
- **Hábitos/Bem-estar:** 359 opções de emojis. Os 16 códigos de ícones antigos continuam válidos nos dados e passam a mostrar o emoji correspondente, sem regravar hábitos. O seletor oferece somente o pacote ilustrativo.

As opções já salvas e o histórico permanecem. As ilustrações novas são arquivos WebP locais, com transparência, até 128 × 128 px e carregamento sob demanda do navegador; o catálogo não consulta serviços externos nem ocupa o banco do Notion. Licença e origem dos arquivos estão em public/emoji/fluent-expanded/. Nenhuma assinatura ou integração adicional.

Para atualizar, envie o pacote completo e faça o deploy, incluindo os novos arquivos de public/emoji/. Não há alteração de bancos/campos do Notion, variáveis, APK ou necessidade de reimportar dados. O editor amplo e o catálogo integrado de áreas da entrega anterior estão incluídos. O Inbox também permite transformar uma entrada em ideia na aba Algum dia.

## Alimentação no celular em paisagem e Bem-estar

Em celulares na horizontal (paisagem, tela de toque até 1400 px), os cartões de refeições ficam em duas colunas, seguindo a ordem Café da manhã, Almoço, Lanche e Jantar. Ceia/Outros continuam aparecendo quando houver registros e seguem para as próximas linhas. No celular em retrato permanece uma coluna; desktop conserva sua linha de cartões.

Hábitos, pétalas e seus detalhes passam a usar emojis locais do pacote no lugar dos ícones lineares. Ícones antigos são traduzidos visualmente para o emoji mais próximo, sem regravar dados ou perder marcações. O emoji fica sempre à esquerda do nome do hábito nos cartões, na prévia e no resumo; a confirmação diária permanece à direita nos cartões de Bem-estar. As pétalas preservam seus rótulos, cores e ações.

Esta revisão acrescenta 104 ilustrações ao pacote anterior: água, chuva, nuvens, esportistas, musculação, meditação, informática, trabalho, natureza e saúde. As figuras de tênis, badminton, tênis de mesa e lacrosse incluem busca por raquetes e bolas; os esportes de bola e a academia têm termos adicionais de busca.

## Conclusão de projetos

Ao mudar um projeto para **Concluído**, se houver tarefas ou marcos abertos, o app informa as quantidades e pede confirmação. Cancelar mantém tudo como estava. Confirmar conclui também todas as tarefas e marcos vinculados, preservando o histórico, anexos, responsáveis e datas dos itens já concluídos. Isso inclui pendências criadas em outra instância desde a última atualização. Reabrir o projeto não reabre seus itens automaticamente.

A sincronização grava os itens vinculados antes de concluir um projeto existente. Em caso de erro, aguarde ou retome a sincronização até aparecer **Salvo no Notion**. Não são necessários novos campos, bancos ou variáveis para esta alteração.

## 1. Atualizar uma instalação existente

1. Aguarde **Salvo no Notion** antes de atualizar. Se houver erro de salvamento, preserve o texto e resolva o erro primeiro.
2. Extraia o ZIP. Envie o **conteúdo da pasta lifeos** para a raiz do repositório, substituindo os arquivos existentes. Não crie uma segunda pasta lifeos dentro do projeto.
3. Mantenha as variáveis e os bancos já configurados. O login por QR Code usa o mesmo Google, Vercel e Upstash: não exige novos bancos, chaves ou callbacks. Caso ainda não tenha configurado Bem-estar e Ciclo da Letícia, siga a seção Bem-estar antes de usar esses cartões.
4. Faça o deploy na Vercel e atualize a página/app instalado.
5. Para habilitar **Algum dia**, crie o banco e a variável descritos na seção **Algum dia — configuração** abaixo. Para Acompanhamento, siga a seção correspondente ao final deste guia. Os bancos existentes continuam com os mesmos campos; as áreas de Projetos passam a usar o catálogo de Algum dia.
6. Remova do repositório os antigos arquivos INSTRUCOES-*.md: o envio pelo navegador não remove arquivos que deixaram de existir no ZIP. Todas as instruções atuais estão aqui.

Para enviar mais de 100 arquivos pelo navegador do GitHub, crie uma branch, envie em lotes e faça merge apenas quando todos os arquivos estiverem presentes. Isso evita publicar uma versão parcial em produção. Git/GitHub Desktop também permitem enviar o projeto completo.

Não envie node_modules, .next, arquivos com credenciais reais ou variáveis de ambiente locais. O arquivo .env.example é apenas um modelo sem segredos.

### Mudanças desta revisão

- **Editor amplo e áreas integradas**: Nova ideia e edição de ideias ocupam a largura de conteúdo, como o editor de Projetos, com espaço maior para as anotações. Projetos e Algum dia usam o mesmo catálogo de áreas, acessível em **Gerenciar áreas** nas duas telas. Os botões de sugestões/importação foram removidos. **Não exige alterações adicionais no Notion, variáveis ou APK** se Algum dia já estiver configurado.

- **Algum dia**: nova aba privada de ideias, áreas de interesse, favoritos, cartões ilustrados, cores e editor rico com imagens e prévias de links. Exige apenas um novo banco e `NOTION_SOMEDAY_DATABASE_ID`. As novas ilustrações e o editor são um piloto exclusivo desta aba; o Inbox permite transformar uma entrada em ideia dentro desta aba. O APK Captura permanece na versão atual.

- Favoritos e Minhas receitas mostram todos os itens salvos ao abrir, em ordem alfabética. Digitar filtra; limpar mostra todos novamente. Trocar de guia limpa a busca anterior. A busca geral e ingredientes continuam vazios antes da digitação. Sem consulta externa para listar favoritos/receitas.

- Alimentação do dia mostra Café da manhã, Almoço, Lanche e Jantar mesmo vazios. Ceia/Outros aparecem quando houver lançamentos, na ordem da lista. Desktop acomoda todos os cartões em uma única linha, ajustando larguras e cabeçalhos; mobile mantém uma coluna. Sem mudanças de dados ou configuração.

- Ao selecionar um alimento com peso/volume de porção cadastrado, o lançamento começa com quantidade **1** e unidade **Porção**. Alimentos sem porção continuam com 100 g/ml. A preferência pessoal de porção também vale ao selecionar o mesmo produto em nova busca online. Edições de lançamentos mantêm a quantidade originalmente registrada.

- Nos cartões de pressão/BPM e peso/gordura, o toggle da escala direita fica na mesma linha dos valores, eliminando a linha exclusiva do botão. Cálculos, seleção de pontos, edição e registro de BPM/gordura permanecem como antes. Sem novos campos ou variáveis.

- Busca de alimentos/ingredientes começa vazia e mostra resultados locais ao digitar; limpar o texto recolhe a lista. Navegações com calendário seguem seta esquerda → campo → seta direita → calendário → Hoje. Ajustado também o campo digitado de mês no resumo de Acompanhamento. Backup do catálogo utilizado está em Importacao/TACO (JSON exato, CSV para consulta e procedência). Esses ajustes de busca e calendário não exigem novos bancos ou variáveis.

- Abas principais compactas: inativas mostram somente o ícone; a selecionada mostra o nome com transição breve. No mobile, Ordenar abas revela todos os nomes e Concluir volta à apresentação compacta. Aviso COMPARTILHADO aparece com o nome e continua no rótulo acessível dos ícones. Essa apresentação compacta não exige mudanças de bancos ou variáveis.

- Nova aba **Acompanhamento**, privada por usuário e com Pessoal fixo. Registro em kcal, busca TACO local, busca de produtos Open Food Facts, favoritos, alimentos próprios, receitas com cálculo por ingredientes, ilustrações e resumos por mês/ano. Água, sono, aeróbico e musculação possuem registros independentes de Bem-estar. Exige apenas o novo banco Acompanhamento e NOTION_NUTRITION_DATABASE_ID.

- Concluir projeto com tarefas ou marcos abertos pede confirmação e conclui os itens vinculados, preservando histórico e datas de conclusões anteriores. A sincronização inclui pendências remotas recentes e grava os filhos antes de concluir o projeto existente.

- Painéis de abastecimento/despesa identificam o veículo no título. Abastecimento não mostra categoria nem prazo de manutenção e mantém Observação. Despesas não oferecem Combustível como categoria; os fluxos são separados pelos botões próprios.

- Novo abastecimento abre no mesmo painel de Nova despesa, sem formulário abaixo da tabela. Campos de combustíveis mistos, posto/favoritos, tanque cheio e interrupção de média preservados.

- Os valores dos cartões de Veículos selecionam o gráfico: consumo (padrão), custo/km, preço/litro, combustível/despesas por dia do mês e totais anuais de todo o histórico. Gráficos calculados com os dados já carregados, sem novas consultas ao Notion.

- Dois cartões de resumo em Veículos: despesas por período e consumo/combustível. O segundo reúne última média, média geral, custo/km e preço por litro do abastecimento mais recente (média ponderada para misturas). Orientações de desenvolvimento registradas em AGENTS.md.

- Serviços usam **Duração da manutenção (km)**: km do evento + duração gera o lembrete automaticamente. A tabela mostra km do evento. Valor das despesas e Valor/Preço por litro/Consumo dos abastecimentos têm ordenação crescente, decrescente e padrão, sem persistência entre abas ou reaberturas. Alertas de odômetro indicam data e km conflitantes antes de salvar.

- Seletor de período no cartão de despesas compacto e centralizado, com campo MM/AAAA e calendário de mês/ano no mesmo padrão de Hábitos e Recados.

- Um único seletor MM/AAAA no resumo de Veículos controla combustível no mês/ano e despesas no mês/ano. O ano vem do mês selecionado; Hoje restaura o período atual. Acumulados mantidos em linha discreta, sem avisos de registros fora da soma.

- Abastecimentos aparecem somente na região própria. O cartão de despesas mostra mês e ano navegáveis, com Hoje, e um rodapé discreto com despesas + combustível = total acumulado. Ao expandir o histórico, a tabela soma os valores da categoria selecionada no rodapé.

- Veículos não tem mais seletor de mês: despesas e serviços exibem os cinco registros mais recentes de todo o histórico, com **Ver todos** e **Mostrar recentes**. O cartão financeiro permite consultar as despesas do mês e do ano, com o total global discreto no rodapé. Filtros de categoria preservados.

- Importador de Veículos ampliado para **Manutenções e outras despesas**, com modelo CSV próprio. Serviços podem ter valor zero ou não informado, sem transformar ausência de valor em gasto. Categorias são compartilhadas por todos os veículos. Histórico do carro preparado conforme as regras aprovadas, com estimativas documentadas.

- A lista de abastecimentos inclui **Preço/litro** e **Consumo (km/L)**, calculados automaticamente para todo o histórico existente, inclusive o importado. Não é preciso reimportar ou modificar o Notion.

- **Importação de abastecimentos por CSV LifeOS**, com prévia, confirmação, controle de duplicações, lotes de cinco e retomada. Marcação **Abastecimento anterior não registrado** disponível na criação e edição; interrompe o intervalo incompleto sem apagar o histórico. Nenhuma alteração de banco ou variável é necessária.

- Abastecimentos têm campo de posto com texto livre, escolha de favoritos e gerenciamento de cadastros compartilhados. Cadastro do veículo inclui ano, que também aparece no bloco da garagem. Nenhum campo ou banco adicional no Notion.

- Abastecimentos agora aceitam Etanol e Gasolina em várias linhas, com litros e valor por linha. Etanol é o padrão em carros; Gasolina em motos. Cada abastecimento tem uma só data, km e marcação de tanque cheio, usando os totais de todas as linhas para despesas e consumo.

- Cadastro de veículos simplificado: apenas tipo Carro/Motocicleta; escolha do emoji pelas setas à esquerda e à direita da imagem, sem lista de modelos. Paleta de cores mantida.

- Ilustrações dos veículos substituídas por **Microsoft Fluent Emoji (Flat)**, incluídos no app. As cores da carroceria continuam personalizáveis.

- Veículos agora é compartilhada entre as duas contas, com aviso na aba, identificação da última edição e contexto Pessoal fixo. Não exige outro banco nem nova variável além de NOTION_VEHICLES_DATABASE_ID já indicada para a nova aba.

- Nova aba **Veículos**: carros/motos ilustrados com modelos e cores, abastecimentos, médias de consumo, categorias de despesas e lembretes por km/data. Um banco adicional: siga a seção Veículos abaixo. Dados compartilhados entre as duas contas, apenas no contexto Pessoal.

- Corrigido o texto de autorização no celular: duração de 1 hora, bloqueio após 10 minutos e desbloqueio pelo código original, sem extensão do prazo.

- Sessão por QR: até 1 hora, com bloqueio após 10 minutos sem interação e desbloqueio pelo código original apenas no navegador autorizado. Cinco erros seguidos encerram a sessão. O limite de 1 hora nunca é renovado.

- Peso/% gordura aceita apenas um registro por data, por usuário. Para corrigir, edite pelo gráfico ou histórico. Pressão mantém várias medições por dia e suas médias.
- Cada gráfico tem um toggle discreto BPM/% gordura: oculta ou mostra a série e escala da direita, ajustando os limites e a largura aos dados visíveis. Não altera nem exclui dados. O toggle não exige novos campos, bancos ou variáveis.

- Links externos solicitam nova aba. No PWA instalado em Android, links HTTP/HTTPS sem fragmento tentam abrir o Chrome por um Android Intent, com endereço original como fallback. Links que chegam ao PWA usam launch_handler navigate-new onde suportado, preservando uma janela já aberta para edição. A decisão de capturar links continua sendo do navegador/sistema.

- Login alternativo por QR Code, com aprovação explícita no celular conectado pelo Google, comparação de código nas duas telas e sessão temporária no computador. O menu da conta Google permite consultar e desconectar computadores autorizados.
- QR de uso único com validade de dois minutos; sessão desktop de até 1 hora e bloqueio após dez minutos sem interação. O computador não grava rascunhos comuns ou de Recados no IndexedDB nesse modo. Os logins Google existentes mantêm seu funcionamento.
- Inclui as melhorias anteriores de Bem-estar: nove pétalas, cartão central de escolhas no mobile/desktop, vários locais de dor e edição de pressão/peso a partir dos pontos do gráfico. Clicar fora do ponto restaura Ver histórico.
- Hábitos continuam dentro de Bem-estar com as mesmas marcações e resumos. O ciclo da Letícia permanece editável pelas duas contas nesta fase.
- Mantém projetos/tarefas compartilhados, responsáveis obrigatórios por tarefa, exclusão de projeto com seus marcos e tarefas, sincronização incremental e demais funcionalidades já configuradas.

## 2. Contas, privacidade e contextos

| Área | Acesso |
| --- | --- |
| Inbox, Diário, Hábitos e registros, Bem-estar (dia e medidas), Entretenimento | Privado de cada conta |
| Projetos, Marcos e Tarefas | Privado por padrão; compartilhamento opcional entre as duas contas |
| Acompanhamento (alimentação, rotina, metas, favoritos e receitas) | Privado por usuário |
| Algum dia (ideias, referências e áreas de interesse) | Privado por usuário; contextos Pessoal e Trabalho |
| Compras, Aniversários, Finanças, Veículos | Compartilhado entre as duas contas |
| Ciclo da Letícia | Dados sempre dela; ambos podem ver e editar nesta versão de testes |
| Recados | Mensagens entre as duas contas, com leitura confirmada pelo destinatário |
| Backup e restauração | Apenas a conta principal; inclui dados das duas contas |

Contas autorizadas: **periclesbernardes@gmail.com** e **leticiacost3@gmail.com**. Os dados privados antigos sem proprietário pertencem à primeira conta.

Pessoal/Trabalho é uma classificação, não separação de usuário. Projetos, Tarefas e Compras têm ambos os contextos. Diário, Finanças, Aniversários, Bem-estar (incluindo Hábitos), Entretenimento, Recados e Veículos usam Pessoal fixo, com Todos e Trabalho bloqueados.

A separação é aplicada pelo servidor do LifeOS. Quem tiver acesso direto aos bancos completos no Notion terá o acesso concedido pelo próprio Notion. Compras, Finanças e Aniversários mostram nome e horário da última edição feita pelo app; edições diretas no Notion não identificam a conta Google.

### Entrar no computador com QR Code

1. Abra o endereço oficial do LifeOS no computador e selecione **Entrar com QR Code**.
2. Leia o QR com a câmera do celular. A página de aprovação usa somente o domínio configurado em LIFEOS_APP_URL. O QR é gerado pelo próprio servidor, sem serviço externo de imagens.
3. O navegador que abriu o link deve ter uma sessão Google válida do LifeOS. Se a câmera abrir um navegador diferente do PWA instalado, a sessão pode não ser compartilhada: entre pelo Google **somente no celular** nessa página e continue. As duas contas autorizadas continuam sendo as únicas aceitas.
4. Confira o código de seis dígitos nas duas telas e toque **Autorizar este computador**. Recusar não dá acesso. Leia apenas o QR exibido no computador que está usando.
5. O desktop entra automaticamente como quem aprovou, preservando as regras de acesso privadas e compartilhadas. Sessões QR não podem autorizar outros computadores nem gerenciar sessões de outras contas.
6. Guarde o código de seis números mostrado junto ao QR Code. A sessão dura até 1 hora a partir da autorização no celular, sem renovação. Após dez minutos sem interação, o conteúdo fica oculto e as APIs bloqueadas. Digite esse código para desbloquear somente neste navegador autorizado; ele sozinho não abre uma sessão em outro navegador/computador. O desbloqueio reinicia a inatividade, mas não estende a hora. Cinco códigos incorretos seguidos encerram a sessão e exigem nova autorização pelo celular. Recarregar o app não elimina o bloqueio nem aumenta a validade. O QR expira em dois minutos e não pode ser reutilizado. Sessões antigas, emitidas antes desta revisão, mantêm o prazo anterior e precisam de nova autorização se forem bloqueadas, pois não têm código de desbloqueio registrado.
7. Enquanto bloqueado, os formulários já abertos e textos pendentes ficam na memória da aba, sem persistência neste computador. Ao desbloquear, o salvamento pode continuar. Fechar/recarregar a aba ou expirar a hora pode perder o que ainda não foi salvo; aguarde **Salvo no Notion** antes de se afastar. Sessões bloqueadas continuam na lista **Computadores autorizados** para revogação pelo celular.
7. No celular com login Google, abra seu nome → **Computadores autorizados** → **Desconectar**. A revogação bloqueia imediatamente novas requisições ao servidor; uma operação já em andamento pode terminar. A tela visível do computador verifica a sessão em até um minuto. Ao retornar do segundo plano, ela também verifica a validade.
8. No computador, use **Sair** ao terminar. O cookie temporário não possui persistência programada, mas não confie apenas em fechar o navegador, pois ele pode restaurar sessões.

**Rascunhos no computador público:** as edições e rascunhos de Recados ficam somente na memória da página, sem ler/importar rascunhos antigos do dispositivo e sem gravar novos rascunhos no IndexedDB. Espere a confirmação **Salvo no Notion** antes de fechar, atualizar ou deixar a sessão expirar; alterações ainda pendentes poderão ser perdidas. Os rascunhos criptografados das sessões Google normais permanecem como antes. Downloads de anexos ou capturas da tela não são apagados pelo app. O QR evita entrar na conta Google no desktop, mas não protege contra um computador comprometido.

As verificações periódicas de sessão são leves: consultam sessão/Redis, sem reler bancos do Notion. Não há consultas periódicas dessas sessões em segundo plano. O prazo absoluto continua válido mesmo com o aplicativo escondido.

## 3. Uso diário

### Navegação e datas

No desktop, arraste as abas para ordenar; a primeira é a tela inicial. A preferência fica no navegador/dispositivo, não é sincronizada por usuário. As abas inativas mostram apenas o ícone, e somente a selecionada exibe o nome, com animação breve. No desktop, passar o mouse também informa o nome. No celular, Ordenar abas revela todos os nomes. Toque na aba que deseja mover (ela fica destacada), deslize livremente a barra se necessário e toque na aba antes da qual ela deve entrar. Toque novamente na selecionada para desmarcar. Repita para outras mudanças; confirme no ✓ para voltar aos ícones compactos na nova ordem. Arrastar no celular apenas rola a barra, inclusive durante a ordenação. A rolagem horizontal sem barra aparente continua disponível quando necessária. A indicação COMPARTILHADO acompanha o nome nas abas compartilhadas. O menu da conta contém **Sair** e, para Péricles, **Backup e restauração**.

Nas barras de navegação com calendário, a ordem é **seta esquerda, campo digitável, seta direita, calendário e Hoje**. Campos de formulário mantêm o calendário ao lado da digitação.

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

Projetos e tarefas novos usam Pessoal por padrão em Todos; Trabalho selecionado explicitamente e contexto herdado de projeto são respeitados. Pessoal aparece primeiro nos campos de contexto. Projetos abrem a partir de blocos. O título recebe foco ao criar; entradas novas sem nenhuma alteração são descartadas ao fechar. Projetos têm status Ativo, Pausado, Concluído e Cancelado, exclusão com confirmação (remove também todas as tarefas e marcos, inclusive concluídos), anexos e marcos. Cancelado e Concluído mantêm o histórico. O prazo de um marco não pode ultrapassar o prazo final do projeto, quando definido; o marco é referência de cronograma e não gera indicador de atraso.

Tarefas têm Não iniciada, Em andamento, On hold e Concluída, prioridade, datas, projeto/marco opcionais, anotações e anexos. Não há status Cancelada nem páginas relacionadas. Os resumos acompanham os filtros e a busca; os contornos indicam os grupos exibidos. Tarefas concluídas recentes aparecem primeiro. Exclusões não têm histórico no LifeOS; a remoção de páginas é feita pela lixeira do Notion.

### Diário

Uma entrada por dia e usuário. Navegue pelo calendário, setas ou campo de data. Selecionar uma data no campo/calendário abre aquele dia. Entradas existentes são abertas para leitura: use Editar para desbloquear. Ao sair ou trocar o dia, voltam a ficar bloqueadas. Texto aceita múltiplas linhas e formatação simples; pode incluir anexos. Apagar todo o texto sem manter anexos faz o dia voltar ao estado vazio, sem marcador. Uma entrada com anexos ainda tem conteúdo.

### Finanças

Cadastre categorias de Entrada e Saída; elas aparecem em colunas separadas e ordem alfabética. Cada lançamento usa uma categoria, data completa, valor em R$ e observação opcional. O valor ganha duas casas decimais ao sair do campo. O gráfico de fluxo permite abrir a edição pelo nome, sem arraste das barras.

Filtre pelo mês, ano ou intervalo DD/MM/AAAA. Hoje volta ao mês atual. Saldo restante é calculado automaticamente à direita; déficit aparece à esquerda em vermelho e com valor negativo. Não é uma categoria cadastrada. Renomear categorias mantém o vínculo dos lançamentos. Retirar oculta a categoria das opções para novos lançamentos, mantendo registros e totais históricos; Mostrar categorias inativas permite reativar. Recriar o mesmo nome e tipo reativa a original após confirmação. O editor de um lançamento antigo permite manter sua categoria inativa. Criar/editar fora do mês atual pede confirmação, considerando também a data original ao mover um lançamento. Exclusões individuais sempre pedem confirmação, com aviso adicional fora do mês atual.

### Aniversários

Cadastre nome, dia e mês; ano de nascimento é opcional. Com ano conhecido, o resumo informa a idade que a pessoa fará; sem ano, mostra apenas o aniversário. Há busca e destaques da semana/mês. O cadastro inclui Observações, com múltiplas linhas (até 5.000 caracteres), exibidas discretamente abaixo do nome na lista de contatos, com links clicáveis. A informação é compartilhada entre as duas contas e pode ser editada ou apagada. A coluna Observações (Texto) é adicionada automaticamente ao banco existente na primeira conexão após o deploy; não precisa criar outro banco ou variável. Não complete um ano desconhecido com o ano atual.

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

Em sessões Google, texto e título do rascunho são guardados localmente por usuário quando o armazenamento está disponível; em sessões QR temporárias ficam somente na memória; a imagem não enviada precisa ser selecionada de novo após recarregar. Aguarde a confirmação de salvamento antes de fechar.

## 4. Salvamento, sincronização e app instalado

As edições comuns são salvas automaticamente. O botão Atualizar relê o Notion; não é obrigatório clicar para cada edição. Envio/leitura de Recados usa salvamento imediato. O horário no cabeçalho indica a última leitura bem-sucedida dos dados, enquanto Salvo no Notion indica a gravação.

Durante o salvamento, o app envia apenas os registros envolvidos, suas versões anteriores para detectar conflitos e as dependências necessárias (por exemplo, o projeto e seus marcos de uma tarefa). Imagens e arquivos já enviados não são reenviados. O servidor usa leitura por ID e consultas filtradas, sem varrer bancos inteiros a cada edição. Novas entradas de Diário e marcações de Hábitos consultam a data envolvida para preservar a unicidade e recuperar falhas parciais.

### Conclusão/cancelamento de projetos e recuperação de tarefas pendentes

Nas tarefas em aberto, o status mantém precedência. Dentro do mesmo status e data, as mais antigas aparecem primeiro e as novas ficam abaixo, no quadro de Tarefas e dentro dos projetos/marcos. Em On hold, a data considerada é a de cobrança. Os seletores explícitos de prioridade/nome continuam funcionando. Concluídas mantêm a conclusão mais recente primeiro; Compras mantém sua ordenação própria. A criação é recuperada dos identificadores LifeOS existentes ou da data original do Notion, sem campo novo, alteração em massa ou reimportação.

Marcar um projeto como **Concluído** ou **Cancelado** com tarefas ou marcos abertos exige confirmação e conclui esses filhos antes de salvar o status final do projeto. Ao cancelar a confirmação, nada é alterado. O projeto cancelado permanece em Cancelados, com o histórico preservado; as tarefas vinculadas ficam concluídas e os marcos marcados como concluídos. Tarefas/marcos adicionados em outra instância também entram nesse processamento. Reabrir o projeto não reabre seus filhos.

Uma nova tentativa após falha parcial preserva a data das tarefas já concluídas, inclusive quando a interface ainda contém a versão anterior da data. O salvamento devolve ao app o status e a data efetivamente confirmados pelo Notion, sem baixar novamente a coleção. Reabrir uma tarefa ou alterar seu texto enquanto o envio ocorre continua sendo preservado.

O campo técnico **Concluída em** aceita a representação retornada com segundos/milissegundos truncados, sem tratar isso como uma edição concorrente. Datas realmente diferentes e conflitos em outros campos continuam protegidos.

Se uma versão anterior parou com **O campo “Concluída em” foi alterado no Notion** depois de concluir um projeto: publique esta correção, recarregue a página/app para carregar o novo código e toque em **Tentar salvar novamente**, se ainda aparecer pendência. Mantenha o mesmo navegador/perfil e a conta original para recuperar o rascunho. Não escolha descartar alterações nem limpe os dados do navegador para resolver esse caso. A correção não exige editar o banco do Notion, mudar variáveis da Vercel, reimportar dados ou atualizar o APK Captura.

A carga inicial e o botão Atualizar continuam lendo os dados necessários à visão geral. Esta revisão não implementa paginação das telas nem leitura incremental no retorno ao foco; essas leituras gerais ainda podem crescer com o acervo. Clientes antigos permanecem compatíveis com o servidor, mas só passam a enviar dados reduzidos depois de atualizar a página/app.

Ao voltar para uma aba do navegador ou app em segundo plano, o LifeOS consulta os dados em primeiro plano, com intervalo mínimo entre verificações. Não faz consultas periódicas comuns enquanto está escondido. Formulários abertos, edições pendentes ou salvamentos em andamento adiam a substituição dos dados para preservar texto local. Uma consulta em andamento não sobrescreve edições feitas durante ela.

Não há tela inicial de carregamento a cada retorno: a interface permanece montada e o indicador Atualizar mostra atividade. Se ocorrer conflito, preserve seu texto e revise a atualização; descarte de alterações pendentes exige confirmação. Rascunho local não substitui a confirmação de salvamento: o sistema pode suspender o aplicativo ao trocar de app.

O PWA usa **standalone**, não fullscreen, para evitar o flickering observado no Android. Instale pelo menu do Chrome ou, no Safari/iPhone, Compartilhar → Adicionar à Tela de Início. As abas deslizam horizontalmente. Voltar fecha primeiro o painel aberto; nas abas principais, dois toques permitem sair onde o navegador/sistema suporta esse fluxo. Login Google abre uma janela separada e a sessão é reconhecida ao concluir.

### Links no app instalado — versão de teste

- Links externos clicados no LifeOS solicitam nova aba/janela, com proteção contra acesso à janela original. No Android instalado, tentamos abrir o Chrome diretamente via Android Intent em um toque normal. Há fallback para o endereço web quando a abertura não é permitida ou o Chrome não está disponível.
- Links com fragmento (#), downloads, cliques com teclas modificadoras e links internos permanecem nativos. Anexos que passam pela rota autenticada do LifeOS não são desviados para um Intent; o navegador continua decidindo como abrir o arquivo. Login Google mantém sua janela própria.
- No iPhone/iPad, a abertura externa é solicitada ao navegador; o PWA não pode impor que seja o Chrome nem garantir que não apareça uma visualização interna.
- O manifest passa a declarar launch_handler com navigate-new. Onde houver suporte e associação de links, um link do LifeOS pode abrir no app instalado sem substituir uma janela já em edição. Esse membro controla como lançar o PWA, mas não força a associação de links. O comportamento após leitura pela câmera ainda depende do Android/iOS e do navegador. Não usamos campos de captura obsoletos nem associações nativas inventadas.
- Depois do deploy, abra o LifeOS instalado para atualizar. Metadados do PWA podem levar tempo para ser atualizados pelo navegador. Caso a mudança não seja percebida, aguarde e teste novamente. Uma reinstalação pode atualizar o manifest, mas só a faça após confirmar que todas as alterações estão salvas no Notion.
- Teste abrindo um link de comentário/projeto no Android, voltando ao LifeOS, e lendo o QR de login com a câmera. Confira também o comportamento no iPhone. Se um link voltar a abrir internamente, isso pode ser uma limitação do dispositivo, mesmo com a solicitação correta do app.

Referências técnicas: [Android Intents](https://developer.chrome.com/docs/android/intents), [navegação em PWAs](https://developer.chrome.com/docs/capabilities/pwa-navigation-management) e [launch_handler](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/launch_handler).

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

#### Importar o histórico do carro

Na pasta **Importacao**, fora de `lifeos`, estão `abastecimentos-carro.csv`, `despesas-carro.csv` e os dois modelos vazios. Não envie seus CSVs ao GitHub; use-os no painel de importação depois do deploy. O arquivo da motocicleta também continua disponível para quem ainda não o importou. Não é necessário repetir importações já concluídas.

1. Atualize o aplicativo enviando somente o conteúdo de `lifeos` ao repositório. Não é necessário criar campos, bancos ou variáveis no Notion/Vercel.
2. Em **Veículos**, selecione o carro correto. Se ainda não existe, cadastre-o primeiro; nome, placa, ano, cor e ícone não são substituídos pelos CSVs. O campo veiculo no CSV é apenas informação para conferência. Nenhum ano foi presumido para o carro.
3. Clique **Importar CSV**, escolha **Abastecimentos** e carregue `abastecimentos-carro.csv`. Sem duplicatas já existentes, confira **60 abastecimentos**, **2.101,256 L**, **R$ 8.729,82**, **56 cheios**, **4 parciais** e **10 mistos**. O combustível já está identificado nos componentes; não é necessário atribuir um tipo único ao lote.
4. Confirme a importação e aguarde a conclusão com o app em primeiro plano. Mais de um abastecimento no mesmo dia foi preservado quando a quilometragem era diferente. Gasolina e etanol consecutivos da mesma data e km foram agrupados em uma parada, mantendo litros e valores em linhas distintas dentro dela.
5. Reabra o importador e escolha **Manutenções e outras despesas**. Carregue `despesas-carro.csv`: **47 registros**, sendo **42 com valor positivo**, **3 com custo zero** e **2 sem valor informado**. Total conhecido: **R$ 6.223,57**. Confirme e aguarde o salvamento.
6. Em caso de interrupção, retome com o mesmo arquivo e veículo. Não modifique id_origem: registros já importados são ignorados, sem sobrescrever alterações posteriores. Duplicatas prováveis de despesas são reconhecidas por data, descrição, valor e km; só as inclua após conferência.

**Tratamento aplicado à planilha do carro**

- Entradas de compra foram excluídas: sinal de R$ 300,00 e restante de R$ 14.300,00. Não foi criada categoria Compra.
- Manutenção usa a categoria global `maintenance`; Pedágio usa `toll`; Documentação, taxas, licenciamento e IPVA usam `tax` (Impostos). Esses identificadores são os mesmos usados pela motocicleta. Se uma categoria foi renomeada no app, seu nome atual será exibido, conservando o significado e os lançamentos dos dois veículos. A categoria original fica identificada nas observações das despesas.
- Tanque cheio foi definido nesta conversão pela regra aprovada **volume combinado > 18 L**. Volume igual ou inferior a 18 L foi marcado parcial. A regra foi aplicada ao arquivo do carro, não a novos lançamentos manuais nem ao histórico da motocicleta. A anotação original de 20/04/2025 dizia parcial, mas o volume de 31,550 L foi classificado como cheio conforme a nova regra, com explicação nas observações.
- Em 30/05/2025, o volume ausente foi estimado em **30,851 L**, dividindo R$ 113,84 por **R$ 3,69/L**, preço do etanol no abastecimento anterior de 27/05/2025. Usou-se o preço do etanol, e não o preço médio da mistura com gasolina.
- Em 19/12/2025, o odômetro ausente foi estimado em **203.546 km**: odômetro anterior 203.260 km + 20 L × **14,3 km/L**, consumo do último intervalo completo válido recalculado sob a regra aprovada. A distância estimada é de 286 km. A observação registra que o odômetro é estimado.
- As manutenções de 05/11/2025 e 07/11/2025 foram ajustadas de 202.753 para **203.000 km**, conforme solicitado, preservando a informação original nas observações.
- O registro de 11/04/2026 já era estimado na origem. Foi mantido com seu gasto e marcado como interrupção; o tanque cheio de 09/05/2026 também reinicia a referência. Assim os intervalos de entrada e saída do registro estimado não compõem as médias. Os demais intervalos válidos continuam no cálculo.
- Preços anunciados e valores pagos divergentes não foram forçados a coincidir. Valores e litros existentes foram preservados. As colunas Preço/litro e Consumo (km/L) são recalculadas pelo LifeOS.
- Observações, postos identificados e texto original dos componentes foram mantidos. Três serviços com custo zero continuam R$ 0,00. Dois com “–” na origem ficam **Sem valor informado**; não são apresentados como gratuitos. Os totais monetários somam apenas os valores conhecidos, sem avisos adicionais no resumo.
- As dez anotações laterais de lembretes não foram convertidas automaticamente em alertas: isso ativaria também metas históricas vencidas. Cinco tinham km definida (correias/bomba: 229.643; alinhamento: 194.269; óleo/filtros: 211.000; pneus: 190.760; válvula termostática: 229.643). Confira quais ainda se aplicam antes de cadastrar ou associar ao serviço adequado. As outras cinco não tinham próxima km/data. A anotação para incluir seguro não foi importada como gasto, pois não contém data nem valor.

#### Modelo CSV de manutenções e demais despesas

Baixe **modelo-despesas-lifeos.csv** no importador selecionando o tipo Manutenções e outras despesas. Padrão igual ao de abastecimentos: UTF-8, ponto e vírgula, datas DD/MM/AAAA, até 1 MB e 1.000 registros. Use uma linha por serviço/despesa, sem repetir id_origem. O arquivo não é enviado ao Notion diretamente; o aplicativo cria os vínculos internos.

| Coluna | Regra |
|---|---|
| id_origem | Obrigatória, identificador estável e único, até 142 caracteres; preserve ao reimportar. |
| veiculo | Nome apenas para conferência; destino selecionado no app. |
| data | Obrigatória, DD/MM/AAAA. |
| descricao | Obrigatória, até 150 caracteres. |
| categoria | Obrigatória; nome atual de uma categoria compartilhada ou identificador: maintenance, tax, toll, insurance, parking, wash, other. Combustível usa o importador específico. Categorias personalizadas devem existir antes de importar. |
| km | Inteiro sem ponto de milhar, ou vazio quando desconhecido. |
| valor_total_rs | Coluna obrigatória: positivo para custo conhecido, `0,00` para serviço sem custo, ou vazio para valor não informado. Não use “–” ou valores negativos. |
| observacoes | Texto, até 5.000 caracteres; aspas e quebras de linha conforme padrão CSV. |
| proxima_km | Meta inteira para criar alerta associado ao serviço; vazia quando não se aplica. |
| proxima_data | Data DD/MM/AAAA de próxima manutenção/vencimento; vazia quando não se aplica. |

**Categorias globais:** não há uma categoria Manutenção do carro e outra da moto. Renomear ou desativar uma categoria vale para todos os veículos e preserva seus vínculos históricos. O importador reutiliza o mesmo cadastro, não cria categorias por veículo. A entrada “Documentação” é aceita como alias de Impostos. Categorias personalizadas ausentes bloqueiam a importação e devem ser criadas uma única vez em Categorias antes de tentar novamente.

**Edição de serviços:** no formulário de despesa, deixe Total vazio quando o valor ainda não é conhecido, ou digite R$ 0,00 quando não houve cobrança. O campo de combustível continua exigindo valor positivo. Registros sem valor podem ser corrigidos depois pelo lápis, sem nova importação.

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
| Observações | Texto | Criado automaticamente se ausente; até 5.000 caracteres |

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

## Algum dia — configuração e uso

### Criar o banco no Notion

1. Dentro da página **LifeOS** já autorizada à conexão interna, crie um **banco de dados em página inteira**, chamado **Algum dia**. Não é uma página vazia nem uma relação com outro banco.
2. Configure estas propriedades, respeitando nomes e tipos:

| Propriedade | Tipo no Notion | Uso |
| --- | --- | --- |
| Nome | Título | Nome da ideia ou área |
| Tipo | Texto | Tipo técnico `idea` ou `area`, preenchido pelo app |
| Contexto | Selecionar | Opções **Pessoal** e **Trabalho** |
| Dados | Texto | Documento e configurações, preenchidos pelo app |
| Anexos | Arquivos e mídia | Cópias das imagens inseridas |

3. Confira se a conexão interna existente tem acesso ao banco, com leitura, inserção e atualização. Não crie uma nova integração.
4. Copie o ID deste banco e adicione **`NOTION_SOMEDAY_DATABASE_ID`** às variáveis da Vercel nos ambientes usados. Use o ID do banco, não o parâmetro `v=` da visualização. Somente se o banco tiver múltiplas fontes, configure também `NOTION_SOMEDAY_DATA_SOURCE_ID` com o ID da fonte correta.
5. Envie o conteúdo atualizado de `lifeos/` à raiz do repositório e faça novo deploy. Preserve todas as variáveis existentes, especialmente o segredo de sessão. Atualize o app instalado. **Não é necessário atualizar o APK Captura, o OAuth Google ou criar outra chave de API.**

O app acrescenta **LifeOS ID** e **LifeOS Usuário** automaticamente. Ideias e o catálogo de áreas de cada conta ficam privados; o mesmo catálogo é usado para seus projetos e ideias. Não edite manualmente o JSON de Dados nem os identificadores técnicos. Sem a variável, a aba apresenta orientação de configuração e não grava ideias.

### Usar a nova aba

- **Nova ideia** abre um editor amplo, usando toda a largura disponível na área de conteúdo, como o editor de novo projeto; uma ideia fechada sem nenhuma ação não é registrada. Título, anotações e demais edições são salvos pelo fluxo automático existente. Aguarde **Salvo no Notion** antes de fechar o app se houver alterações pendentes.
- **Áreas / Gerenciar áreas** abre o mesmo cadastro em Algum dia e no editor de Projetos. Criar uma área disponibiliza o assunto nas duas telas. Renomear mantém o identificador das ideias e atualiza o campo Área dos projetos correspondentes, nos dois contextos e em todos os status. Campos, textos, anexos e tarefas desses projetos são preservados. Ocultar impede novas seleções nas duas telas, mas mantém os vínculos existentes; reativar recupera a mesma área.
- O campo **Área** de Projetos é um seletor. As áreas já preenchidas nos projetos são cadastradas automaticamente ao carregar o app, sem reescrever os projetos nem precisar de botão de importação. Nomes equivalentes por acentuação, maiúsculas e espaços nas pontas reutilizam o mesmo assunto. O catálogo admite até 100 áreas; valores antigos excedentes permanecem nos projetos e no seletor. Os projetos compartilhados continuam seguindo suas regras existentes: a alteração do nome da área aparece para quem tem acesso ao projeto, mas não compartilha as ideias ou o catálogo privado.
- **Configuração desta revisão:** nenhuma alteração adicional no Notion. O catálogo usa os registros `area` do banco Algum dia e os projetos mantêm o campo existente **Área (Selecionar)**. Não converta esse campo em relação nem crie outro banco. Basta manter a conexão autorizada e `NOTION_SOMEDAY_DATABASE_ID` já configurado. Sem essa configuração, as áreas antigas continuam selecionáveis nos projetos; o gerenciamento fica desabilitado.
- Os cartões permitem busca por título/texto/área, filtro por área e favoritos. Os contextos Pessoal/Trabalho seguem o seletor geral. O catálogo de áreas é do usuário e pode organizar ideias dos dois contextos.
- O editor oferece parágrafos, títulos, negrito, itálico e listas. **Enter** cria um parágrafo e **Shift + Enter** uma quebra de linha. Limite de 30.000 caracteres por ideia, sujeito também ao limite de estrutura do documento.
- Cole uma imagem, arraste um arquivo ou use **Imagem**. JPEG, PNG e WebP são reduzidos para até 1.600 px e enviados ao Notion; GIF mantém a animação. Originais de até 20 MB são aceitos para processamento; o resultado enviado precisa ter até 4 MB (GIF até 4 MB). As imagens aparecem dentro das anotações e também na lista de anexos. Retirar a imagem do texto não exclui o arquivo; **Excluir** na lista de anexos pede confirmação e retira ambos.
- Colar um endereço **HTTPS** sozinho ou usar **Link** cria um cartão com título, descrição e miniatura quando a página permite. Se a fonte bloquear a consulta, o endereço continua clicável. O botão **Manter apenas o link** substitui o cartão por um link de texto.
- **Transformar em projeto/tarefa** pede confirmação e copia título, texto simples e anexos. A ideia original permanece com sua formatação e recebe a indicação de transformação. As outras telas mantêm os editores atuais. O app aguarda o salvamento dos arquivos e usa um identificador estável para retomar falhas sem duplicar o destino.
- **Inbox → Algum dia:** ao abrir uma entrada com a aba Algum dia selecionada, use Transformar em ideia em Algum dia. A primeira linha vira o título; as demais entram no editor como conteúdo, preservando parágrafos e linhas em branco. Escolha uma área antes de concluir a transformação. A ideia abre em seguida para completar contexto e outros detalhes. O contexto inicial é Pessoal e pode ser alterado manualmente no editor. A conversão não interpreta as linhas como metadados. Se o banco não estiver configurado ou o título/texto for inválido, a entrada fica no Inbox. O salvamento cria a ideia antes de remover a origem e permite retomar uma falha sem criar outra cópia.

### Recursos gráficos, tráfego e backup

As dez ilustrações Microsoft Fluent Emoji são arquivos locais com licença MIT em `public/emoji/fluent-ideas/`. O editor usa pacotes gratuitos e abertos do Tiptap, fixados no package-lock; não exige conta, assinatura ou chave Tiptap. Este piloto não muda os ícones nem os editores de texto das outras abas. O campo Área de Projetos usa o catálogo integrado descrito acima.

As prévias consultam páginas públicas pelo servidor do LifeOS, sem cookies ou credenciais. Endereços internos/privados e redirecionamentos inseguros são bloqueados. Metadados ficam em cache no Upstash por sete dias, separados por usuário; há limite de 60 novas consultas por usuário/hora. A leitura de HTML usa até 256 KB e as miniaturas até 1 MB, com cache privado do navegador. Sites podem bloquear prévias. As miniaturas de páginas continuam sendo referências externas; **não são copiadas para o Notion**. Imagens que você cola ou envia ao editor são copiadas.

Verificação desta funcionalidade: suíte completa `npm test` e compilação `npm run build`; inspeção no Chromium em desktop e viewport mobile, com APIs simuladas, incluindo edição, link, imagem, favoritos, busca, áreas e descarte de ideia intocada. Isso não substitui o teste no Android/iPhone real. Nenhum serviço de produção foi alterado.

O novo banco participa da sincronização incremental, atualização ao retornar ao foco, rascunhos privados e backup/restauração existentes. Criar um backup depois de configurar o banco inclui as duas contas, documentos e arquivos enviados. Restaurar preserva os vínculos das imagens pelo nome estável. Backups antigos não contêm este banco: use uma cópia criada após sua inclusão; a restauração verifica a compatibilidade dos bancos. Não há consulta periódica nova em segundo plano.

## 6. Vercel: variáveis

Configure em Settings → Environment Variables. Aplique em Production e nos ambientes de teste realmente usados; após qualquer alteração faça novo deploy. Todos os tokens/segredos ficam somente no servidor, sem prefixo NEXT_PUBLIC_.

| Variável | Uso |
| --- | --- |
| `NOTION_TOKEN` | Token da conexão interna Notion |
| `NOTION_SOMEDAY_DATABASE_ID` | Novo banco Algum dia; ver configuração abaixo |
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

Copie Client ID e Client secret para a Vercel. Domínios de Preview precisam de callback/configuração próprios. Não troque LIFEOS_SESSION_SECRET com rascunhos pendentes: ele também participa da proteção dos rascunhos. A sessão Google assinada usa cookie HttpOnly e tem validade de sete dias. Sessões autorizadas por QR usam cookie separado logicamente por modalidade, não persistente, prazo de 1 hora e revogação no Redis.

### Upstash

Use Redis dedicado ao LifeOS e token REST com escrita. Além da coordenação das gravações e autoria compartilhada, a versão atual guarda pedidos QR temporários e sessões revogáveis com expiração, progresso/catálogo de backups e o mapeamento de bancos ativos após restauração. **Não limpe o Redis após restaurar.** Não é necessário outro Redis para esta revisão. Indisponibilidade da coordenação bloqueia gravações em vez de permitir operações concorrentes sem controle.

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

Consulte também **AGENTS.md** na raiz: arquitetura, regras de dados e interface, segurança, validação e preparação das entregas. Este README continua sendo o guia de configuração e uso.

Node.js compatível com Next.js 15. Instale com **npm ci**. Configure variáveis localmente sem publicar segredos. Use **npm run dev**, **npm test** e **npm run build**. Para login local, configure origem/callback OAuth correspondentes. Não há deploy automático executado por esta entrega: a publicação é feita pelo seu GitHub/Vercel.

Se uma versão anterior acrescentou Responsável ao banco Projetos, essa coluna pode permanecer: o app não a usa mais. Não é necessário apagá-la para atualizar.

## Bem-estar — primeira versão de testes

A aba Bem-estar substitui Hábitos na navegação, preservando sua posição no dispositivo. Não apague nem recrie os bancos Hábitos e Registros de hábitos: nenhum histórico é migrado ou zerado. O componente e as regras anteriores são mantidos: cartões marcam somente hoje, sem desmarcar; correções pelo resumo mensal; alterações passadas pedem confirmação; resumo anual é leitura e abre o mês; exclusão, encerramento e recuperação continuam com confirmação. As datas do painel Meu dia não alteram o dia dos cartões de hábitos.

### Criar os dois novos bancos no Notion

Dentro da página LifeOS, crie dois bancos de dados completos e dê acesso à conexão interna LifeOS:

1. **Bem-estar**: registros diários, pressão/BPM e peso/gordura privados de cada usuário.
2. **Ciclo da Letícia**: um registro por data, sempre referente à Letícia; ambos os usuários podem ler e editar nesta fase de testes. Não são dois ciclos separados. A futura restrição de edição ainda não foi ativada.

Os dois bancos usam as mesmas propriedades:

| Propriedade | Tipo no Notion |
| --- | --- |
| Nome | Título |
| Data | Data |
| Tipo | Texto |
| Dados | Texto |

O app cria automaticamente os campos técnicos LifeOS ID e os campos de proprietário/editor. Não preencha nem modifique Dados manualmente: esse campo contém o registro estruturado em JSON. Não há relações obrigatórias com outros bancos.

Na Vercel, adicione **NOTION_WELLNESS_DATABASE_ID** com o ID do banco Bem-estar e **NOTION_CYCLE_DATABASE_ID** com o ID do banco Ciclo da Letícia. Use o ID do banco, não o da visualização após `?v=`. Mantenha todas as demais variáveis. Se o banco tiver múltiplas fontes, informe também NOTION_WELLNESS_DATA_SOURCE_ID ou NOTION_CYCLE_DATA_SOURCE_ID. Faça novo deploy.

### Como testar

- Meu dia: escolha a data pelo campo DD/MM/AAAA/calendário, setas ou Hoje. Selecione uma pétala no círculo para abrir seu cartão central de escolhas. A escolha é salva automaticamente e ilumina o contorno da pétala. Limpar escolha remove a seleção daquele aspecto; os demais dados do dia são preservados. Clique fora do cartão ou em × para voltar ao círculo. Sono permite selecionar duração aproximada e qualidade separadamente. Dores permite intensidade e vários locais; Nenhuma limpa os locais. Uma duração de sono ou intensidade de dor já deixa a pétala marcada como preenchida. Limpar escolha limpa o aspecto inteiro (incluindo duração/intensidade), sem mexer nas outras pétalas. Os registros de dias passados podem ser editados; datas futuras são bloqueadas. Campos não preenchidos permanecem sem registro. Energia e estresse têm pétalas próprias, com marcações de 1 a 5. Água tem sua própria pétala com quantidade em litros. A área Mais registros do dia foi removida. Todos os preenchimentos são livres. O botão discreto Excluir registros do dia pede confirmação e remove somente o registro das pétalas da data selecionada; não altera hábitos, ciclo, pressão ou medidas corporais. Os campos antigos retirados da tela não são usados em novos preenchimentos. O salvamento usa o fluxo incremental existente, com rascunho local protegido e indicação Salvo no Notion.
- Hábitos: confirme que as marcações e os resumos anteriores permanecem, incluindo hábitos encerrados e confirmações. Os atalhos de seção rolam até cada painel.
- Pressão e BPM: preencha diretamente no cartão data, pressão em um único campo com máscara (124/76) e BPM, e clique Salvar medição. O horário não é necessário. Podem existir várias medições no dia: o cartão mostra a média aritmética da sistólica, da diastólica e do BPM no dia mais recente com registros. Os gráficos também mostram médias diárias. A média é calculada e arredondada ao inteiro mais próximo para exibição, sem substituir as medições salvas. Ver histórico permite editar ou excluir com confirmação. Os registros antigos com horário são preservados, mas o horário deixa de aparecer nos formulários e no cartão. As três séries ficam em um gráfico único: sistólica e diastólica usam a escala mmHg à esquerda; BPM usa sua própria escala à direita. Os limites são ajustados aos dados visíveis, sem diagnóstico ou classificação automática.
- Peso e gordura: preencha diretamente no cartão e clique Salvar medidas quando houver uma nova medição; peso obrigatório, percentual de gordura opcional. É permitido apenas um registro por dia; não há exigência de preencher diariamente. Inclusões repetidas e mudanças para uma data já ocupada são bloqueadas. Registros antigos duplicados são preservados e podem ser corrigidos pelo histórico. O gráfico único mostra peso (kg à esquerda) e gordura (% à direita), com limites independentes e ajustados aos registros. Valores de gordura não preenchidos são omitidos, sem convertê-los em zero. Toque em um ponto para ver seus valores. Histórico permite editar/excluir. Os formulários de inclusão só criam o registro ao clicar Salvar; Limpar descarta o preenchimento. Edições no histórico continuam no formulário de edição.
- Ciclo da Letícia: selecione menstruação, fluxo e cólicas nos botões do próprio cartão, na data selecionada. As escolhas são salvas automaticamente; Editar detalhes permite incluir observações ou excluir o registro com confirmação. Entre na outra conta, atualize e confirme que aparece o mesmo registro. Dia/medidas/hábitos de uma conta não aparecem para a outra.
- Deixe Salvo no Notion aparecer antes de fechar. Alterações feitas em outra instância são carregadas pelo fluxo de retorno ao foco existente; formulários abertos impedem sobrescrita automática. Edições concorrentes conflitantes mostram erro e preservam o rascunho para revisão.

### Backup após acrescentar bancos

Os dois bancos entram automaticamente nos novos backups completos quando configurados. Um backup antigo que não contém esses bancos não pode ser restaurado automaticamente sobre o novo conjunto; o app bloqueia essa restauração para evitar perder dados. Crie um novo backup após configurar e validar esta versão.

### Validação da entrega

Testes locais cobrem isolamento dos registros, ciclo compartilhado com identidade fixa da Letícia, reenvio sem duplicação, conflito entre contas, validação das medidas, edição/exclusão e salvamento incremental. O build de produção é verificado. A integração real e o layout em Android/iPhone devem ser conferidos após seu deploy.


## Veículos — configuração e primeira versão de testes

### Criar o banco no Notion

Dentro da página LifeOS, crie **um banco de dados em formato de tabela**, chamado **Veículos**, e autorize a conexão interna que o aplicativo já usa. Uma página de texto vazia não substitui esse banco. Configure estas propriedades, com os nomes e tipos abaixo:

| Propriedade | Tipo no Notion | Uso |
| --- | --- | --- |
| Nome | Título | Nome do veículo, da categoria ou descrição do registro |
| Data | Data | Data do abastecimento, despesa ou criação de lembrete; vazia em veículo/categoria |
| Tipo | Texto | Preenchido pelo app: vehicle, category, station, entry ou reminder |
| Dados | Texto | Preenchido pelo app com os detalhes estruturados do registro |

**Tipo e Dados são propriedades de Texto, não Selecionar nem Relação.** Não é necessário criar relações entre bancos nem cadastrar categorias manualmente. Faça os registros pela aba do aplicativo; não altere o JSON de Dados manualmente. Os campos técnicos **LifeOS ID**, **LifeOS Último editor** e **LifeOS Editado em** são criados pelo app: mantenha-os intactos.

Na Vercel, adicione **NOTION_VEHICLES_DATABASE_ID** com o ID deste banco (não o ID da visualização depois de `?v=`). Se houver mais de uma fonte de dados, informe também **NOTION_VEHICLES_DATA_SOURCE_ID**. Não é necessário mudar Google, Upstash ou as outras variáveis. Faça o deploy com o conteúdo da pasta lifeos e atualize o app. A aba aparece na barra e pode ser reordenada como as demais. Sem a variável, ela mostra a orientação de configuração e os cadastros ficam desabilitados.

### Garagem e personalização

Cadastre cada veículo com nome, tipo, placa, ano, km atual/inicial e antecedência dos alertas. **Veículos, abastecimentos, despesas, categorias e lembretes são compartilhados entre as duas contas.** A aba exibe COMPARTILHADO abaixo de seu nome e mantém apenas Pessoal, com Todos e Trabalho bloqueados. Não há escolha de contexto dentro do cadastro. Registros eventualmente criados antes desta revisão também ficam compartilhados e são exibidos como Pessoal, inclusive os que tinham Trabalho. A última edição exibe nome e horário, seguindo o padrão das outras abas compartilhadas. A aba Finanças permanece independente: nenhuma despesa de veículo é lançada automaticamente nela.

No cadastro, escolha apenas **Carro** ou **Motocicleta**. Troque o emoji pelas **setas nas laterais da imagem**, sem selecionar categorias de modelo. Há quatro imagens de carro (frente, lateral, SUV e picape) e duas de motocicleta (moto e scooter); a navegação é circular e também aceita as setas do teclado quando o seletor está em foco. Há oito cores prontas, com prévia imediata. O lápis no bloco permite mudar nome, ícone, cor e demais dados sem alterar lançamentos anteriores. As ilustrações usam **Microsoft Fluent Emoji, estilo Flat**, com arquivos SVG incluídos no app. A cor escolhida altera apenas a pintura e suas sombras, preservando vidros, pneus e faróis. Cadastros anteriores mantêm seus ícones; as opções antigas Street, Trail e Esportiva continuam representadas pelo emoji de motocicleta. Não há download externo de imagens durante o uso, nem novos serviços ou variáveis. Créditos, licença MIT, originais e variantes estão em public/emoji/fluent-vehicles. Fonte: https://github.com/microsoft/fluentui-emoji.

O campo **Ano** pode ficar em branco. Quando preenchido, aceita um ano inteiro de quatro dígitos, de 1886 até o ano corrente mais dois, e aparece ao lado do tipo/placa no bloco do veículo. Cadastros anteriores continuam válidos sem ano.

### Abastecimentos e médias

Clique **Abastecer** para abrir o painel **Novo abastecimento**, no mesmo padrão de Nova despesa, e informe data e odômetro, escolha **Etanol** ou **Gasolina** e preencha litros (até três casas decimais) e valor em reais de cada linha. Novos abastecimentos e novas linhas começam com **Etanol para carros** e **Gasolina para motocicletas**, podendo trocar livremente. Use **+ Adicionar combustível** para misturar dois ou mais registros no mesmo abastecimento, até vinte linhas; cada linha pode ser removida antes de salvar. Marque ou desmarque **Tanque cheio** uma única vez, para o abastecimento inteiro. O total de litros e reais é calculado automaticamente pela soma das linhas. As datas seguem DD/MM/AAAA, completando o ano ao informar dia/mês e sair do campo. O valor usa máscara R$ e completa os centavos ao sair.

**Posto:** deixe em branco, digite livremente ou abra **Favoritos** para escolher. O texto escolhido continua editável, permitindo usar outro nome sem modificar o cadastro. A estrela ao lado do campo cadastra/favorita o nome digitado; se o posto já existir, alterna apenas seu estado de favorito, sem criar cópia. Favoritar um nome não salva um abastecimento incompleto.

Em **Gerenciar postos**, cadastre nomes, marque ou desmarque favoritos, renomeie ou exclua um cadastro com confirmação. Os postos são compartilhados entre as duas contas e todos os veículos. Nomes repetidos são reconhecidos sem diferenças de maiúsculas, acentos ou espaços extras. O nome é guardado como texto no abastecimento: **renomear, desfavoritar ou excluir um posto cadastrado não modifica os nomes dos abastecimentos anteriores**. O posto aparece junto à data na lista de abastecimentos e na descrição da despesa. Os registros antigos podem permanecer sem posto. A informação fica no campo Dados já existente; não crie novas propriedades no Notion.

- Um abastecimento misto é **um só registro**, com uma só data, quilometragem e condição do tanque. Por exemplo, 20 L de etanol + 10 L de gasolina contam como 30 L nesse abastecimento. Os valores das linhas também são somados uma única vez na despesa e no custo/km. As médias continuam em km/L combinados, sem separar por tipo de combustível nesta revisão.
- O **primeiro tanque cheio** é a referência inicial; seu volume não entra no primeiro intervalo, porque não se conhece o nível anterior do tanque.
- Cada tanque cheio seguinte fecha um intervalo: km percorridos desde a referência ÷ litros de todos os abastecimentos posteriores à referência, incluindo parciais e o tanque cheio de fechamento.
- Parciais anteriores à primeira referência não entram no cálculo. Parciais depois do último tanque cheio aguardam o próximo fechamento e não alteram uma média já calculada.
- **Última média**: último intervalo completo. **Média geral**: soma das distâncias ÷ soma dos litros dos intervalos completos, ponderada pelo volume, considerando todo o histórico desse veículo.
- **Custo por km**: soma dos valores de combustível dos intervalos completos ÷ soma das distâncias desses mesmos intervalos. Não inclui despesas de manutenção, impostos ou seguro.
- O gráfico padrão de consumo mostra até doze intervalos completos mais recentes. Sem dois tanques cheios com distância positiva, os indicadores de consumo mostram um traço, sem inventar uma média.
- Edição ou exclusão de um abastecimento recalcula as médias e o gráfico. A quilometragem deve acompanhar a ordem das datas. Uma data posterior exige km maior ou igual aos registros anteriores; inserir um lançamento antigo também não pode ultrapassar a km de registros posteriores. O formulário mostra o registro conflitante, com data e km, e impede o salvamento; o servidor mantém a mesma validação. Registros do mesmo dia são permitidos e abastecimentos desse dia são ordenados pelo odômetro no cálculo de consumo.

A tabela informa o tipo (Etanol, Gasolina ou ambos) e os totais, com os litros de cada componente quando houver mistura. Ao editar, todas as linhas são recuperadas para correção. Registros antigos sem tipo continuam válidos para as médias e aparecem como **Não informado**; não é atribuído um combustível retroativamente. Ao editar um deles, selecione o tipo da linha antes de salvar, mantendo os litros e valores já cadastrados. As linhas e os totais usam o mesmo campo Dados do banco existente: **não crie propriedades adicionais no Notion nem variáveis na Vercel**.

**Colunas calculadas por abastecimento:** Preço/litro = valor total pago ÷ litros, em R$/L com duas casas decimais. Nos abastecimentos mistos, mostra o preço médio ponderado dos combustíveis da parada. Consumo (km/L) = distância desde o tanque cheio anterior ÷ litros acumulados após ele, incluindo os parciais e o tanque cheio atual, com duas casas decimais. A linha do tanque cheio que fecha o intervalo mostra a média; parciais mostram — / Pendente, pois o nível final ainda é desconhecido. A primeira referência, intervalos sem distância positiva e registros que interrompem a média mostram —. Os cálculos usam todo o histórico do veículo, mesmo quando só aparecem cinco linhas. Edição, exclusão e importação atualizam automaticamente as colunas. São dados derivados na tela: registros existentes não são regravados no Notion para adicionar estes campos.

**Gráficos pelo clique nos valores dos cartões:** o gráfico inicial continua Consumo, com os últimos doze intervalos completos. Clique em Última média ou Média geral para voltar a ele; Custo por km mostra os últimos doze intervalos válidos em R$/km, e Último preço por litro mostra os últimos doze abastecimentos em R$/L, incluindo parciais e preços ponderados das misturas. Não se usa a ordem visual da tabela para calcular esses gráficos.

No cartão financeiro, **Combustível no mês** e **Despesas no mês** mostram o total em reais de cada dia do MM/AAAA selecionado, inclusive dias sem lançamentos. O calendário correto considera 28, 29, 30 ou 31 dias; dois abastecimentos no mesmo dia são somados apenas na barra diária, sem unir os lançamentos da tabela. **Combustível no ano** e **Despesas no ano** mostram totais por ano de todo o histórico, em ordem cronológica, e não os meses de um único ano. O valor do cartão anual continua sendo o do ano selecionado. Alterar o período atualiza o gráfico mensal aberto. Toque nas barras ou pontos para consultar a data e o valor; use **Voltar ao consumo** para restaurar a visualização padrão. Trocar de veículo, sair da aba ou reabrir o app inicia novamente em Consumo. Não há novas consultas, propriedades ou dados gravados no Notion para esses gráficos.

A tabela mostra os cinco abastecimentos mais recentes; **Ver todos** abre o restante. O lápis permite editar e excluir com confirmação. Um abastecimento é um único lançamento exibido somente na região Abastecimentos. Seu valor entra apenas na parcela combustível do acumulado global, sem duplicação na tabela ou nos resumos de despesas do mês e do ano.

#### Abastecimento anterior não registrado

Marque **Abastecimento anterior não registrado** ao criar ou editar o abastecimento que sucede uma lacuna no histórico. O intervalo que atravessa essa lacuna sai dos cálculos de consumo e custo/km; os gastos e lançamentos continuam no histórico. Se esse registro for de tanque cheio, ele se torna a nova referência. Se for parcial, o app aguarda o próximo tanque cheio para estabelecer uma referência, calculando novamente apenas a partir do cheio seguinte. A Última média fica vazia até fechar um novo intervalo após a interrupção. As médias de intervalos válidos anteriores continuam compondo a média geral; o campo não apaga nem zera todo o histórico. Desmarcar recalcula normalmente. A tabela identifica a marcação como **Nova referência**.

#### Importar abastecimentos — primeira importação e futuras

O botão **Importar CSV** fica nos cartões **Abastecimentos** e **Despesas do veículo**, e permanece disponível para futuras importações. Selecione **Abastecimentos** ou **Manutenções e outras despesas** no painel. Cada tipo tem seu modelo CSV. O importador não cria lembretes avulsos automaticamente.

**Histórico preparado anteriormente:** os passos abaixo descrevem o arquivo pessoal `abastecimentos-suzuki-gsr125.csv`, entregue na etapa de importação. Guarde aquela cópia para eventual retomada; este ZIP contém os modelos vazios e o backup do catálogo TACO em `Importacao`, sem repetir o histórico pessoal. Envie ao GitHub apenas o conteúdo de `lifeos`. Os CSVs devem ser carregados pelo aplicativo, não diretamente pelo Notion.

1. Publique o conteúdo atualizado de `lifeos` e atualize a página/PWA. Não altere variáveis nem propriedades no Notion; os novos campos ficam em Dados, no banco Veículos existente.
2. Abra **Veículos** e selecione a motocicleta correta. Se ainda não a cadastrou, crie **Suzuki GSR125**, tipo Motocicleta, ano **2016**. A km atual pode permanecer em 61.805 km ou no valor atual real; o histórico começa em 2.678 km. A importação não substitui nome, placa, ano, ícone ou cor do veículo.
3. No cartão Abastecimentos, clique **Importar CSV** e escolha `Importacao/abastecimentos-suzuki-gsr125.csv`.
4. Confira o destino e a prévia. Sem histórico já importado, o arquivo contém **186 abastecimentos**, de **05/05/2016 a 28/08/2026**, **2.102,841 L** e **R$ 10.933,57**, com **2 parciais** e **1 interrupção de média** (26/03/2021). Os totais exibidos na prévia são apenas dos registros novos selecionados; podem ser menores se já houver duplicatas no destino.
5. O arquivo de origem não traz legenda do código de combustível. O padrão seguro é **Manter Não informado**. Se você confirmar que todo esse histórico é de gasolina, escolha **Confirmar Gasolina para estes registros**. Essa escolha afeta apenas linhas sem combustível identificado. Linhas com Etanol/Gasolina ou abastecimentos mistos conservam os tipos informados.
6. Por padrão, possíveis duplicatas de **mesma data e km** são ignoradas. A opção para incluí-las deve ser usada apenas após conferir que são abastecimentos diferentes. Registros com o mesmo ID de origem nesse veículo sempre são ignorados, mesmo que tenham sido editados posteriormente.
7. Clique **Confirmar importação** e confirme o veículo na mensagem. Mantenha o app em primeiro plano e aguarde **Importação concluída e salva no Notion**. São gravados lotes de até cinco registros, pelo salvamento incremental normal. As duas contas verão o histórico compartilhado.
8. Se houver falha, mantenha o mesmo arquivo e clique **Retomar importação**. Os lotes confirmados ficam salvos e os IDs estáveis evitam duplicação. Após fechar/reabrir, carregue novamente o mesmo CSV no mesmo veículo. Se aparecer conflito, feche o painel, use Atualizar e confira os registros antes de retomar. Não altere os IDs para tentar contornar uma falha.

O importador não cria cadastros de postos automaticamente. Nomes identificados permanecem como texto nos abastecimentos; você pode favoritá-los posteriormente. Localizações genéricas da origem são conservadas na observação. Quilometragens incoerentes por data, valores inválidos ou arquivos malformados bloqueiam a importação antes de inserir o lote. Uma edição concorrente no Notion também pode interromper a operação, preservando os lotes anteriores.

**Formato para futuras importações**

Baixe um modelo vazio pelo botão **Baixar modelo CSV** do próprio importador. Um modelo também está na pasta `Importacao` desta entrega. Use UTF-8, preferencialmente separado por ponto e vírgula, uma linha por abastecimento. Limite: **1 MB e 1.000 abastecimentos por arquivo**. Aspas e quebras de linha dentro de observações seguem o padrão CSV. Colunas extras são ignoradas.

| Coluna | Regra |
|---|---|
| id_origem | Obrigatória; identificador único e estável, de até 150 caracteres. Preserve em reimportações; não use números de linha que mudam ao ordenar. |
| data | Obrigatória, DD/MM/AAAA completa no arquivo. |
| km | Obrigatória, inteiro sem ponto de milhar: `61805`. |
| litros | Obrigatória, positivo, até 3 casas: `12,320`. |
| valor_total_rs | Obrigatória, total positivo em reais, até 2 casas: `87,35`, sem R$ e sem separador de milhar. |
| tanque_cheio | Obrigatória: Sim ou Não. |
| combustivel | Gasolina, Etanol ou Não informado. Vazio equivale a Não informado. |
| posto | Nome livre, até 150 caracteres; pode ficar vazio. |
| observacoes | Texto, pode conter quebras de linha; até 5.000 caracteres incluindo local_original, se preenchido. |
| abastecimento_anterior_nao_registrado | Sim ou Não; vazio equivale a Não. |
| veiculo | Nome para conferência; o destino é sempre o veículo escolhido no app. |
| local_original | Informação adicional da origem, acrescentada à observação; pode ficar vazio. |
| combustiveis_json | Avançado, pode ficar vazio. Para um abastecimento misto, lista JSON de até 20 linhas, com `type` (`ethanol`, `gasoline` ou `unknown`), `liters` numérico e `amount` em centavos inteiros. A soma deve coincidir com litros e valor_total_rs da linha. |

Exemplo do conteúdo de combustiveis_json: `[{"type":"ethanol","liters":10,"amount":4000},{"type":"gasoline","liters":5,"amount":3000}]`. Na mesma linha, informe litros `15` e valor_total_rs `70,00`. Ao gerar CSV, coloque esse JSON entre aspas e duplique as aspas internas, conforme o padrão CSV. Não repita id_origem em várias linhas para um único abastecimento; use esse campo para preservar os componentes de um abastecimento misto.

Não importe médias prontas: o LifeOS recalcula consumo usando tanques cheios, parciais e interrupções. A reimportação é aditiva; não atualiza nem exclui registros já importados. Para corrigir um registro existente, utilize o lápis no aplicativo. Um histórico manual sem ID de origem é tratado como possível duplicata por data e km, não como substituição automática.


### Despesas e categorias

Categorias iniciais: Combustível, Manutenção, Impostos, Pedágio, Seguro, Estacionamento, Lavagem e Outros. Elas já aparecem no app; só precisam de um registro no Notion quando personalizadas. Em **Categorias**, crie nomes, renomeie e desative categorias preservando seus lançamentos. Categorias inativas podem ser reativadas; um nome repetido inativo oferece reativação. Combustível pode ser renomeada e permanece disponível para os abastecimentos.

**Nova despesa** permite descrição, categoria, data, valor, km e observação. Informe **Duração da manutenção (km)** para definir quantos km depois do serviço será a próxima verificação. É necessário informar a km do evento; o app soma a duração e mostra o lembrete calculado antes de salvar. Por exemplo, 203.000 + 8.000 = 211.000 km. Ao salvar, o serviço aparece imediatamente em Manutenções e lembretes, sem cadastro duplicado. A próxima data de manutenção/vencimento continua disponível e pode ser usada sozinha ou junto da duração. Lembretes avulsos continuam aceitando a km absoluta como antes. Em registros antigos, uma próxima km com base conhecida é convertida para duração ao editar; metas sem uma base válida são preservadas e identificadas até que você informe uma duração nova. Apagar uma duração cadastrada retira apenas a meta por km, preservando a data se preenchida. Não há seleção de mês na aba Veículos. O cartão de resumo separa combustível e demais despesas em valores mensais e anuais. Um único seletor MM/AAAA, com setas e botão Hoje, controla quatro valores: combustível no mês, combustível no ano, despesas no mês e despesas no ano. Os valores anuais usam o ano do mês escolhido. Essas escolhas alteram apenas o cartão, não filtram as tabelas. No rodapé discreto, **Manutenção e despesas + combustível = total** soma todo o histórico conhecido do veículo. Registros sem valor não geram avisos no resumo ou no total da tabela. A tabela mostra inicialmente os cinco registros mais recentes, respeitando a categoria selecionada. **Ver todos (N)** expande a lista e **Mostrar recentes** recolhe novamente. A tabela e seus filtros excluem abastecimentos, vistos apenas no cartão próprio. A coluna **Km do evento** mostra o odômetro informado, ou — quando desconhecido. Clique em **Valor** para alternar crescente → decrescente → ordem padrão. A tabela de abastecimentos oferece o mesmo ciclo em Valor, Preço/litro e Consumo (km/L). Ordenações usam números reais, não os textos formatados; valores ausentes ficam no fim. O cálculo de consumo continua cronológico e não muda ao ordenar a apresentação. Ordenar considera todo o histórico filtrado e então exibe os primeiros cinco ou todos, conforme a expansão. Trocar de aba, sair/reabrir o aplicativo ou trocar o veículo restaura a ordem padrão (mais recentes primeiro). Quando expandida, a tabela mostra no rodapé a soma de todo o filtro selecionado, sem avisos sobre registros sem valor; o botão também fica disponível em listas com cinco ou menos registros para consultar esse total. Trocar de veículo ou categoria volta aos cinco mais recentes. Consumo e custo/km continuam calculados no histórico completo, conforme seus rótulos. Os filtros de categoria incluem categorias antigas ainda usadas no veículo. A observação aceita links clicáveis.

### Manutenções e lembretes

Use **+ Lembrete** para um aviso sem despesa, ou preencha próxima km/data ao registrar uma manutenção. A km atual exibida é a maior entre a km inicial do veículo e os registros de abastecimento/despesa que informem odômetro. Lembretes não aumentam a km do veículo.

- **Vencida**: chegou ou passou a km prevista, ou chegou/passou a data definida.
- **Próxima**: faltam até a antecedência configurada no veículo (padrão 500 km), ou até 30 dias.
- **Agendada**: ainda está fora desses limites. Quando houver km e data, vale o critério que exigir atenção primeiro.

Os alertas são recalculados na própria tela após registros, edições, exclusões e sincronizações, sem rotina em segundo plano e sem notificações push. **Concluir** pede confirmação, retira o alerta da lista e mantém a despesa e o registro. **Mostrar lembretes concluídos** permite acessar e editar, inclusive desmarcar a conclusão. A conclusão não cria automaticamente outra despesa ou nova recorrência nesta primeira versão.

### Salvamento e backup

Os registros usam o mesmo salvamento automático e controle de conflitos do restante do app. Ao voltar ao foco, a atualização segue as regras existentes de proteção a edições pendentes. Cada lançamento é um registro separado no Notion; editar uma despesa não regrava o cadastro inteiro do veículo. A validação consulta as dependências do veículo envolvido e pode conferir seu histórico de km; outros bancos não são consultados por essa alteração.

O banco Veículos é incluído automaticamente em novos backups completos. Os identificadores internos dos vínculos são preservados na restauração. Após configurar o novo banco, crie um novo backup completo: cópias anteriores sem Veículos não têm o mesmo conjunto de bancos e não são aceitas para restauração automática enquanto ele estiver configurado. Não há exclusão do cadastro inteiro do veículo nesta primeira versão; despesas e lembretes têm exclusão própria com confirmação.


## Acompanhamento — primeira versão

### Criar um banco no Notion

Dentro da página LifeOS, crie **um banco de dados chamado Acompanhamento**, com estas propriedades (nomes e tipos exatos):

| Propriedade | Tipo no Notion |
| --- | --- |
| Nome | Título (renomeie a coluna de título existente) |
| Data | Data |
| Tipo | Texto |
| Dados | Texto |

Não use Seleção para Tipo. Não é preciso criar relações nem um banco para cada usuário. Autorize a conexão LifeOS a acessar esse banco, assim como nos demais. Os campos técnicos LifeOS ID e LifeOS Usuário são criados pelo app; não preencha Dados, Tipo ou o proprietário manualmente. Metas, rotina diária, alimentos/favoritos, receitas e lançamentos usam tipos distintos dentro do mesmo banco.

Na Vercel, crie **NOTION_NUTRITION_DATABASE_ID** com o ID do banco (o trecho antes de `?v=`, não o ID da visualização). Somente se houver várias fontes de dados nesse banco, preencha também **NOTION_NUTRITION_DATA_SOURCE_ID**. Faça novo deploy. Não precisa criar chave de API de alimentos nem alterar Google ou Upstash. Sem o novo banco configurado, a aba mostra esta orientação e não grava dados.

### Como usar

- A aba Acompanhamento pode ser arrastada como as demais. É privada por usuário e fixa no contexto Pessoal. Não move nem altera Hábitos ou Bem-estar.
- Navegue por dia usando as setas, DD/MM/AAAA, calendário ou Hoje. Registros futuros são bloqueados. Marque Água, Aeróbico e Musculação e informe litros e horas de sono quando quiser. O check Água é independente do campo em litros. Não há leitura nem escrita dos registros equivalentes de Bem-estar.
- Ao adicionar/salvar um lançamento alimentar ou limpar a busca, os detalhes e a edição da seleção são fechados e o painel volta ao estado inicial. Limpar não altera lançamentos já salvos.
- A busca geral de alimentos e a escolha de ingredientes ficam vazias até digitar e se recolhem ao apagar o texto. **Favoritos e Minhas receitas mostram todos os itens ao abrir**, em ordem alfabética; digitar filtra e limpar volta a mostrar todos. A troca de guia limpa a busca anterior. Listar favoritos/receitas usa dados já carregados, sem buscar no Open Food Facts. Produtos online continuam exigindo Buscar/Enter.
- A busca local integrada reúne seus alimentos salvos (incluindo favoritos, receitas e produtos já salvos) e os 591 alimentos com energia numérica da planilha oficial TACO/NEPA-Unicamp, por nome/preparo. Os valores são por 100 g da parte comestível. Escolha corretamente cru, cozido, frito etc. O catálogo fica no código; não copia 591 alimentos para seu Notion. A indicação discreta TACO/Próprio identifica a origem; produtos salvos mantêm a identificação Open Food Facts. **Meus alimentos** filtra somente os itens ativos salvos por você; clicar novamente desliga o filtro e volta à busca integrada. **Produtos / marcas** continua sendo uma busca online separada, com Buscar/Enter.
- **Produtos / marcas** busca no Open Food Facts por nome de produtos disponíveis no Brasil ou por código de barras digitado. Use Buscar/Enter: não há consulta externa a cada letra. Produtos sem energia informada são omitidos, não tratados como zero. Valores em kJ são convertidos para kcal quando necessário. Fotos são links da fonte, com ilustração local quando indisponíveis.
- Selecione um alimento, informe a quantidade e a refeição e marque Dentro/Fora da dieta. O app calcula as kcal. Porções só aparecem quando o peso/volume da porção estiver informado. Nesse caso, selecionar o alimento já inicia com **1 porção**; sem porção, inicia com **100 g ou 100 ml**, conforme a unidade. Após cadastrar/alterar a porção, a seleção atual também passa a usar esse padrão. A edição de lançamentos existentes preserva sua quantidade e unidade até você alterá-las. Não transforma g em ml automaticamente.
- O resumo mostra Café da manhã, Almoço, Lanche e Jantar por padrão. Ceia e Outros entram ao registrar alimentos, seguindo essa ordem. No desktop todos ficam em uma única linha com largura adaptável; no mobile ficam empilhados.
- Adicionar ao dia salva um lançamento separado, com cópia do nome, base nutricional, quantidade, refeição e kcal. Expanda a refeição para editar ou excluir um lançamento; exclusão pede confirmação.
- A estrela guarda favoritos. Cadastrar alimento permite registrar nome, kcal por 100 g/ml, peso/volume de porção e ilustração. **Personalizar alimento / ícone** cria uma preferência sua sem alterar a TACO original. Em Meus alimentos você pode editar o cadastro ou retirá-lo do catálogo pessoal. Os lançamentos anteriores mantêm seus valores. Um alimento TACO retirado dos favoritos continua disponível na base original.
- Em Minhas receitas, use Nova receita, escolha os ingredientes e suas quantidades e informe o **peso final da receita pronta** em gramas. O cálculo soma as kcal dos ingredientes e divide pelo peso final para obter kcal/100 g. Ingredientes podem incluir alimentos próprios/favoritos; a receita guarda suas bases originais. Atualizar um ingrediente não recalcula receitas e lançamentos anteriores automaticamente. Edite a receita explicitamente se desejar mudar sua composição. Nesta versão, receitas são registradas por gramas, sem conversão automática para colheres ou fatias.
- Observações do dia têm suporte aos links existentes do LifeOS. Para editar um alimento já lançado use Editar na refeição. A edição não muda o cadastro base.

### Metas e cálculos

A meta inicial é **2.412 kcal**, editável em Ajustar meta. **Meta deste dia** modifica apenas o dia escolhido; **Meta padrão para novos dias** vale para os dias que ainda não têm registro de rotina. Ao criar o primeiro lançamento, a meta do dia é guardada para não mudar seu histórico quando alterar o padrão.

- Adesão à dieta = kcal Dentro da dieta ÷ kcal totais.
- Base do dia = 10% se Água está marcada + 20% se Aeróbico **ou** Musculação está marcado + 70% se as kcal totais não ultrapassam a meta. Marcar os dois exercícios não duplica o peso.
- Qualidade = base do dia × adesão à dieta. **Acima de 70%** recebe a indicação Boa adesão. Os litros de água e as horas de sono ficam registrados, mas não acrescentam peso à fórmula.
- Sem calorias registradas, adesão e qualidade ficam sem nota. Os resumos mensal/anual usam a média diária apenas dos dias com calorias registradas; não contam dias vazios como zero. Não é a razão dos totais do período.
- O resumo mensal permite abrir os dias para revisão. O resumo anual permite selecionar o mês. Não há importação automática da planilha histórica nesta primeira versão.

### Fontes, imagens e funcionamento

TACO: NEPA/UNICAMP, https://nepa.unicamp.br/publicacoes/tabela-taco-excel/ ; procedência e transformações em lib/data/TACO-FONTE.md. A pasta Importacao/TACO do pacote contém taco.json (cópia exata do catálogo usado no aplicativo), taco-alimentos.csv (591 alimentos, separados por ponto e vírgula, decimal com vírgula, UTF-8 com BOM) e TACO-FONTE.md. São arquivos de manutenção: não precisam ser enviados ao Notion nem importados, e editá-los não muda automaticamente o catálogo que está em lib/data/taco.json. Nomes e identificadores da fonte são preservados. Categorias/nomes associam alimentos às ilustrações locais Microsoft Fluent Emoji, com licença MIT em public/emoji/fluent-food/LICENSE.txt; o mesmo ícone pode representar várias preparações. Personalizar um cadastro permite escolher outra ilustração.

Open Food Facts: https://world.openfoodfacts.org/ (dados ODbL); fotos de seus colaboradores sob CC BY-SA 3.0. Créditos e links ficam na área de alimentação. Fotos dos produtos são externas; esta primeira versão não envia uma cópia dessas fotos para o Notion nem oferece upload de foto própria de alimento. O registro mantém os dados nutricionais mesmo se o link da foto deixar de funcionar.

A busca online tem cache público no Upstash por seis horas e limite global conservador de oito consultas novas por minuto. Só os resultados públicos são guardados no cache; alimentação e dados pessoais permanecem no fluxo privado do Notion. Favoritos e buscas TACO não dependem desse serviço externo. Falhas na busca não apagam registros e não impedem cadastro manual.

### Salvamento e backup

Lançamentos, rotina, metas, favoritos e receitas entram no salvamento automático, rascunho privado e sincronização ao retornar ao foco. Edições enviam apenas os registros alterados do novo banco. A API valida privacidade, cálculos, duplicatas por dia e conflitos entre instâncias. Uma criação concorrente do mesmo dia pode pedir Atualizar antes de continuar, preservando o rascunho; não mescla JSON de rotina silenciosamente.

O backup manual inclui o banco Acompanhamento automaticamente quando configurado, preservando os dados e as cópias nutricionais dos lançamentos. Os ícones/TACO acompanham o código; fotos externas de produtos não entram como arquivos do Notion. **Crie um novo backup após adicionar o banco**: backups antigos com um conjunto menor de bancos não podem ser ativados automaticamente pelo app. Não é necessário reimportar veículos ou qualquer outra área.

### Cabeçalhos das páginas

As páginas principais não repetem o título ou o subtítulo da aba ativa. Recados mantém seu título e subtítulo. Preservar títulos internos de cartões, seções, detalhes e formulários, além de ações e filtros de data. Guias únicas sem escolha (Meu dia em Acompanhamento e Garagem em Veículos) não são exibidas.

Botões principais de inclusão em Projetos, Tarefas, Compras, Aniversários e Veículos ocupam a linha de status de sincronização, alinhados à direita. PageActions usa um portal para preservar os manipuladores/estado da própria tela e desaparece ao sair dela. Gerenciar categorias de Finanças fica na linha dos filtros de data, à direita.

O ícone da aba Aniversários fica dourado quando há contatos na lista dos próximos 7 dias (hoje e os seis dias seguintes). Usa os contatos já carregados e a mesma regra do resumo, sem filtro da busca e sem consulta extra. Sem aniversários nessa janela, retorna ao ícone padrão; só o ícone recebe cor.


## LifeOS Captura — aplicativo Android e widget (v1.0.3)

Aplicativo complementar **somente para adicionar textos ao Inbox privado**, independente do PWA. Não mostra a lista do Inbox nem lê os outros bancos. Android 8.0 ou mais recente. O domínio desta compilação é `https://lifeos-two-kohl-18.vercel.app`.

### Implantação e primeira conexão

1. Publique primeiro o conteúdo de `lifeos/` deste pacote no repositório/Vercel, incluindo as novas rotas `app/api/capture/` e a página `app/capture/pair/`. Preserve as variáveis já configuradas. Não há novo banco Notion, nova variável ou cliente OAuth Android.
2. No Android, baixe e instale **LifeOS-Captura-1.0.3.apk**. Se solicitado, permita a instalação por essa fonte. O app tem nome/ícone próprios e não substitui o LifeOS PWA. Se já estiver instalado, atualize por cima, sem desinstalar.
3. Abra **LifeOS Captura**, toque **Conectar ao LifeOS**, confira o código e abra a autorização no navegador. Use o login Google de uma das duas contas existentes e confirme **Autorizar captura**. A página não carrega os bancos completos.
4. Volte ao aplicativo Android. Ele conclui o pareamento e vincula os envios à conta autorizada. Se houver capturas feitas antes da primeira conexão, serão enviadas a essa conta; a página de autorização explica isso.
5. Na home do Android, mantenha pressionado um espaço vazio, abra **Widgets**, escolha **LifeOS Captura** e adicione o widget. O caminho exato depende do launcher.

### Capturar e sincronizar

- O widget compacto ocupa **uma linha e duas colunas**, podendo ser alargado para **uma linha e quatro colunas** (a grade exata depende do launcher). Toque na faixa **＋ Inbox / ＋ Capturar no Inbox** para abrir uma **janela flutuante sobre a home**, somente com título discreto, campo multilinha, fechar e Enviar ao Inbox. O campo fica ativo e o teclado abre, sem passar pela tela principal do app. Fechar ou tocar fora mantém o rascunho. A tela principal continua disponível pelo ícone LifeOS Captura para conexão e configurações. Enter cria novas linhas; o texto mantém as integrações existentes do Inbox (primeira linha, demais linhas etc.). O widget não faz essas conversões: elas continuam sendo executadas dentro do LifeOS.
- Toque **Adicionar ao Inbox**. Primeiro a entrada é gravada em uma fila SQLite privada, com conteúdo criptografado usando Android Keystore. Só depois é agendado o envio. A confirmação **Guardado no aparelho** permite sair; abrir pelo widget fecha a janela após guardar.
- **Relógio dourado:** existem entradas ainda não confirmadas. **Check verde:** não há envios pendentes e a conexão local está autorizada. **Símbolo cinza de conexão:** falta conectar/reautorizar. Nenhum título ou conteúdo de captura aparece no widget.
- A fila é processada pelo WorkManager quando há rede, com novas tentativas e atraso progressivo. Não baixa o Inbox nem faz varredura de bancos; não mantém serviço permanentemente ativo nem consulta periodicamente por novas entradas. O Android decide o momento de execução, especialmente com economia de bateria. Forçar parada ou restringir o app pode exigir reabri-lo para retomar.
- Só se remove uma entrada local após o servidor confirmar `saved` para o mesmo ID. Os registros confirmados continuam no Notion e são exibidos no Inbox normal quando o LifeOS se atualiza, conforme o fluxo já existente.
- O texto ainda não adicionado permanece como rascunho no aparelho. Isso não significa que já foi enviado. O limite por entrada é 10.000 caracteres; a fila aceita até 500 capturas.
- Não desinstale, limpe dados ou restaure o celular com entradas pendentes: o armazenamento local e sua chave seriam perdidos. **Copiar pendentes**, na tela do aplicativo, permite resgatar os textos manualmente e não remove/confirma a fila. O app não inclui os dados privados no backup automático do Android.

### Autorização e contas

A credencial nativa dura até **90 dias**, é revogável e autoriza exclusivamente criar entradas no Inbox da conta que aprovou. Não é uma sessão web Google, não pode autorizar computadores nem consultar, editar ou excluir dados. O APK não contém token Notion, segredo Google ou token Upstash. A credencial do aparelho fica criptografada no armazenamento privado.

No menu da conta do LifeOS, **Dispositivos de captura** abre a lista para desconectar um aparelho. Sessões temporárias por QR não autorizam nem administram dispositivos. Após expirar/revogar, os textos ficam pendentes no Android até reconectar a conta original. Não se permite enviar fila ou rascunho de outra conta ao trocar o login.

### Falhas e confirmação

O servidor usa o lock global já existente (inclusive o bloqueio de backup/restauração), cria apenas a página necessária e registra um recibo técnico sem o texto no Redis. IDs estáveis impedem reenvios duplicados, inclusive após conversão ou exclusão da entrada no Inbox. Esses recibos pequenos persistem para impedir recriação futura; fazem parte do consumo do Upstash, sem nova instância.

Se o Notion perder a resposta depois de gravar, a próxima tentativa procura somente aquele ID e recupera a confirmação. Se o resultado continuar ambíguo e o registro não for encontrado, o servidor **não cria outra cópia automaticamente**: a entrada fica pendente com aviso. Confira o Inbox e use Copiar pendentes para resgate, se necessário; não interprete relógio dourado como confirmação. Uma falha ou indisponibilidade nunca deve virar check verde com itens na fila.

Recusas explícitas de criação pelo Notion (validação, acesso ou limite de chamadas) permitem repetir o envio após corrigir a causa, mantendo o mesmo ID e texto. Falhas de rede, respostas 5xx ou resultados desconhecidos continuam protegidos como ambíguos. Recibos antigos que já ficaram ambíguos não são liberados automaticamente, porque não é possível saber se houve gravação, conversão ou exclusão posterior.

**Tentar sincronizar agora** reinicia uma tentativa que esteja adiada pelo atraso progressivo, sem interromper um envio já em curso. Pedidos automáticos são agrupados, preservando o próximo processamento quando uma captura chega no final da execução. A tela principal informa a última tentativa ou o último envio confirmado e o motivo da pendência quando disponível. Relógio dourado significa pendência, não necessariamente uma requisição em andamento. Economia de bateria, ausência de rede e manutenção/backup também podem adiar o envio; essas situações não apagam a fila.

### Atualizar o APK e guardar a assinatura

Instale as próximas versões **por cima**, mantendo `applicationId=app.lifeos.capture`, a mesma chave de assinatura e `versionCode` crescente. Isso preserva a fila e o vínculo do aparelho. Guarde **LifeOS-Captura-Assinatura-PRIVADA.zip** em local seguro: contém a chave e a senha para futuras compilações assinadas. **Nunca envie esse ZIP, a chave ou sua senha ao GitHub/Vercel.** Ele é entregue separado do código.

O projeto Android está em `lifeos/android-capture/`. Pode ser aberto no Android Studio com JDK 17, SDK 35 e Build Tools 35.0.0. O Gradle Wrapper usa 8.11.1, AGP 8.9.1 e WorkManager 2.10.0. As versões são intencionalmente fixadas. Para gerar o APK release, forneça no ambiente local `LIFEOS_KEYSTORE` (caminho da chave) e `LIFEOS_STORE_PASSWORD` (senha do arquivo privado) e rode `./gradlew :app:assembleRelease`. Para mudar o servidor, ajuste `LIFEOS_URL` no build.gradle e gere outra versão. Segredos de assinatura não são variáveis da Vercel.

### Verificação desta entrega

Os testes do servidor usam serviços simulados e scripts Redis Lua reais em VM: pareamento de uso único, duas contas, revogação, limites, origem, escopo restrito, isolamento, manutenção, envio incremental, reenvio e respostas perdidas. A compilação Next valida as novas rotas/página. Compilação e lint do Android verificam o pacote; uso em aparelho real, restrições de bateria e comportamento do launcher devem ser confirmados no seu teste inicial. Não houve gravação ou migração nos serviços de produção durante o desenvolvimento.

### Atualização 1.0.3 — sincronização e widget

O widget ocupa uma linha horizontal de duas até quatro colunas, conforme o launcher. Mostra o ícone e **LifeOS**, com OS em azul, quando a largura comporta a marca completa; no tamanho menor fica só o ícone. O texto da ação passa a 18sp, com alinhamento central no espaço restante. Redimensionar recalcula a apresentação. Relógio/check continuam sem títulos das capturas.

Na tela principal LifeOS Captura, ajuste **Transparência do fundo** de 0% (sólido) a 100% (sem fundo). A preferência é local, vale para os widgets desse aparelho e não altera a cor/opacidade dos textos e símbolos nem o painel de captura. Widgets existentes podem manter o tamanho antigo: redimensione pela home; se o launcher não oferecer uma linha, remova somente o widget e adicione novamente. Isso não apaga a fila.

Para aplicar esta entrega:

1. Publique o código completo do ZIP na Vercel, pelo fluxo habitual do GitHub. Esta versão também corrige o tratamento de recusas explícitas do Notion no servidor.
2. Instale **LifeOS-Captura-1.0.3.apk** sobre a versão existente, **sem desinstalar nem limpar os dados**. A assinatura é a mesma, com versionCode 4; a fila, o rascunho, a transparência e as credenciais são preservados.
3. Abra LifeOS Captura e, se houver pendências, toque em **Tentar sincronizar agora**. Confira a mensagem de erro na tela se a fila não terminar. Não reinstale do zero para resolver pendências.

Não há novos campos/bancos no Notion, variáveis na Vercel ou configuração Google. Para desenvolvimento, `npm run test:android-queue` requer JDK 17 em JAVA_HOME/PATH e executa o Java real do worker com substitutos locais de Android, rede e armazenamento. Verifica agendamento, reenvio manual, confirmação do ID, timeout, autorização e lotes; não equivale a teste em aparelho.
