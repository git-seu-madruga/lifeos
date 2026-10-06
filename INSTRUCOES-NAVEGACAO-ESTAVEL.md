# Navegação mobile: histórico estável

Substitua o conteúdo da raiz do repositório pelos arquivos dentro da pasta lifeos. Aguarde o deploy; feche e reabra o app. Não há alterações de bancos, propriedades do Notion ou variáveis de ambiente.

Esta versão substitui a abordagem anterior de dois toques. O controle usa um par de entradas do mesmo documento. Após Voltar, fechar um painel ou expirar o aviso, reutiliza a entrada já existente em vez de criar outras. As chamadas usam os métodos nativos de histórico para não disparar o roteador do Next.js. Os eventos internos também não restauram automaticamente a posição da rolagem. A proteção é inicializada durante o carregamento, inclusive na tela de login, e identifica guardas de documentos antigos para não reutilizá-los após recarregar.

## Limite do navegador

No Chrome/Android, antes de QUALQUER interação com uma página recém-aberta, o navegador pode ignorar o histórico criado pelo JavaScript. Assim, não é possível garantir dois toques para sair se você abrir o app e pressionar Voltar sem tocar em nada. Depois de uma interação, não deve ser necessário trocar de aba.

A documentação do Chromium confirma essa restrição: https://chromium.googlesource.com/chromium/src/+/main/docs/history_manipulation_intervention.md . A versão anterior prometia proteção imediata sem considerar essa restrição.

## Teste no aparelho

1. Abra o app, aguarde carregar e toque em qualquer botão da tela inicial, sem trocar de aba. Use Voltar: deve exibir o aviso, ou fechar a edição se um botão abriu um painel.
2. Aguarde mais de dois segundos, use Voltar novamente e confira o aviso. Dois toques rápidos devem permitir a navegação de saída normal do navegador.
3. Role a tela e use Voltar; confira se a tela mantém a posição sem flashes da página principal.
4. Abra e feche edições em sequência, retorne ao app e repita.

Os testes automatizados simulam inicialização, restauração de estado do roteador, recarregamento com marcador antigo, reutilização do histórico e isolamento das funções do Next.js. A compilação passou. Não foi possível reproduzir visualmente o comportamento em um navegador mobile real nesta execução, por isso ainda é necessário validar no aparelho.
