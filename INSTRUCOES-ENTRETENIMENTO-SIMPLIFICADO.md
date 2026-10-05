# Entretenimento: quatro seções e exclusões em sequência

Substitua os arquivos do projeto no GitHub pelos arquivos da pasta `lifeos` deste pacote e aguarde o deploy da Vercel. Depois, atualize o aplicativo instalado ou a página.

Não há novos bancos nem variáveis de ambiente nesta atualização. Mantém a atualização anterior do ano das séries e da preferência por livros em português.

## Alterações

- Apenas Leitura, Filmes, Jogos e Séries, com os quatro ícones fixos.
- Removidos os botões “Nova seção”, “Novo conteúdo” e o editor de seções.
- Conteúdos continuam sendo adicionados pelo “+” de cada seção e editados no lápis de cada cartão.
- As seções principais ausentes são criadas automaticamente, preservando os IDs das existentes.
- Caso existam seções extras, seus conteúdos são movidos para a seção principal do mesmo tipo. Conteúdos de tipos personalizados ficam em Leitura. Nenhum conteúdo é excluído nessa consolidação.
- Exclusões com capas não confundem IDs locais ou URLs temporárias do Notion com alterações feitas por outra edição.
- Reenviar uma exclusão já concluída é aceito, mantendo a verificação de usuário e banco. Alterações reais dos anexos continuam gerando conflito para revisão.
- O salvamento continua em fila: exclusões feitas durante uma gravação são enviadas no próximo envio automático.

## Validação

Testes de exclusões rápidas durante uma gravação pendente, exclusão de capa com ID local e URL temporária, reenvio de exclusão concluída, bloqueio de outro usuário e conflito real de capa. Suíte completa e compilação de produção verificadas. Não foi realizado deploy nem acesso aos seus dados em produção.
