# Login e Voltar no celular

Substitua os arquivos pelo conteúdo da pasta lifeos deste pacote e publique na Vercel. Não é necessário alterar variáveis de ambiente ou bancos do Notion.

Esta versão substitui as tentativas anteriores de correção do Voltar:
- A proteção com duas voltas só é ativada depois da autenticação. A tela de login não ganha entradas artificiais de histórico.
- Iniciar o login substitui a tela de login no histórico, em vez de acrescentar uma navegação mantendo essa tela atrás do aplicativo.
- O aviso de saída é um componente separado, em um portal no body. Sua exibição não renderiza novamente a página nem os editores e não participa do layout.
- Nas transições internas do Voltar, a posição atual da página e dos elementos roláveis é preservada imediatamente e antes do próximo quadro. Continua sendo desativada a restauração automática de rolagem/foco quando suportada pelo navegador.
- O segundo Voltar em até três segundos mantém a saída nativa. Abrir um editor ou acionar outro controle cancela a tentativa de saída. Gestos de toque/arraste não a cancelam.

Após o deploy, feche/reabra o app. Para testar a primeira abertura após o login, saia da conta e entre novamente. Teste o primeiro Voltar com uma página rolada e depois o segundo Voltar em até três segundos; repita após fechar/reabrir com o login mantido. Teste também que Voltar com um editor aberto fecha primeiro o editor.

Validação: suíte automatizada completa; testes específicos de autenticação, histórico, rolagem antes do próximo quadro e segundo Voltar; compilação de produção. A experiência visual em um celular real não foi validada neste ambiente. O aplicativo utiliza a navegação nativa para sair e não pode forçar o encerramento do processo do PWA. Navegadores podem ignorar entradas de histórico criadas sem uma interação anterior: faça uma interação no aplicativo antes de testar.
