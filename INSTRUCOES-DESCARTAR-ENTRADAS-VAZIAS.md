# Descartar novas tarefas e projetos intocados

Ao abrir + Nova tarefa ou + Novo projeto, a entrada fica temporária até a primeira digitação ou alteração de campo. Ela não é enviada ao Notion, mesmo se outra entrada estiver sendo salva ao mesmo tempo.

Fechar pelo botão, pelo fundo do painel ou por Voltar descarta uma tarefa intocada. Voltar para a lista de projetos descarta um projeto intocado. Trocar de aba também descarta essas entradas. Abrir o formulário, focar um campo ou rolar a tela não registra a entrada.

Digitar ou alterar um campo, anexar um arquivo, criar um marco ou adicionar uma tarefa ao projeto inicia o salvamento normal. Depois dessa ação, a entrada é mantida ao fechar. Não são removidas entradas existentes nem entradas já modificadas, mesmo que ainda tenham o nome padrão.

Publique o conteúdo da pasta lifeos na raiz do repositório. Este pacote inclui as mudanças anteriores. Não são necessários novos bancos, propriedades do Notion ou variáveis da Vercel.

Os testes verificaram a ausência de envio de entradas intocadas, inclusive durante salvamentos paralelos, o descarte sem criação/exclusão remota e a preservação após alterações no título ou em outros campos.
