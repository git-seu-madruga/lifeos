# Filmes: busca pelo TMDB

## 1. Obter o token

No computador, crie uma conta em https://www.themoviedb.org/ e abra https://www.themoviedb.org/settings/api . Solicite acesso à API para uso pessoal / não comercial, aceite os termos e preencha os dados solicitados.

Nome do aplicativo: LifeOS
URL do aplicativo: https://lifeos-two-kohl-18.vercel.app/
Descrição sugerida: Aplicativo pessoal privado, utilizado por duas pessoas, para organizar leituras, filmes, séries e jogos. A integração busca títulos, anos e pôsteres de filmes para um catálogo pessoal, sem venda, publicidade ou monetização.

Depois da aprovação, copie o **API Read Access Token** (Token de acesso de leitura da API). Não confunda com a chave API v3, que é outro valor. Não precisa criar autenticação TMDB para os usuários do LifeOS.

## 2. Configurar na Vercel

No projeto LifeOS, abra Settings → Environment Variables e crie:

Nome: TMDB_READ_ACCESS_TOKEN
Valor: o API Read Access Token completo, sem aspas e sem acrescentar Bearer

Selecione Production e, se usa os deploys de teste, Preview. Não coloque o token no GitHub nem em uma variável NEXT_PUBLIC_.

## 3. Publicar e testar

Substitua os arquivos do repositório pelo conteúdo deste pacote. Publique o commit e aguarde o deploy. Caso a variável tenha sido criada depois do deploy, faça Redeploy para que o servidor a receba. Feche e reabra o LifeOS.

Em Entretenimento → Filmes → +, o campo de busca recebe o foco. Pesquise um filme, escolha o resultado e confira título, ano e capa. O idioma preferido é português do Brasil, com a capa escolhida pelo TMDB; quando não houver tradução ou pôster em português, a fonte pode devolver uma alternativa. O ano refere-se ao lançamento indicado no catálogo, não à data em que você assistiu.

Mantenha marcada “Salvar uma cópia da capa no Notion” para arquivar a imagem em Capa, ou desmarque para manter apenas o link. Título, ano, origem e imagem continuam editáveis. A conclusão exige a data em DD/MM/AAAA como nas outras seções, e os resumos mensais/anuais continuam iguais.

## Notion

Não crie novos bancos nem propriedades. A integração usa os campos existentes Nome, Ano, Capa, URL da capa, Fonte e Link de origem no banco de Conteúdos. A propriedade Ano é criada automaticamente se ainda estiver ausente e a conexão tiver acesso.

## Créditos e validação

O aplicativo inclui o logo do TMDB e o aviso exigido em uma área de Créditos apenas na página de Filmes. A API é gratuita para uso não comercial com atribuição.

Documentação: https://developer.themoviedb.org/reference/search-movie
Token: https://developer.themoviedb.org/docs/authentication-application
Imagens: https://developer.themoviedb.org/docs/image-basics
Condições e atribuição: https://developer.themoviedb.org/docs/faq
Logo oficial aprovado (cópia preservada via Wikimedia): https://commons.wikimedia.org/wiki/File:Tmdb.new.logo.svg

Validação automatizada cobre busca em português, importação de ano e pôster, cache, erros de credencial/limite/resposta, validação das URLs, download de capa e edição do filme. O teste com sua credencial real será feito após configurar a variável e publicar.
