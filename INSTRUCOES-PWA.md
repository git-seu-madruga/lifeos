# LifeOS como aplicativo PWA

Este pacote completo parte da versão com login Google para as duas contas e mantém os mesmos bancos Notion. Não altera variáveis de ambiente, cliente OAuth, Redis ou propriedades dos bancos. Preserve suas configurações existentes.

## Publicar

1. Aguarde o indicador Salvo no Notion antes de atualizar.
2. Extraia o ZIP e substitua os arquivos do repositório pelo conteúdo da pasta lifeos. Inclua a pasta public, next.config.mjs, app/layout.js e components/PwaProvider.js. Não envie node_modules, .next ou credenciais.
3. Faça o deploy na Vercel no mesmo projeto e domínio.
4. Abra https://lifeos-two-kohl-18.vercel.app/ no navegador do celular e atualize a página.

## Instalar no Android

No Chrome, toque em Instalar app quando o botão aparecer no LifeOS. Alternativamente, use o menu do Chrome → Adicionar à tela inicial / Instalar aplicativo (o nome varia). Abra pelo ícone LifeOS criado na tela inicial.

O aplicativo solicita tela cheia. O navegador/sistema pode manter áreas de status ou navegação, ou usar uma janela sem a barra de endereços como alternativa. A instalação não pode ser feita automaticamente sem sua ação.

## Instalar no iPhone/iPad

Abra no Safari → Compartilhar → Adicionar à Tela de Início → Adicionar. Se houver a opção Abrir como App, mantenha-a ativada. Abra pelo novo ícone. O botão Instalar app no LifeOS mostra essas instruções, pois o iOS não fornece o mesmo diálogo de instalação do Chrome.

Abre sem a barra do Safari; o sistema pode manter a barra de status e o indicador de início. Pode ser necessário entrar com Google novamente no aplicativo instalado. Não é preciso criar outro callback OAuth.

## Computador

Use o botão Instalar app quando disponível ou a opção de instalação no menu do Chrome/Edge. O comportamento da janela/tela cheia depende do sistema. O app continua acessível normalmente pelo endereço web.

## Conexão, dados e atualizações

Esta versão é instalável, mas não oferece uso offline completo. Login, leitura e sincronização com Notion precisam de internet. Ao abrir sem conexão, aparece uma tela simples para tentar novamente. Se perder a rede enquanto está editando, os mecanismos existentes de rascunho criptografado e salvamento pendente continuam valendo; confira Salvo no Notion ao reconectar.

O service worker não armazena HTML, dados de contas, respostas de APIs ou anexos no Cache Storage; não intercepta o login Google nem endpoints /api/. Mantém o isolamento já implementado. As atualizações são carregadas pela rede: feche e abra o aplicativo após novos deploys. Não é necessário reinstalar a cada atualização.

## Conferir após deploy

- Verifique o ícone, a abertura sem barra de endereço e o acesso às abas no celular em pé.
- Entre com Google pelo aplicativo instalado e confirme seus dados.
- Edite um item e espere Salvo no Notion. Confira a alteração no navegador.
- Teste sair/entrar com a outra conta e confirme a separação dos dados privados.
- Feche o app, desligue a conexão e abra: deve mostrar a mensagem de falta de conexão; reconecte e tente novamente.

Compilação e teste automatizado do service worker executados. A instalação e o retorno do login Google em aparelhos reais precisam ser conferidos após o deploy. Não houve publicação automática.

## Rolagem das abas no iPhone

A barra usa rolagem horizontal nativa, sem barra visível. Para reordenar no celular, toque no botão com setas junto às abas, arraste e toque no ✓ para concluir. No modo de ordenação, arrastar move as abas; fora dele, deslizar rola a barra. O arraste com pausa longa foi substituído por esse modo explícito para evitar conflito com o Safari.
