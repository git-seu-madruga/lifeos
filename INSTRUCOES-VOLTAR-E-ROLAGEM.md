# Correção do Voltar no celular

Substitua os arquivos do projeto pelo conteúdo da pasta lifeos deste ZIP e publique novamente na Vercel. Não há alteração de bancos do Notion nem de variáveis de ambiente.

O gesto de toque/arraste deixa de rearmar a proteção de saída. Depois do primeiro Voltar, o segundo Voltar em até três segundos segue a navegação nativa de saída. Tocar em um controle do aplicativo ou abrir um editor cancela a tentativa de saída. Voltar com um editor aberto fecha primeiro o editor.

As transições internas do histórico usam rolagem manual. Nos navegadores com Navigation API, a restauração automática de rolagem e foco é desativada antes da transição, para evitar o salto visual. Nos demais, permanece o mecanismo de scrollRestoration do histórico.

Depois do deploy, feche e abra o aplicativo para carregar o código novo. Teste em uma tela rolada: primeiro Voltar deve apenas mostrar o aviso; segundo Voltar em até três segundos deve sair. Teste também com um editor aberto.

Validação: suíte automatizada e compilação de produção. O resultado visual e a saída nativa ainda precisam ser conferidos no aparelho. Navegadores podem ignorar entradas de histórico criadas antes de qualquer interação: faça uma interação no app antes de testar a proteção de saída. O aplicativo não pode forçar o encerramento do processo do sistema; a saída é a navegação nativa do navegador/PWA.
