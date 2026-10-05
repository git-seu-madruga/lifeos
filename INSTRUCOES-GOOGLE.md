# LifeOS: login Google, dois usuários e dados compartilhados

Este pacote contém todos os arquivos do app, incluindo as correções anteriores. Não faça o deploy até concluir os passos 1 a 4. Não envie senhas, tokens ou segredos por mensagens nem inclua esses valores no GitHub.

## O que cada conta vê

Contas autorizadas:

- Principal: **periclesbernardes@gmail.com** — recebe os dados privados atuais.
- Segundo usuário: **leticiacost3@gmail.com**.

| Dados | Visibilidade pelo LifeOS |
| --- | --- |
| Inbox, Projetos, Marcos, Tarefas, Diário, anexos dessas seções, Hábitos e Registros de hábitos | Somente o proprietário |
| Listas de compras e itens | Ambos |
| Contatos / Aniversários | Ambos |
| Categorias e lançamentos financeiros | Ambos |

Pessoal/Trabalho continua sendo uma classificação, não a identificação do proprietário. Diário, Finanças, Aniversários e Hábitos continuam com Pessoal fixo. Cada usuário tem seu próprio Diário, inclusive no mesmo dia, e suas próprias marcações de hábitos.

Compras, Aniversários e Finanças mostram autor e horário da última alteração **feita pelo LifeOS**, junto ao indicador de salvamento. Exclusões também atualizam essa indicação. O horário é exibido em America/Sao_Paulo. Ela aparece após gravar ou atualizar os dados, não em tempo real enquanto outra pessoa edita. Alterações feitas diretamente no Notion não recebem a identidade Google no LifeOS.

## 1. Preparar Google Cloud

1. Abra https://console.cloud.google.com/ e crie ou selecione um projeto para o LifeOS.
2. Abra **Google Auth Platform**. Configure a identificação do aplicativo com nome **LifeOS**, e-mail de suporte e contato de desenvolvimento.
3. Em **Audience / Público**, use o tipo **External / Externo**. Durante os testes, mantenha o aplicativo em Testing e adicione os dois e-mails acima à lista de usuários de teste.
4. Em **Data Access / Acesso a dados**, solicite apenas identificação básica: `openid`, e-mail e perfil. Não são solicitadas permissões de Gmail, Drive, calendário ou Notion pelo Google.
5. Em **Clients / Clientes**, crie um cliente OAuth do tipo **Web application / Aplicativo da Web**.
6. Em **Authorized JavaScript origins / Origens JavaScript autorizadas**, cadastre:

```text
https://lifeos-two-kohl-18.vercel.app
```

7. Em **Authorized redirect URIs / URIs de redirecionamento autorizados**, cadastre exatamente:

```text
https://lifeos-two-kohl-18.vercel.app/api/auth/google/callback
```

Não acrescente uma barra ao final do callback. O endereço deve coincidir exatamente. O app usa redirecionamento pelo servidor; não abre o login em uma janela embutida.

8. Copie o **Client ID** e o **Client secret** para as variáveis da Vercel descritas abaixo. Guarde o segredo em local seguro. Não o envie ao GitHub ou nesta conversa.

Referência oficial: https://developers.google.com/identity/openid-connect/openid-connect

## 2. Coordenação das gravações

O Notion continua armazenando todos os dados. Um Redis é usado apenas para um bloqueio temporário de gravação e para o resumo da última edição compartilhada. Isso evita que duas instâncias da Vercel gravem simultaneamente pelo LifeOS. Ele é necessário para esta versão; não foi criado ou contratado automaticamente.

1. Acesse https://console.upstash.com/ e crie um banco Redis **dedicado ao LifeOS**, escolhendo o plano apropriado para sua conta.
2. Copie **UPSTASH_REDIS_REST_URL** e **UPSTASH_REDIS_REST_TOKEN** para a Vercel. Use o token com acesso de escrita, não o token somente de leitura.
3. Não compartilhe esses valores. Nenhum conteúdo de projetos, tarefas ou diário é salvo no Redis. O resumo compartilhado armazena nome, e-mail e horário do último editor de cada área.

Enquanto uma gravação ocorre, outra recebe uma mensagem para aguardar e pode usar Tentar salvar novamente. O bloqueio tem validade temporária; se uma função for interrompida, poderá levar até dois minutos para ele expirar. Se o Redis ficar indisponível, a versão não grava sem coordenação; o rascunho fica pendente no dispositivo. Mudanças feitas diretamente no Notion não participam desse bloqueio. Conflitos detectados exigem atualização e revisão; ele não é uma transação atômica entre todas as páginas do Notion.

Referência: https://upstash.com/docs/redis/features/restapi

## 3. Notion — manter os mesmos bancos

Não duplique os bancos e não altere os IDs. Mantenha a conexão interna atual com acesso de leitura, criação e atualização de conteúdo.

O app cria automaticamente estas propriedades técnicas ao carregar os bancos:

| Bancos | Campo | Tipo |
| --- | --- | --- |
| Projetos, Marcos, Tarefas, Inbox, Diário, Hábitos e Registros de hábitos | LifeOS Usuário | Texto |
| Compras, Contatos, Categorias financeiras e Lançamentos financeiros | LifeOS Último editor | Texto |
| Os mesmos bancos compartilhados | LifeOS Editado em | Data |

A propriedade LifeOS ID continua sendo usada para recuperar gravações sem criar registros duplicados. Não edite as propriedades técnicas manualmente. Se elas já existirem, devem ter os tipos acima.

