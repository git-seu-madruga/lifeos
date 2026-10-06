# Encerrar e recuperar hábitos

Atualize os arquivos do GitHub com a pasta lifeos do pacote e aguarde o deploy da Vercel. Atualize a página ou app instalado depois do deploy.

## Uso

- No editor de um hábito, clique em Encerrar hábito. Ele sai dos cards diários e do acompanhamento padrão, mas todas as marcações ficam preservadas.
- Clique em Mostrar hábitos encerrados para consultar seu histórico no acompanhamento por mês ou ano. Há opções Recuperar e editar junto ao nome do hábito encerrado.
- Recuperar reativa o mesmo hábito, com a data de início e o histórico originais. Nenhuma marcação é criada para o período em que ficou encerrado; esses dias contam como não marcados.
- Ao criar ou renomear um hábito, nomes repetidos são avisados, ignorando diferenças de maiúsculas e espaços adicionais. Se o existente estiver encerrado, o editor oferece Recuperar hábito existente. Recuperar mantém nome, cor e ícone do cadastro original.
- Excluir hábito continua sendo uma ação distinta, que remove o hábito e as marcações após confirmação. Para conservar o histórico, use Encerrar.

## Notion e Vercel

O app cria automaticamente a propriedade Encerrado, do tipo Caixa de seleção, no banco Hábitos na primeira sincronização. Se já existir uma propriedade com esse nome, ela deve ter esse tipo. Os hábitos antigos ficam ativos por padrão. Não há novos bancos nem variáveis de ambiente. O encerramento é individual por usuário, assim como os hábitos existentes.

Validação: suíte do aplicativo, testes de persistência do encerramento e recuperação com preservação do ID e marcações, reconhecimento de nomes repetidos, ocultação dos encerrados e compilação de produção. Não foi realizado deploy.
