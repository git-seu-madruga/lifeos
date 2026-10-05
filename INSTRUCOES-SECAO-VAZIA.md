# Correção da seção vazia em Entretenimento

O bloco vazio conta como uma seção existente e ocultava o botão inicial. Também faltavam dados obrigatórios de tipo, ícone e cor, impedindo o salvamento.

Nesta atualização:

- Seções sem nome aparecem como Seção sem nome.
- Há um aviso e um botão Criar seções principais que faltam, mesmo que já exista um bloco vazio.
- Ao clicar nesse botão, um bloco totalmente vazio é aproveitado como Leitura e as demais seções principais são criadas. O registro e seus eventuais conteúdos são preservados.
- Se algumas seções principais já existem, são criadas apenas as que faltam; repetir a ação não cria duplicatas.
- Seções parcialmente preenchidas podem ser corrigidas pelo lápis. O editor oferece tipo, ícone e cor válidos para completar o cadastro.
- As mensagens de erro identificam a seção e o campo que precisa de ajuste.

## Aplicar

1. Substitua o conteúdo do repositório pelos arquivos da pasta lifeos do ZIP e faça deploy na mesma Vercel.
2. Feche e reabra o PWA ou atualize a página.
3. Abra Entretenimento e clique Criar seções principais que faltam.
4. Confira Leitura, Filmes, Jogos e Séries e aguarde Salvo no Notion.
5. Se alguma seção ainda estiver indicada como incompleta, abra seu lápis, preencha o nome e selecione tipo, ícone e cor; salve.

Não é necessário excluir registros no Notion, alterar propriedades ou variáveis da Vercel. As correções anteriores de capas no Notion e abas no iPhone permanecem incluídas.

Teste automatizado verifica o caso de uma seção vazia com conteúdo vinculado, criação das quatro principais sem perda do conteúdo, ausência de duplicação e salvamento no Notion simulado.