**Registros privados sem proprietário são acessíveis somente à conta principal.** A cada criação ou edição pelo app, o servidor grava o identificador permanente Google do proprietário. Dessa forma, os dados privados atuais ficam vinculados à conta principal sem precisar copiá-los. Faça o primeiro acesso com essa conta para conferir os registros.

Criações diretas no Notion com LifeOS Usuário vazio também serão tratadas como da conta principal. Para o segundo usuário, prefira criar pelo LifeOS. As relações privadas não podem apontar para registros do outro usuário.

O isolamento vale para o LifeOS. Quem tiver acesso direto aos bancos completos no Notion poderá vê-los segundo as permissões do próprio Notion. Não dê acesso direto a esses bancos se desejar que a separação seja obrigatória também fora do app.

## 4. Vercel — variáveis

No **mesmo projeto atual**, abra Settings → Environment Variables. Mantenha NOTION_TOKEN e todos os IDs dos bancos. Acrescente:

| Variável | Valor |
| --- | --- |
| GOOGLE_CLIENT_ID | Client ID criado no passo 1 |
| GOOGLE_CLIENT_SECRET | Client secret criado no passo 1 |
| LIFEOS_APP_URL | `https://lifeos-two-kohl-18.vercel.app` |
| LIFEOS_ALLOWED_GOOGLE_EMAILS | `periclesbernardes@gmail.com,leticiacost3@gmail.com` |
| LIFEOS_LEGACY_OWNER_EMAIL | `periclesbernardes@gmail.com` |
| LIFEOS_SESSION_SECRET | Segredo aleatório com pelo menos 32 caracteres; prefira 64 |
| UPSTASH_REDIS_REST_URL | URL REST do Redis dedicado |
| UPSTASH_REDIS_REST_TOKEN | Token REST do Redis dedicado |

Para gerar um segredo de 64 caracteres, use um gerenciador de senhas ou, em um terminal local com Node instalado:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Não reutilize sua senha ou algum token como segredo da sessão. Não é necessário enviar esse segredo para mim. Não troque esse valor enquanto houver rascunhos pendentes: ele assina as sessões e protege a abertura dos rascunhos criptografados.

**LIFEOS_PASSWORD não é mais utilizado e pode ser removido.** Cookies da versão por senha não dão acesso a esta versão. Não há um caminho alternativo para entrar por senha.

Configure para Production. Se desejar usar um domínio de Preview, configure um cliente OAuth e callback compatíveis com aquele endereço. Esta entrega está preparada para o endereço de produção informado.

## 5. Publicar

1. Antes de atualizar a versão atual, aguarde **Salvo no Notion** para todas as alterações pendentes. É prudente exportar os bancos atuais pelo Notion antes da mudança.
2. Extraia o ZIP e substitua os arquivos do repositório, incluindo `package.json` e `package-lock.json`. Há uma nova dependência: `google-auth-library`, a biblioteca oficial de validação dos tokens Google.
3. Não envie `node_modules`, `.next`, `.env.local` ou credenciais reais.
4. Depois de cadastrar as variáveis, faça o deploy na Vercel.
5. Abra https://lifeos-two-kohl-18.vercel.app/ e entre primeiro com **periclesbernardes@gmail.com**.
6. Confira os dados privados anteriores e os dados compartilhados. Use outra janela/perfil do navegador para testar **leticiacost3@gmail.com**.

## 6. Verificação após deploy

- A conta principal vê os dados privados anteriores; Letícia não vê esses registros.
- Cada conta cria um projeto com marco e tarefa, um Inbox, uma entrada de Diário e um hábito. A outra conta não deve recebê-los.
- As duas contas podem ter uma entrada de Diário na mesma data.
- Compras, Aniversários e Finanças aparecem para ambas. Faça uma edição com cada conta e atualize a outra para conferir nome e horário.
- Abra/baixe um anexo privado com o proprietário; a outra conta não deve ter acesso pelo endpoint do LifeOS.
- Uma terceira conta deve ser recusada, mesmo que consiga passar pela tela do Google.
- Saia e entre com outra conta no mesmo navegador. Não deve haver mistura de rascunhos. A sessão compartilhada entre abas pode fazer uma aba antiga exigir novo login antes de salvar.

## Segurança e limites práticos

O servidor valida o token Google pela biblioteca oficial, confirma o nonce e a lista de contas, e cria uma sessão assinada em cookie HttpOnly, Secure em produção e SameSite=Lax, com validade de sete dias. O login usa state e PKCE. Não armazenamos tokens de acesso ou renovação do Google. O proprietário e a autoria da edição são definidos no servidor, nunca aceitos do formulário.

Os rascunhos locais são separados e criptografados por usuário (AES-GCM); a chave é recebida somente em uma sessão autenticada e não é gravada em texto claro no armazenamento local. Na primeira entrada da conta principal, um rascunho antigo desta conversa pode ser migrado e criptografado; a segunda conta não o importa. Dados locais muito antigos que ainda não foram enviados ao Notion devem ser resolvidos antes do deploy. As preferências de ordem de abas/listas do navegador não contêm conteúdo privado e podem permanecer comuns no mesmo navegador.

O controle protege o acesso pelo aplicativo; não protege contra administradores do workspace Notion, acesso à configuração da Vercel ou alguém usando uma sessão já aberta do proprietário. Links de arquivos externos ou URLs temporárias de arquivos do Notion podem ser acessíveis a quem já tiver uma cópia válida do link.

Os testes automatizados desta entrega usam Notion, Google e Redis simulados. A compilação e os testes não substituem a validação do login com seu cliente OAuth real e das permissões na sua conta do Notion. Não houve deploy nem acesso aos bancos reais durante a implementação.
