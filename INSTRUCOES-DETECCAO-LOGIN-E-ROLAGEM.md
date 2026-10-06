# Detecção do login e rolagem ao voltar

Este documento substitui as orientações de login/Voltar dos pacotes anteriores.

Substitua os arquivos pelo conteúdo da pasta lifeos deste ZIP e publique novamente na Vercel. Não há alteração no Notion, nas variáveis de ambiente ou na configuração do Google Cloud.

## Detecção automática do login

O login permanece em uma janela separada. A verificação de sessão não para mais apenas porque o navegador informa popup.closed. Essa propriedade também pode indicar que o navegador rompeu a ligação entre as janelas durante o login.

A verificação termina quando a sessão é reconhecida, quando ocorre um erro comunicado pela janela ou após dez minutos. O app também verifica ao voltar ao primeiro plano. A página de conclusão grava um sinal simples no armazenamento compartilhado do mesmo domínio; o LifeOS usa esse sinal para consultar a sessão no servidor. Não são enviados tokens ou dados privados nesse sinal.

Depois de reconhecer a sessão, o app carrega os dados e encerra a consulta periódica. Uma janela já autenticada não recarrega seus bancos em resposta ao sinal de login de outra janela. O isolamento entre contas e a validação da sessão no servidor permanecem em uso.

## Rolagem ao voltar

A rolagem raiz agora é representada apenas pela posição da janela. HTML/body/scrollingElement não são guardados novamente entre os elementos roláveis. Na versão anterior, uma posição antiga do HTML podia sobrescrever a posição atual da janela e deslocar a tela.

Quando a posição já está correta, o app não força uma escrita de rolagem. Permanecem a atualização imediata do aviso, a ausência de correção adicional no próximo quadro e a saída com dois toques.

## Teste

1. Após publicar, feche e abra o LifeOS para carregar a versão nova.
2. Saia da conta e entre novamente. Ao fechar a janela do Google e retornar, o app deve reconhecer a sessão e carregar os dados sem atualizar manualmente.
3. Em uma tela rolada, pressione Voltar e observe se a posição permanece estável. Pressione novamente em até três segundos para sair.
4. Confira que Voltar dentro de um editor fecha primeiro o editor.

Validação: testes novos reproduzem os dois defeitos no código do pacote anterior e passam no código corrigido; suíte completa e compilação de produção aprovadas. A transição visual nativa ainda precisa ser validada no aparelho. Não houve teste em Safari/iOS neste ambiente.
