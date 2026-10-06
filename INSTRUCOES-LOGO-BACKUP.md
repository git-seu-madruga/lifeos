# Logo, menu da conta e backup manual

## Publicar a atualização

Este pacote é completo e inclui todas as alterações anteriores, inclusive Recados, Inbox e atualização ao retornar ao app. Copie o conteúdo da pasta lifeos para a raiz habitual do repositório e publique na Vercel.

O novo logo usa quatro quadrados azuis arredondados e a palavra LifeOS com OS azul. Foram atualizados o cabeçalho, a tela de login, o favicon e os ícones PWA/Apple. A opção Sair fica no menu aberto ao clicar no nome/avatar. Backup e restauração aparece nesse menu apenas para Péricles; a API valida o usuário principal configurado, além de ocultar a opção na interface. Não é uma nova aba principal.

Ícones de apps instalados podem permanecer em cache no Android ou iPhone. Atualize o app; se o ícone antigo permanecer, remova apenas o atalho/app instalado e instale novamente. Os dados continuam no Notion. Aguarde os salvamentos pendentes antes de remover o app.

## Configuração no Notion e na Vercel

1. Dentro da página LifeOS, crie uma **página vazia**, chamada **LifeOS — Backups**, separada dos bancos ativos. Não precisa criar bancos nem propriedades manualmente: o app cria os bancos de cada cópia dentro dessa página.
2. Autorize a conexão interna LifeOS na nova página. Ela precisa poder ler, inserir e atualizar conteúdo. Mantenha acesso a todos os bancos utilizados pelo app, incluindo os privados das duas contas. Restrinja o compartilhamento da página de backups, pois ela reúne os dados dos dois usuários.
3. Copie o ID dessa página (32 caracteres na URL, com ou sem hífens).
4. Na Vercel, crie a variável **NOTION_BACKUP_PAGE_ID** com esse ID no ambiente Production e, se necessário, Preview.
5. Mantenha as variáveis existentes de Notion, Google e Upstash. Faça um novo deploy depois da configuração.

## Criar um backup

Entre como Péricles, abra o menu da conta e escolha **Backup e restauração**. Clique em **Criar backup**, confirme e mantenha o painel aberto e visível até a conclusão.

O app salva primeiro suas edições pendentes. Depois, um bloqueio no servidor impede gravações das duas contas e de outras instâncias. Se outro salvamento já estiver em andamento, espere terminar e tente novamente. A outra conta recebe uma indicação de manutenção, ao verificar o estado ou tentar salvar. Rascunhos locais permanecem preservados. Nenhuma edição aceita depois do bloqueio é descartada silenciosamente.

A duração depende do volume de registros e anexos; o serviço limita o ritmo das consultas para respeitar a API do Notion. A execução é dividida em requisições curtas, sem agendamento ou serviço executando continuamente em segundo plano. Se você mudar de aplicativo ou fechar o painel, a operação pausa entre etapas. Ao voltar, use **Retomar**. O bloqueio expira após 15 minutos sem avanço; nessa situação cancele a operação pendente e inicie novamente. Bancos ativos permanecem intactos, inclusive durante a preparação de uma restauração.

Cada cópia tem uma página própria com bancos correspondentes aos bancos configurados no LifeOS. Inclui registros das duas contas, propriedades compatíveis, identificação de proprietário, relações internas, arquivos e corpos de página suportados. Os arquivos são baixados e enviados novamente ao Notion; seus endereços temporários não são usados como substituto de uma cópia. São conferidos registros, relações e o conteúdo binário dos anexos em propriedades e blocos. Só cópias concluídas entram na lista de restauração.

As três cópias mais recentes ficam na lista. Ao concluir uma nova, a mais antiga é arquivada no Notion. Isso não é exclusão permanente da lixeira e pode continuar ocupando espaço até a remoção definitiva pelo Notion. Cópias incompletas/canceladas não aparecem como restauráveis e podem ser removidas manualmente depois, pela página de backups.

## Restaurar

