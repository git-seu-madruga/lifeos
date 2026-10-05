# LifeOS: busca de jogos com IGDB

## 1. Cadastrar a aplicação na Twitch

1. Entre em https://dev.twitch.tv/console/apps com uma conta Twitch. Se necessário, crie uma conta gratuita e ative a autenticação em dois fatores nas configurações de segurança da Twitch.
2. Clique em **Register Your Application / Registrar sua aplicação**.
3. Use o nome **LifeOS Jogos** (ou outro nome disponível).
4. Em **OAuth Redirect URLs**, use `https://lifeos-two-kohl-18.vercel.app`. O fluxo do IGDB não utiliza esse redirecionamento, mas o formulário exige preencher o campo.
5. Escolha uma categoria adequada, como **Application Integration**, e **Client Type: Confidential**.
6. Registre e abra **Manage / Gerenciar**.
7. Copie o **Client ID**. Clique em **New Secret / Novo segredo** e copie o **Client Secret**.

Documentação oficial: https://api-docs.igdb.com/#account-creation
A API é gratuita para uso pessoal não comercial, sujeita aos termos da Twitch/IGDB.

## 2. Configurar na Vercel

No projeto LifeOS, abra **Settings → Environment Variables**. Acrescente:

| Nome | Valor |
| --- | --- |
| `IGDB_CLIENT_ID` | Client ID da aplicação Twitch |
| `IGDB_CLIENT_SECRET` | Client Secret da aplicação Twitch |

Selecione **Production** e, se você testar nesses ambientes, **Preview** e **Development**. Mantenha todas as variáveis existentes, inclusive as do Google: são credenciais diferentes.

Guarde o segredo apenas na Vercel. Não precisa enviá-lo por mensagem nem colocá-lo no GitHub. Não use nomes com prefixo NEXT_PUBLIC_.

## 3. Atualizar os arquivos

Substitua os arquivos do projeto no GitHub pelos arquivos da pasta `lifeos` do ZIP. Aguarde o deploy da Vercel. Se configurar as variáveis depois do deploy, faça um **Redeploy** para aplicá-las.

Não é necessário criar novos bancos. O aplicativo cria automaticamente o campo Plataformas, do tipo Texto, na base de conteúdos. O campo Ano, do tipo Número, é compartilhado com as séries e também é criado automaticamente se estiver ausente.

## 4. Usar

1. Abra **Entretenimento → Jogos → +**.
2. Digite o nome do jogo e clique em **Buscar**.
3. Confira nome, ano e plataformas nos resultados para distinguir títulos e versões. Escolha **Importar**.
4. Revise o título e clique em **Salvar conteúdo**. A opção de salvar uma cópia da capa no Notion vem marcada por padrão.

O aplicativo salva o nome, o ano do primeiro lançamento, as plataformas separadas por vírgulas, a capa e o link de origem do IGDB. Ano e plataformas aparecem nos cartões e podem ser corrigidos no editor. Para jogos importados antes desta atualização, abra o editor e busque/importe novamente para preencher essas informações. A sua avaliação por estrelas e seus comentários continuam sendo preenchidos por você.

A busca não depende de o jogo estar na Steam. Tente, por exemplo, títulos da Nintendo ou jogos antigos pelo nome original. A disponibilidade de cada título e capa depende do catálogo do IGDB. Cadastro manual e envio de capa continuam disponíveis, inclusive antes de configurar as credenciais.

## Funcionamento e validação

As consultas são feitas no servidor; o navegador não recebe as credenciais. A autorização da Twitch é obtida e renovada automaticamente, com cache de resultados e controle de consultas por instância. Se o IGDB limitar temporariamente as consultas, aparece uma mensagem para aguardar.

Testes com respostas simuladas cobrem autenticação, renovação após token inválido, reutilização do token, escape da busca, normalização dos resultados e validação dos endereços de capas. Suíte do aplicativo e compilação de produção verificadas. O teste real da busca depende de configurar suas credenciais e fazer o deploy.
