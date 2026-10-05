> Busca de jogos: siga INSTRUCOES-IGDB.md para configurar as duas novas variáveis.

> Para esta versão, siga INSTRUCOES-ENTRETENIMENTO-SIMPLIFICADO.md. As seções são fixas e criadas automaticamente.

> Atualização mais recente: consulte INSTRUCOES-ANO-PORTUGUES.md (ano das séries e preferência por livros em português).

# Entretenimento — configuração e uso

Esta entrega é um pacote completo que mantém Google, PWA, salvamento seletivo, contextos com tamanho padronizado e as abas anteriores. Entretenimento é pessoal e privado por conta. As duas contas usam os mesmos novos bancos, mas veem somente suas seções e conteúdos.

## 1. Criar os dois bancos no Notion

Crie os bancos como páginas dentro da página LifeOS, onde sua conexão interna tem acesso. Confira o acesso da conexão aos dois bancos. Use os nomes de propriedades abaixo exatamente; o nome do banco pode ser outro.

### Banco: Seções de entretenimento

| Propriedade | Tipo |
| --- | --- |
| Nome | Título (renomeie a propriedade principal) |
| Tipo | Texto |
| Ícone | Texto |
| Cor | Texto |

Não é necessário preencher linhas manualmente. Dentro do app, o botão Criar as quatro seções adiciona Leitura, Filmes, Jogos e Séries para a conta autenticada. A outra conta pode fazer o mesmo para sua coleção.

Os campos Tipo, Ícone e Cor são preenchidos pelo app. Tipo usa os códigos book, film, game, series ou custom; ícones e cores são escolhidos visualmente no editor. Não transforme essas três propriedades em Selecionar.

### Banco: Conteúdos de entretenimento

| Propriedade | Tipo / configuração |
| --- | --- |
| Nome | Título |
| Seção | Relação com Seções de entretenimento; limite a 1 página |
| Autor | Texto |
| Status | Selecionar: Quero começar, Em andamento, Concluído |
| Avaliação | Número, de 0 a 5; 0 significa sem avaliação |
| Comentário | Texto |
| URL da capa | Texto |
| Link de origem | Texto |
| Fonte | Texto |
| Capa | Arquivos e mídia |

Seção relaciona um conteúdo a uma seção. Não é necessário criar a relação de volta; pode deixá-la desativada. Atenção: os campos URL da capa e Link de origem são do tipo Texto, apesar dos nomes.

O app cria LifeOS Usuário (Texto) e LifeOS ID (Texto) automaticamente. Não altere os campos técnicos. Conteúdos criados diretamente no Notion sem proprietário são tratados como da conta principal; para a segunda conta, crie pelo app.

## 2. Adicionar variáveis na Vercel

No mesmo projeto, Settings → Environment Variables → Production:

| Nome | Valor |
| --- | --- |
| NOTION_MEDIA_SECTIONS_DATABASE_ID | ID do banco Seções de entretenimento |
| NOTION_MEDIA_DATABASE_ID | ID do banco Conteúdos de entretenimento |

O ID é o identificador de 32 caracteres do banco no link do Notion, não o identificador da visualização após ?v=. Como nos bancos anteriores, se o banco tiver mais de uma fonte de dados, configure também NOTION_MEDIA_SECTIONS_DATA_SOURCE_ID ou NOTION_MEDIA_DATA_SOURCE_ID conforme a mensagem exibida pelo app. Para bancos novos com uma única fonte, só as duas variáveis acima são necessárias.

Mantenha todas as variáveis existentes. Não precisa alterar Google Cloud, Upstash ou criar chaves de API para as buscas.

## 3. Publicar

1. Aguarde Salvo no Notion antes da atualização.
2. Extraia o ZIP e substitua os arquivos do repositório pelo conteúdo da pasta lifeos, incluindo app, components, lib, public, package.json e package-lock.json.
3. Cadastre os dois IDs e faça deploy na Vercel.
4. Feche e reabra o PWA ou atualize a página no navegador.
5. Abra Entretenimento e clique Criar as quatro seções. Depois adicione conteúdos.

Sem os dois bancos configurados, a nova aba mostra orientação e as demais continuam funcionando.

