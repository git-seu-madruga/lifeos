# Limpeza do controle de navegação

Esta versão parte do pacote lifeos-pwa-standalone, confirmado como funcional no aparelho. O pacote anterior permanece disponível para retorno, se necessário.

Substitua os arquivos pelos da pasta lifeos deste ZIP e publique na Vercel. Feche e abra o aplicativo para carregar o código novo. Não é necessário reinstalar o PWA, pois o manifest continua exatamente igual ao da versão standalone. Não há mudanças nas bases do Notion, nas variáveis da Vercel ou no Google Cloud.

Removidos do controle de Voltar:
- Varredura do DOM para capturar elementos roláveis.
- Armazenamento e acompanhamento das posições de rolagem.
- Listener global de scroll.
- Correções explícitas com scrollTo/scrollTop/scrollLeft.
- Estado especial para a transição visual do navegador.

Mantidos:
- Standalone, que resolveu o flickering no aparelho.
- Login separado e reconhecimento automático da sessão.
- Dois toques para sair e Voltar para fechar os editores/subtelas.
- Aviso de saída separado da página.
- Rolagem interna mobile e bloqueio da rolagem atrás dos painéis.
- Um único par de entradas de histórico, sem acumular entradas a cada interação.
- Desativação da restauração automática de rolagem/foco nas transições internas, usando os mecanismos do navegador.

A mudança reduz código e trabalho executado durante a rolagem. Não foi medida uma diferença de velocidade; o objetivo principal é simplificar a manutenção e reduzir pontos de falha.

Validação: suíte automatizada completa e compilação de produção aprovadas. Um teste garante que o controle de Voltar não varre o DOM nem força a rolagem. Foi verificado que, entre os arquivos de funcionamento, apenas lib/backNavigation.js difere do pacote standalone confirmado. O teste visual em um aparelho real não foi executado neste ambiente.

Depois de publicar, confira Voltar dentro de um editor, primeiro/segundo Voltar em uma tela principal e abrir/fechar as notificações do Android.
