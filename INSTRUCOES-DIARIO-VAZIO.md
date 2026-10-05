# Diário: apagar o texto volta ao estado vazio

Atualize os arquivos do GitHub com a pasta lifeos deste pacote e aguarde o deploy da Vercel. Depois atualize a página ou o aplicativo instalado.

Ao apagar todo o texto de um dia, a bolinha desaparece e o editor volta ao estado de uma entrada nova. Espaços e quebras de linha sozinhos também contam como texto vazio. O comportamento vale ao fechar e reabrir a data.

Uma entrada sem texto e sem anexos é removida pelo salvamento automático. Se houver anexos, eles são preservados, mas o dia continua sem a bolinha de texto e disponível para escrever. Entradas vazias antigas também aparecem no estado vazio.

Não é necessário alterar bancos no Notion ou variáveis da Vercel. Este pacote mantém as correções e funcionalidades anteriores.

Validação: testes do Diário e compilação de produção. Não foi feito deploy nem alteração nos dados de produção.
