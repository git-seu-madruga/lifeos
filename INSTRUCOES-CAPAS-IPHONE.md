# Atualização: cópia das capas no Notion e abas no iPhone

Este pacote completo parte da versão Entretenimento e mantém as demais funcionalidades, login, PWA e salvamento seletivo.

## Capas

Ao escolher um resultado de livro ou série, a opção **Salvar uma cópia da capa no Notion** vem marcada. Ao clicar **Salvar conteúdo**, a imagem é baixada e enviada ao campo **Capa** do Notion antes de gravar o conteúdo. Aguarde **Salvo no Notion** para confirmar a gravação completa. A cópia passa a ser exibida pelo app independentemente do endereço da fonte original; o link de origem é preservado para referência.

Para capas antigas importadas por link, abra o conteúdo, mantenha a opção de cópia marcada e salve. Não há migração em massa automática.

Se quiser somente usar o link, desmarque a opção. Se a fonte estiver indisponível ou redirecionar para um endereço não suportado, o app mostra o erro; você pode tentar novamente, enviar manualmente ou manter o link. O limite continua sendo 4 MB por capa. Download automático aceita apenas URLs de capas da Open Library e do TVmaze, com verificação do endereço, redirecionamentos, tamanho e formato da imagem. Links manuais de outros sites podem ser exibidos, mas para guardar a imagem desses sites use upload manual.

Nenhum novo campo precisa ser criado: o campo Capa (Arquivos e mídia) já faz parte do banco Conteúdos de entretenimento. Não há exclusão de imagens nem outras alterações nos bancos durante a atualização.

## Abas no iPhone e demais celulares

A implementação anterior bloqueava o gesto horizontal nativo com touch-action: pan-y e tentava rolar por JavaScript, capturando o ponteiro. Isso era uma possível incompatibilidade com o Safari. Agora a rolagem é nativa, sem captura do gesto normal e sem barra de rolagem visível.

- Deslize a barra de abas para a esquerda ou direita para acessar as demais.
- Para reordenar, toque no pequeno botão com setas ao lado da barra.
- Arraste uma aba até a posição desejada. Aproximar o dedo das bordas ajuda a rolar durante a ordenação.
- Toque no ✓ para concluir e voltar à rolagem normal.

No computador, o arraste e Alt + seta continuam funcionando. A ordem das abas permanece salva no navegador/dispositivo; a primeira aba continua sendo a visualização inicial.

## Publicar e conferir

1. Aguarde Salvo no Notion para os dados pendentes.
2. Extraia o ZIP e substitua os arquivos do repositório pelo conteúdo da pasta lifeos.
3. Faça deploy na mesma Vercel. Não altere variáveis de ambiente nem Google ou Upstash.
4. Feche e abra novamente o PWA. Se a versão antiga persistir, atualize pelo navegador e confira o novo botão de ordenação no celular.
5. No iPhone da Letícia, deslize as abas começando sobre um botão e também sobre os espaços entre eles. Confira que alcança Entretenimento.
6. Teste a ordenação e saia desse modo pelo ✓.
7. Importe uma capa, salve e confira no Notion que Capa contém um arquivo hospedado, e URL da capa ficou vazia.

Compilação e testes automatizados passaram, incluindo cópia com respostas simuladas, autenticação, proteção de anexos, limites e ausência de captura do toque na rolagem normal. O comportamento foi revisado no código; não houve teste em um iPhone real nem reprodução do problema no aparelho da Letícia. A conferência após deploy é necessária para confirmar o resultado no dispositivo.
