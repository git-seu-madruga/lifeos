# Painéis e navegação mobile

## Publicar

Envie o conteúdo da pasta lifeos deste ZIP para a raiz do repositório, junto de package.json, app, components, lib e public. Aguarde o deploy na Vercel e feche e reabra o aplicativo instalado. Não é necessário criar bancos, propriedades no Notion ou variáveis na Vercel.

## Mudanças

Os painéis sobrepostos têm uma animação de entrada e saída de 180 ms, inclusive detalhes de tarefas, edição do Inbox, aniversários, hábitos, entretenimento, listas e painéis financeiros. O fundo fica bloqueado para rolagem durante a edição. Preferências de movimento reduzido do sistema são respeitadas. O Inbox recolhível no celular também abre e fecha com uma transição curta.

No celular, o botão Voltar do sistema fecha a camada de cima. Se houver uma tarefa aberta dentro de um projeto, volta ao projeto. Dentro de uma lista ou seção do entretenimento, volta à visão principal correspondente. No Diário, fecha a entrada, bloqueando-a novamente para leitura ao retornar. Com o Inbox aberto e sem outra edição por cima, Voltar recolhe o Inbox.

Nas abas principais, Voltar mostra “Pressione voltar novamente para sair.” O segundo toque dentro de aproximadamente dois segundos permite sair normalmente. Se esperar ou interagir novamente com o aplicativo, a proteção é restaurada. O histórico não acumula uma nova página a cada formulário ou aba.

No mobile, Enter no Inbox insere uma nova linha. Use o botão Adicionar para confirmar o texto completo. No computador, Enter continua confirmando e Shift+Enter cria uma nova linha. O botão Adicionar também funciona no desktop. Recolher o Inbox mantém o texto que ainda não foi enviado enquanto o app permanece aberto.

## Testar após publicar

1. Abra uma tarefa e use Voltar: deve fechar a tarefa, sem sair do app.
2. Abra uma tarefa dentro de um projeto: Voltar fecha a tarefa; outro Voltar retorna à lista de projetos.
3. Abra e feche um painel pelos botões para conferir as duas animações.
4. No mobile, abra o Inbox, digite o nome de uma lista e dois itens nas linhas seguintes. Enter deve inserir linhas; Adicionar deve manter todas elas. Transforme a entrada em Compras para conferir a integração.
5. Em uma aba principal e com o Inbox recolhido, pressione Voltar uma vez; confira o aviso. Pressione novamente rapidamente para sair. Espere mais de dois segundos para conferir que o primeiro toque volta a ser protegido.

Os testes automatizados e a compilação passaram. A navegação e os atalhos foram testados com simulação de histórico e teclado; ainda é necessário validar o botão nativo nos seus aparelhos. Alguns sistemas usam o primeiro Voltar apenas para recolher o teclado. O app controla a navegação do navegador; gestos de Home/alternador de aplicativos seguem sendo controlados pelo sistema.

Atualização: consulte INSTRUCOES-NAVEGACAO-ESTAVEL.md para o mecanismo atual e a restrição do navegador antes da primeira interação.