## 4. Recursos

- Seções editáveis, com 16 ícones e oito cores. Os quatro principais são livro, filme, controle de jogo e TV.
- Tipo define rótulos: Quero ler/Lendo/Lido; Quero assistir/Assistindo/Assistido ou Assistida; Quero jogar/Jogando/Jogado. Seções personalizadas usam rótulos conforme o tipo escolhido.
- Renomear a seção preserva seus conteúdos. Excluir exige confirmação e também remove os conteúdos da seção.
- Cada conteúdo tem título, autor para livros, progresso, avaliação, comentário, capa e link de origem.
- Avalie clicando nas estrelas. Clicar novamente na estrela selecionada retira a avaliação. Pode avaliar antes de concluir.
- Use o botão no cartão para concluir; no editor, altere o progresso para reabrir.
- Busca por título, autor ou comentário; filtros Todos, Quero começar, Em andamento e Concluídos. As contagens das seções acompanham os filtros.
- Comentários e exclusão ficam no editor de conteúdo. Exclusão exige confirmação. Não há tela de histórico.
- Inbox continua à esquerda. Conversão do Inbox para entretenimento não foi adicionada nesta entrega.

## 5. Buscar e importar

Em Novo conteúdo ou Editar conteúdo, escolha uma seção do tipo Livro ou Série. Digite o título no campo de busca e clique Buscar (ou Enter). Escolha um resultado. Nada é gravado até clicar Salvar conteúdo.

Livros: Open Library importa título, autor e link da capa. Séries: TVmaze importa nome e link da capa. Link de origem e Fonte também são preenchidos. Se não encontrar, tente o título original; a disponibilidade de títulos em português e capas depende das fontes. Tudo pode ser corrigido manualmente. Um resultado sem capa continua válido.

As buscas são públicas, gratuitas e não exigem chave. Open Library pede identificação do aplicativo: o servidor envia LifeOS e o e-mail principal de contato no User-Agent. A busca envia apenas o título consultado, não suas avaliações ou comentários. Sua recomendação de registrar a aplicação pode ser atendida pelo formulário indicado na documentação, sem criar uma chave: https://openlibrary.org/developers/api.

Há cache temporário de metadados públicos e um intervalo entre buscas para evitar requisições repetidas. A gravação no Notion continua usando somente os dois novos bancos, sem consultar as outras áreas.

Ao importar, a opção Salvar uma cópia da capa no Notion vem marcada. Ao clicar Salvar conteúdo, o servidor baixa a imagem e envia uma cópia para o campo Capa do Notion; o link de origem permanece. Se preferir somente o link, desmarque a opção. Se o download falhar, o app mostra o erro e permite tentar novamente, enviar manualmente ou desmarcar a cópia. Para capas antigas por link, abra Editar conteúdo e salve com a opção marcada; não há migração automática em massa. Para upload manual, use Enviar capa: JPG, PNG, WebP ou GIF de até 4 MB; o arquivo é salvo no campo Capa do Notion. Também pode colar um link HTTPS manualmente. Sem imagem, aparece o ícone da seção. Remover capa exige confirmação.

Referências: https://openlibrary.org/dev/docs/api/search e https://www.tvmaze.com/api. O app mantém atribuição e link de origem do TVmaze. Steam, busca de filmes e importações por páginas públicas ficam para a próxima etapa; jogos e filmes podem ser cadastrados manualmente agora.

## 6. Conferir após deploy

- Crie as quatro seções, cadastre um conteúdo em cada uma e confira no Notion.
- Busque um livro e uma série; escolha o resultado e salve.
- Teste estrelas, comentário, conclusão, filtros e remoção de capa.
- Crie e renomeie uma seção com ícone personalizado.
- Confira no celular em pé.
- Entre com a segunda conta: a coleção da primeira deve permanecer privada.

Os testes automatizados incluem persistência, conflitos, upload de capa, propriedade entre contas e sincronização apenas dos dois bancos. Busca foi testada com respostas simuladas. Disponibilidade das fontes, retorno real e uso em aparelhos reais devem ser conferidos após deploy. Não houve deploy automático nem acesso aos bancos reais.
