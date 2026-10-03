# LifeOS (versão de teste)

Next.js 15 + React 19. Tarefas, projetos e Inbox são salvos automaticamente no IndexedDB do navegador, incluindo os arquivos dos anexos. Ainda não há integração com Notion nem sincronização entre dispositivos.

## Rodar

- `npm install` e `npm run dev` para desenvolvimento.
- `npm run build` e `npm start` para produção.
- Na Vercel, importe o repositório. Não são necessárias variáveis de ambiente.

## Dados locais

Na primeira abertura são carregados dados fictícios. Espere o indicador “Salvo neste navegador” antes de fechar a página. O botão Atualizar preserva os dados. Limpar os dados do site, usar outro navegador ou outro domínio não mantém os registros e anexos locais.

## Datas e projetos

Digite DD/MM e pressione Tab para completar o ano atual, ou informe DD/MM/AAAA. Também há um seletor de calendário. Datas inválidas e marcos posteriores ao prazo final do projeto são bloqueados. Sem prazo final, os marcos são livres. Antecipar o prazo final exige ajustar antes os marcos posteriores.

Projetos têm status Ativo, Pausado, Concluído e Cancelado. Excluir um projeto exige confirmação, remove seus anexos e mantém as tarefas sem projeto e sem marco. Não há histórico de exclusão.

Os anexos podem ser incluídos, abertos, baixados, arquivados e restaurados. Arquivar preserva o arquivo; a visualização depende do suporte do navegador ao formato.

## Estrutura

- `app/page.js`: estado geral e salvamento automático.
- `lib/storage.js`: persistência local.
- `lib/nav.js`: navegação.
- `components/TasksView.js` e `components/ProjectsView.js`: telas principais.
- `components/DateInput.js`: entrada de datas e calendário.
- `components/ProjectAttachments.js`: anexos e arquivamento.
- `app/globals.css`: visual e responsividade.
