# Atualização: foco inicial e cópia das capas de livros

Substitua os arquivos do projeto no GitHub pelos arquivos da pasta `lifeos` do pacote e aguarde o deploy da Vercel. Atualize a página ou o app instalado após o deploy.

- Nova leitura, Novo jogo e Nova série abrem com foco na busca.
- Novo filme abre com foco no título manual.
- Ao editar um conteúdo existente, o foco continua no título.
- Corrigido o download das capas de livros redirecionadas pela Open Library para o Internet Archive. Os destinos permitidos são restritos aos caminhos de capas e ao arquivo correspondente ao ID e tamanho solicitados.

Não há novas variáveis na Vercel nem alterações necessárias no Notion. Todas as funcionalidades anteriores, incluindo ano e plataformas dos jogos, permanecem no pacote.

Para o livro que apresentou erro, abra novamente a importação e salve com a opção de cópia da capa no Notion marcada.

Validação: redirecionamento real identificado por consulta aos servidores; testes simulados da cadeia Open Library → Internet Archive → servidor de arquivo, bloqueio de arquivos/domínios diferentes, testes de entretenimento e compilação de produção. Não foi feito deploy nem upload no seu Notion.
