# Atualização: ano das séries e livros em português

1. Substitua os arquivos do projeto no GitHub pelos arquivos da pasta `lifeos` deste pacote, preservando suas variáveis de ambiente.
2. Aguarde o deploy da Vercel e atualize o aplicativo.
3. Na base Entretenimento do Notion, o aplicativo cria automaticamente a propriedade `Ano`, do tipo Número, na primeira sincronização. Não é necessário criar outro banco nem adicionar variáveis na Vercel. Caso já exista uma propriedade com esse nome, ela deve ser do tipo Número.
4. Ao buscar e importar uma série, o ano de estreia é preenchido quando a TVmaze o informa. Você pode corrigir ou apagar esse ano no editor; ele aparece no cartão e fica salvo no Notion. Os registros antigos não são preenchidos retroativamente: abra o conteúdo e importe novamente para obter o ano.
5. A busca de livros prioriza português na Open Library e usa o título e a capa da edição selecionada pelo catálogo. Digite o título em português. Se a edição/capa não estiver disponível, podem aparecer outros idiomas; continua possível editar o título e enviar uma capa manualmente. A preferência não traduz títulos nem imagens.

A cópia das capas no Notion permanece habilitada por padrão. Demais instruções de configuração inicial estão em INSTRUCOES-ENTRETENIMENTO.md.

Validação: suíte de testes e compilação de produção. Não foi realizado deploy nem alteração direta nos bancos em produção.
