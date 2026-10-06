# Atualização: Recados

Esta atualização adiciona uma aba pessoal com coração e tons rosa/vermelho. Cada conta pode enviar um recado por dia para a outra, com texto, emojis e uma imagem. O calendário permite consultar dias anteriores. Apenas o destinatário pode clicar em **Marcar como lido**; o Notion guarda essa informação e o horário.

## 1. Criar o banco no Notion

Dentro da página LifeOS, crie um banco de dados chamado **Recados**, com uma única fonte de dados. Configure estas propriedades com os nomes exatos:

| Nome | Tipo no Notion |
| --- | --- |
| Nome | Título (renomeie a propriedade inicial) |
| Data | Data |
| Remetente | Texto |
| Destinatário | Texto |
| Mensagem | Texto |
| Imagem | Arquivos e mídia |
| Enviado em | Data |
| Lido | Caixa de seleção |
| Lido em | Data |

Não são necessárias relações com os outros bancos. Os horários de envio e leitura são preenchidos pelo aplicativo. Os campos técnicos LifeOS ID, LifeOS Último editor e LifeOS Editado em são criados automaticamente pela integração; não os remova. O envio e a leitura são registrados nos campos dedicados acima.

Autorize a conexão interna do LifeOS a acessar este banco. Confira em **Conexões** no menu do banco, mesmo que a página principal já tenha sido autorizada. A conexão precisa poder ler, inserir e atualizar conteúdo e propriedades.

## 2. Configurar a Vercel

Crie a variável de ambiente:

```
NOTION_RECADOS_DATABASE_ID=ID_DO_BANCO_RECADOS
```

Use o ID do banco de dados, não o ID da visualização após `?v=`. É a sequência de 32 caracteres na URL ao abrir o banco como página. Aplique aos ambientes utilizados (Production e, se necessário, Preview).

Mantenha as variáveis atuais do Google, Notion e Upstash. Não é necessário criar outro serviço nem modificar os bancos anteriores. Se o banco tiver múltiplas fontes de dados, configure também NOTION_RECADOS_DATA_SOURCE_ID; para um banco novo com uma única fonte isso não é necessário.

## 3. Publicar

Substitua os arquivos do repositório pelos arquivos desta pasta `lifeos/`, mantendo a raiz habitual do projeto. Faça o deploy na Vercel depois de adicionar a variável. Abra novamente o app instalado; se a aba não aparecer, atualize a página.

## Regras e teste

- Péricles (`periclesbernardes@gmail.com`) envia para Letícia (`leticiacost3@gmail.com`) e vice-versa. O servidor define as contas; elas não podem ser escolhidas no formulário.
- O dia considera o horário de Brasília. Há um recado por remetente por dia. Não há envio retroativo nem edição após enviar.
- Imagens JPG, PNG, GIF ou WebP de até 4 MB são copiadas para o Notion. Texto é obrigatório. A imagem ainda não enviada deve ser selecionada novamente após recarregar; o rascunho de texto é salvo localmente de forma criptografada, quando o armazenamento do dispositivo estiver disponível.
- O calendário mostra marcadores de enviados e recebidos. Ao trocar o mês, selecione o dia desejado para reler.
- A aba consulta somente o mês escolhido no banco Recados, ao abrir, ao retornar ao app e ao atualizar manualmente, sem consultas periódicas. O envio e a leitura são salvos imediatamente, sem depender do botão global de atualização.
- Abra as duas contas, envie um recado em cada uma e marque o recebido como lido. Confira Mensagem, Imagem, Lido e Lido em no Notion. Tente enviar um segundo recado no mesmo dia: o servidor deve impedir a duplicação.
- Aguarde o envio terminar antes de fechar o aplicativo. Se houver falha, o texto permanece para tentar novamente.

A restrição de edição se aplica ao aplicativo. Quem tiver acesso direto ao banco no Notion continua podendo editar suas páginas.

Validação: testes automatizados existentes, novos testes do limite diário/permissões/concorrência e compilação de produção. Não foi feita validação física em Android ou iPhone nesta atualização.

## Integração com o Inbox

Na aba Recados, abra uma entrada do Inbox e use **Transformar em recado**. A primeira linha vira o título (campo **Nome** no Notion); as linhas seguintes viram a mensagem (campo **Mensagem**). Não precisa criar nenhuma propriedade adicional.

O texto abre no formulário de hoje para revisão, emojis e imagem. Clique em Enviar para concluir. A entrada só é retirada do Inbox depois da confirmação de salvamento do recado no Notion. Se cancelar a substituição de um rascunho, se já houver recado enviado hoje ou se houver erro, ela continua no Inbox. A remoção do Inbox usa a sincronização normal do aplicativo.
