# Euphoriya — contrato visual v0 (a aprovar)

Esta é uma proposta para avaliação; **não é cânone visual aprovado**.

## Princípio

Um **códice fantástico vivo**, entre manuscrito raro, atlas astronômico antigo, livro ilustrado e graphic novel adulta. Místico, etéreo, encantado e vintage. Não parecer um painel SaaS, gerenciador de tarefas, inventário genérico de RPG ou Souls-like.

**Paleta de exploração:** noite/tinta `#0D1A20`; azul petróleo `#172C32`; papel `#E9DDC2`; papel sombra `#D5C49D`; metal ouro antigo `#B79259`; azul arcano `#597C82`; vinho `#784C5B`; tinta em papel `#302A24`. Ajustar após feedback visual. Títulos serif editoriais, texto menor confortável. Fontes offline.

**Movimento:** brilho discreto nas constelações, tinta que se revela, runas/poeira **somente quando melhorarem orientação**; respeitar movimento reduzido e celulares modestos.

## Arquitetura de experiência

- **Portal:** universo/projeto recente, uma chamada central `Abrir o Códice`; atalhos para Personagens, Crônicas e Atlas. Pouca informação por vez, sem gráficos administrativos.
- **Códice:** índice enciclopédico por povos, clãs, deuses, lugares, artefatos e regras; fichas ligadas umas às outras.
- **Character Studio:** folio de personagem com arte canônica fornecida pelo autor, identidade, aparência, psicologia, relações, segredos, conhecimento e evolução. Alternância clara leitura/edição.
- **Crônicas:** eras, histórias, arcos, capítulos, cenas, POV e fios narrativos; consulta de conhecimento por cena.
- **Atlas:** geografia, estruturas celestes, mapas e localização de entidades; contexto da narrativa.

## Restrições

- Não inventar retratos/designs canônicos nem alterar estados `CANON` sem o autor.
- Interface funcional para escrita prolongada: legibilidade > textura, ações claras > enfeite.
- Estruturas de conteúdo reais e edição dependem de persistência validada; protótipos devem mostrar dados **fictícios ou claramente ilustrativos**.
- Offline e privado por padrão; não subir lore privado em serviços públicos.
- Responsivo: avaliar 1440px, tablet e 390px, inclusive teclado e toque.

## Portão de aprovação

Validar visualmente **Portal**, **Códice**, **Character Studio** com duas resoluções cada. Para cada tela: o usuário aprova/reprova/ajusta. Só implementar shell de produção e conexão com bancos após aprovação explícita. Preservar o legado intacto para comparação e recuperação.
