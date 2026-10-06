# Correção de Voltar no mobile

A proteção de dois toques é reforçada ao terminar o carregamento, ao retornar ao app e na primeira interação, sem depender de trocar de aba. Quando a inicialização substitui o estado do histórico, o marcador é reparado sem acrescentar páginas extras.

Os eventos de Voltar usados pelo LifeOS são tratados antes do roteador, para que o fechamento de um painel ou o aviso de saída não restaurem a página pelo Next.js. A navegação externa continua sendo liberada no segundo toque rápido.

Envie o conteúdo da pasta lifeos para a raiz do repositório. Aguarde o deploy e feche/reabra o app. Não há alterações no Notion ou nas variáveis da Vercel.

Teste no celular: abra o app, aguarde carregar e pressione Voltar sem trocar de aba. Deve aparecer o aviso e manter a tela atual. Aguarde mais de dois segundos e repita: deve mostrar o aviso novamente. Dois toques rápidos devem permitir sair. Abra uma edição e use Voltar: deve fechar somente a edição, sem piscar a tela principal.

Os testes simulam a substituição do histórico na inicialização, Voltar antes de qualquer troca de aba, o roteador registrado antes do controle do app, fechamento de painel, retorno ao app e ausência de páginas extras. A verificação visual final deve ser feita nos aparelhos após o deploy.
