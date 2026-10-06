# Rolagem interna no mobile

Substitua os arquivos do projeto pelos da pasta lifeos deste ZIP e publique novamente na Vercel. Não há alterações no Notion, nas variáveis da Vercel ou no Google Cloud. O login separado e sua detecção automática continuam como na versão anterior.

## Mudança

Em telas com largura até 999px, o LifeOS ocupa um contêiner fixo na área do aplicativo. A rolagem vertical ocorre nesse contêiner, em vez de mover a página principal do navegador. Isso mantém a posição de rolagem do documento em zero para as transições de histórico.

O aviso de saída continua fixo, fora do contêiner, e não ocupa espaço no layout. Os painéis de edição continuam no body, fora da rolagem principal. Enquanto um painel estiver aberto, a rolagem atrás dele fica bloqueada. As margens de área segura do aparelho são preservadas. O layout desktop continua usando a rolagem anterior.

A proteção de duas voltas não foi substituída: o primeiro Voltar mostra o aviso e o segundo em até três segundos segue a saída nativa. Dentro de um editor/subtela, Voltar fecha primeiro a camada aberta.

## Teste após publicar

Feche/reabra o aplicativo para carregar o código novo. Role uma tela longa e pressione Voltar uma vez; observe se ocorre o flash. Pressione novamente para verificar a saída. Confira também a rolagem horizontal das abas e o preenchimento de um editor com o teclado aberto.

Testes automatizados de navegação, incluindo a preservação da rolagem interna e a saída com dois toques, aprovados; suíte completa e compilação de produção aprovadas. A experiência visual em um aparelho Android real ainda precisa ser verificada. Safari/iOS não foi validado neste ambiente.

Se o flash continuar, uma gravação curta de tela mostrando o primeiro Voltar será necessária para diferenciar uma mudança real de posição do conteúdo de um quadro desenhado pela transição nativa do Chrome.
