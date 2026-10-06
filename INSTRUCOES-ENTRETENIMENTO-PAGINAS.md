# Entretenimento: páginas por seção e histórico de conclusão

Atualize os arquivos do GitHub com a pasta lifeos deste pacote, aguarde o deploy da Vercel e atualize a página ou o app instalado.

## Navegação

A tela inicial apresenta quatro cartões grandes: Leitura, Filmes, Jogos e Séries, com seus ícones e cores. Ao clicar, abre a página daquela seção, ocupando a área principal. Use “‹ Entretenimento” para voltar.

Cada página apresenta os grupos de conteúdos em andamento, planejados e concluídos, com rótulos próprios (Lendo, Quero ler, Lido, por exemplo). Busca e filtros funcionam dentro da seção. O botão “+” cria um conteúdo diretamente nela.

## Data obrigatória ao concluir

O botão de marcar como concluído abre uma janela para informar a data. Ela começa preenchida com hoje e pode ser alterada. Confirmar salva o status e a data juntos; cancelar não altera o conteúdo.

No editor, escolher o progresso Concluído também exige uma data válida para salvar. O campo tem máscara DD/MM/AAAA, calendário e completa o ano atual ao digitar apenas dia e mês e sair com Tab. A data fica visível no cartão individual e pode ser corrigida no editor.

Ao voltar um conteúdo para planejado ou em andamento no editor, sua data de conclusão é limpa. Um conteúdo tem uma data de conclusão, não um histórico de múltiplas releituras/rejogadas.

## Resumos

A página de cada seção inclui resumo por mês e resumo por ano, com seletores próprios. Os itens mostram apenas capa e título e podem ser clicados para abrir o editor. A data de conclusão determina em qual mês e ano o conteúdo aparece. Os resumos são independentes da busca/filtro dos grupos acima.

Conteúdos antigos concluídos sem data continuam no grupo de concluídos. Informe a data no editor para incluí-los nos resumos. A atualização não inventa datas nem altera esses conteúdos automaticamente.

## Notion e Vercel

O app cria automaticamente a propriedade **Concluído em**, do tipo **Data**, na base de conteúdos de Entretenimento. Se já existir uma propriedade com esse nome, ela deve ser desse tipo. Não há novos bancos nem variáveis de ambiente.

Mantém todas as funcionalidades anteriores, incluindo capas copiadas no Notion, importação de livros/séries/jogos, ano e plataformas dos jogos, links clicáveis e encerramento de hábitos com confirmação.

Validação: suíte do aplicativo, navegação inicial e página de Leitura, agrupamento de conteúdos, seleção por mês/ano, datas inválidas, preservação de concluídos antigos e bloqueio da nova conclusão sem data no servidor. Compilação de produção concluída. Não foi realizado deploy nem alteração direta dos dados em produção.
