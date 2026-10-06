# Correção da importação de capas

Substitua os arquivos no repositório pelos deste pacote e aguarde o deploy na Vercel. Feche e reabra o LifeOS instalado antes de testar. Não é necessário criar campos no Notion ou variáveis de ambiente.

Corrigido o erro de variável inexistente no envio de conteúdos de entretenimento ao Notion, reproduzido no teste de integração. A data de criação continua sendo lida do Notion para ordenar os conteúdos.

A criação do arquivo de capa agora usa a implementação explícita do Node, sem depender da variável global File. A prévia importada permanece disponível enquanto o anexo é salvo; depois, o aplicativo prioriza a cópia do Notion. Erros inesperados de importação passam a indicar se a falha ocorreu na preparação, no envio ou na autorização da capa, com registro da etapa no servidor sem credenciais.

Teste um novo jogo com a opção de copiar a capa marcada e confirme o salvamento. Se continuar falhando, informe a mensagem completa, o título do jogo e se os resultados da busca mostram a capa.