No mesmo painel, selecione **Restaurar** na cópia desejada e digite RESTAURAR na confirmação. As edições são bloqueadas, uma cópia completa do estado atual é feita e só então o backup escolhido é copiado para novos bancos de restauração. Após a verificação, o app ativa esses bancos em conjunto. **Os bancos ativos anteriores não são apagados nem sobrescritos.**

Os novos bancos ativos ficam numa página com nome iniciado por **Restaurado**. Não edite mais diretamente os bancos anteriores como se fossem os ativos. A identificação dos bancos ativos é mantida no Upstash; não limpe o Redis nem troque por uma instância vazia após restaurar. Um manifesto JSON dentro de cada backup também identifica seus bancos para recuperação administrativa. Não arquive páginas Restaurado que estejam em uso.

As variáveis originais dos bancos na Vercel permanecem como origem inicial; o mapeamento ativo após uma restauração é aplicado automaticamente pelo servidor. Para recuperar sem o mapa do Redis, um administrador precisará apontar todas as variáveis DATABASE_ID e DATA_SOURCE_ID para o conjunto correto, conferindo todas as relações. Isso não é feito automaticamente ao apagar o Redis.

Instâncias abertas verificam a liberação da manutenção quando estão visíveis. A API recusa gravações de uma versão anterior dos bancos após restaurar; atualize os dados para continuar. Se houver rascunho local conflitante, revise/copie o texto antes de confirmar o descarte pela atualização manual. O app não descarta esses textos automaticamente.

## Limites desta primeira versão

- O escopo são **os bancos configurados do LifeOS**, não todo o workspace do Notion. Não são clonados filtros/visualizações, permissões de compartilhamento, comentários nativos do Notion ou configurações externas ao aplicativo. Anotações e comentários armazenados nos campos do LifeOS são copiados.
- Capas que estejam apenas como URL externa, sem arquivo no campo Capa, precisam ser copiadas para o Notion antes; a operação não considera um link externo como cópia da imagem.
- Arquivos hospedados no Notion são suportados até **20 MB**, respeitando também o limite de upload do seu plano do Notion. Arquivos maiores e links de arquivo externos precisam ser regularizados antes; a operação falha explicitamente, sem marcar a cópia como completa. Não alteramos o limite normal de upload do app, que continua em 4 MB.
- Propriedades editáveis comuns são copiadas. Propriedades Status podem virar Selecionar no destino, preservando os nomes e as cores das opções. Fórmulas, rollups e outros tipos não suportados interrompem a cópia em vez de serem omitidos.
- Relações precisam apontar para bancos incluídos na cópia. Uma propriedade paginada com mais valores que os retornados pelo Notion interrompe a cópia nesta versão.
- Corpos de página comuns (texto, títulos, listas, tabelas, imagens e arquivos) são suportados. Blocos sincronizados, subpáginas/bancos dentro de entradas e outros blocos não suportados interrompem a cópia. Páginas com mais de 100 blocos diretos podem exigir uma evolução do mecanismo.
- Um backup com um conjunto de bancos diferente do atualmente configurado não é ativado automaticamente, para evitar deixar dados de bancos novos misturados aos antigos.
- O bloqueio abrange o aplicativo. Evitem alterações diretamente no Notion durante a operação. Alterações detectadas durante a conferência interrompem a cópia.
- Backup dentro do mesmo Notion não protege contra perda da conta/workspace. O controle de progresso, catálogo e ativação dos bancos usa o Upstash existente.

## Teste inicial recomendado

Crie uma cópia e confira os bancos, proprietários e anexos no Notion. Crie uma entrada temporária, faça outra cópia e teste a restauração da cópia anterior. Confira ambas as contas. O painel exige confirmação e mantém uma cópia do estado anterior à restauração.

Validação nesta entrega: testes simulados de administrador exclusivo, bloqueio das duas contas, retomada após falha, arquivos copiados e conferidos por hash, relações/proprietários preservados, restauração sem alterar originais, cópia prévia de segurança, cancelamento e retenção. Compilação de produção e testes existentes. Nenhuma operação foi executada nos seus bancos reais; o primeiro teste no seu workspace continua necessário.
