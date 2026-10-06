# Login separado e Voltar — Android / Chrome

Substitua os arquivos do projeto pelos da pasta lifeos deste ZIP e publique na Vercel. Não mude as bases do Notion, as variáveis da Vercel ou o URI de retorno no Google Cloud: /api/auth/google/callback continua o mesmo.

Esta versão substitui as instruções dos pacotes anteriores sobre login/Voltar.

## Login

Entrar com Google abre uma janela separada de autenticação. O LifeOS permanece na sua janela original: o app não navega pelo Google nem acrescenta a tela de retorno ao seu histórico.

Quando a autenticação termina, a janela tenta fechar automaticamente. Se ela permanecer aberta mostrando “Login concluído”, feche-a e volte ao LifeOS. O app confere a sessão ao retornar e carrega os dados. A consulta periódica à sessão existe apenas enquanto o login está em andamento e para quando ele é concluído; não consulta todos os bancos a cada edição.

Caso a janela não abra, permita pop-ups para o endereço do LifeOS e tente novamente. O app não faz redirecionamento automático na própria janela quando um pop-up é bloqueado, pois isso recolocaria o fluxo de login no histórico.

As mesmas duas contas, restrições de acesso, cookies HttpOnly, state, nonce e PKCE continuam em uso. O modo de janela separada consta do estado de login assinado. A página de conclusão não transmite tokens ou credenciais ao app: o app valida a sessão com o servidor.

## Voltar

Mantidos: Voltar fecha primeiro o editor/subtela; nas telas principais o primeiro Voltar mostra o aviso e o segundo, em até três segundos, segue a navegação nativa de saída.

O aviso agora é renderizado sincronamente no evento de Voltar. Foi removida a correção adicional de rolagem no próximo quadro. Quando o Chrome informa que realizou sua própria transição visual, o app não força uma mudança de rolagem durante essa transição. O aviso continua separado do layout e da renderização da página principal.

## Teste após publicar

1. Feche o LifeOS e abra novamente para partir de uma sessão de navegação limpa e carregar o novo código.
2. Saia da conta e entre novamente pelo botão Entrar com Google. O login deve abrir em outra janela.
3. Volte ao LifeOS. Sem fechar/reabrir, faça uma interação, role uma tela e pressione Voltar: deve aparecer o aviso. Pressione novamente em até três segundos.
4. Repita após fechar/reabrir com a sessão Google ainda válida.
5. Confira também que Voltar dentro de um editor fecha apenas o editor.

Validação executada: suíte automatizada completa, login em janela separada, verificação da sessão, mensagem de origem inválida ignorada, encerramento da consulta periódica após login, proteção de saída, transição visual sem escrita de rolagem e compilação de produção.

A transição nativa visual e o fechamento do PWA ainda precisam ser conferidos no aparelho. O aplicativo não tem permissão para forçar o encerramento do processo do Android. A saída continua usando a navegação nativa. A animação que o próprio Chrome desenha não é a animação dos painéis do LifeOS.
