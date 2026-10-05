# Atualização: salvamento seletivo e tamanho dos contextos

Pacote completo baseado na versão PWA com login Google de dois usuários.

## Publicar

1. Aguarde Salvo no Notion para as alterações pendentes.
2. Extraia o ZIP e substitua os arquivos do GitHub pelo conteúdo da pasta lifeos.
3. Faça o deploy no mesmo projeto da Vercel.
4. Feche e abra o PWA para carregar a versão nova; no navegador, atualize a página.

Não é necessário alterar bancos ou propriedades do Notion, variáveis da Vercel, Google OAuth ou Upstash.

## Mudanças

O salvamento consulta apenas os bancos envolvidos na alteração e as dependências de relações. Compras, Contatos, Inbox e Diário são independentes. Finanças usa Categorias e Lançamentos; Hábitos usa Hábitos e Registros; Projetos, Marcos e Tarefas são consultados como grupo para manter a validação dos vínculos. Conversões do Inbox incluem também o banco de origem e os bancos do destino. Sem alterações, não há consultas aos bancos para sincronizar.

Esta otimização seleciona bancos; ainda lê os registros dos bancos selecionados. Não implementa consultas individuais por página. A carga inicial e o botão Atualizar continuam buscando todos os bancos, para mostrar um estado completo. Os controles de proprietário, conflitos, vínculos, recuperação após falha, anexos e coordenação das gravações continuam ativos.

Os contextos usam a mesma largura de grupo e a mesma altura e distribuição de botões quando habilitados ou bloqueados. As cores continuam indicando seleção e disponibilidade.

## Validação

Testes automatizados verificam quais bancos são efetivamente consultados em edições de Compras, Diário, Finanças, Tarefas e Registros de hábitos, e ausência de consulta quando não há alteração. A suíte também verifica isolamento entre contas, conflitos, conversões e reenvio após falhas. O tempo real após deploy depende da rede e das respostas do Notion e Redis; não foi medida a latência em produção.
