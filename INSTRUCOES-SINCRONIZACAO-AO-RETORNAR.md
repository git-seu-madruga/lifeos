# Atualização ao retornar ao LifeOS

Este pacote contém a versão completa, incluindo Recados e sua integração com o Inbox. Substitua os arquivos do repositório pelo conteúdo da pasta lifeos e publique na Vercel. Não é necessário criar novas variáveis, bancos ou serviços para esta atualização. Mantenha a configuração de Recados da versão anterior.

## Comportamento

- Ao retornar à aba do navegador ou ao aplicativo em primeiro plano, os dados são consultados novamente no Notion. Eventos de foco, visibilidade e retorno da página são agrupados; há intervalo mínimo de 10 segundos entre consultas automáticas.
- Não há consultas periódicas de atualização, nem buscas novas enquanto a página estiver oculta. Uma consulta ou salvamento já iniciado pode terminar após mudar de aplicativo; o sistema operacional pode suspender sua execução.
- A tela continua aberta durante a consulta. O botão de atualizar gira; a aba, os painéis e a posição de rolagem não são reiniciados deliberadamente. Se os próprios dados mudarem de tamanho, o conteúdo pode naturalmente ocupar outro espaço.
- Enquanto um painel de preenchimento estiver aberto, a atualização automática também fica adiada para preservar rascunhos que só serão aplicados ao clicar em Salvar. Após fechar o painel, a leitura é retomada se o app estiver visível.
- Se houver alterações locais pendentes ou salvamento em andamento, a leitura é adiada até o salvamento terminar com sucesso. Se houver falha ou conflito, o rascunho local permanece e o erro é exibido. O servidor mantém a comparação dos campos alterados para evitar sobrescrever alterações concorrentes.
- Se uma edição começar enquanto a consulta está em andamento, aquela resposta não substitui o texto digitado. Uma nova consulta é feita depois do salvamento, enquanto o app estiver visível.
- Os formulários ainda vazios de projetos e tarefas são preservados durante a atualização automática.
- “Dados atualizados às…” corresponde à última consulta bem-sucedida aplicada pelo app, automática, inicial ou manual. Na aba Recados, a consulta própria também atualiza esse indicador. O horário completo pode ser visto no computador passando o cursor sobre a informação.
- “Salvo no Notion” continua sendo a confirmação de gravação das edições, não a confirmação de uma leitura recente. Um salvamento sozinho não altera o horário das consultas.
- Recados também deixou de consultar em intervalos de 30 segundos. Atualiza ao abrir a aba, voltar ao foco ou clicar em Atualizar. O texto do rascunho não é substituído por uma atualização.

## Testar

1. Abra a mesma conta no computador e no celular. No computador, deixe uma aba diferente ativa.
2. Edite e salve no celular. Após ao menos 10 segundos desde a última consulta no computador, volte à aba LifeOS.
3. Confira a mudança e o novo horário, sem tela de carregamento inicial.
4. Repita com texto sendo editado no computador e uma alteração concorrente no mesmo campo pelo celular. O texto local deve continuar visível; se houver conflito no salvamento, o app apresenta o erro para revisão.
5. Alterne rapidamente entre apps: isso não deve iniciar repetidamente novas consultas.

Os testes automatizados cobrem retorno ao foco, ausência de consultas ocultas, eventos agrupados, edição durante uma consulta, consulta adiada após falha/salvamento e horário mantido quando a leitura falha. Também foi executada a compilação de produção. Android e iPhone físicos precisam ser verificados após o deploy.
