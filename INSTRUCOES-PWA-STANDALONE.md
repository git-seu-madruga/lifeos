# PWA standalone — mudança baseada no vídeo do Android

Substitua os arquivos pelos da pasta lifeos deste ZIP e publique na Vercel. Não há alteração no Notion, nas variáveis de ambiente ou no Google Cloud.

O vídeo mostra o aparecimento das barras do Android acompanhado por um deslocamento transitório do conteúdo, inclusive ao interagir com as notificações. Essa observação aponta para a transição do modo imersivo, além dos problemas de rolagem que já foram corrigidos. A ausência do flash no aparelho ainda precisa ser verificada após instalar esta versão.

O manifest deixa de solicitar fullscreen e passa a solicitar standalone, inclusive em display_override. O app continua com ícone próprio e sem barra de endereço do Chrome. A diferença visível é que as barras de status e navegação do sistema deixam de ser ocultadas pelo modo imersivo. O objetivo é evitar a alternância de área disponível para o conteúdo.

## Aplicar no Android

Uma atualização dos arquivos do site não garante que o Android atualize imediatamente o modo da instalação existente. Para testar com o novo manifest sem esperar a atualização automática:

1. Publique esta versão na Vercel.
2. Antes de remover o app instalado, espere as alterações pendentes mostrarem “Salvo no Notion”.
3. Desinstale o LifeOS instalado. Não limpe os dados do Chrome/site.
4. No Chrome, abra https://lifeos-two-kohl-18.vercel.app/ e instale novamente pelo menu do navegador.
5. Abra pelo ícone e confira o modo: não deve haver barra de endereço, mas a barra de status do Android deve permanecer visível.
6. Teste o primeiro Voltar, a abertura/fechamento das notificações e depois os dois toques para sair.

As bases do Notion não são excluídas ao reinstalar o PWA. O login separado, a detecção automática da sessão, a rolagem interna mobile e a navegação dos editores permanecem como na versão anterior.

Alternativa à reinstalação: o Chrome pode atualizar o WebAPK automaticamente depois de detectar o manifest novo. A documentação também oferece a atualização manual por about://webapks, com o aparelho conectado ao Wi-Fi e à energia. Para este teste, a reinstalação é o caminho mais direto.

## Validação

Teste de PWA aprovado, incluindo a garantia de que o manifest não volta a preferir fullscreen. Compilação de produção aprovada. Não foi possível executar uma instalação em Android ou Safari/iOS neste ambiente; o resultado visual depende do teste no aparelho.

Referências:
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display
- https://web.dev/articles/manifest-updates
