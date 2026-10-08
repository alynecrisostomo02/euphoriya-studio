# Euphoriya — correção de direção e auditoria (2026-10-07)

**Decisão:** Fantasia Archive, Narra e Loreum são REFERÊNCIAS de recursos e engenharia, não modelos para identidade, navegação ou arquitetura visual. O shell original de Fantasia Archive não foi aprovado como base de Euphoriya.

**Inspeção:** branch `main` no commit `33bf65b7d1079cf8a1c1e57977dbb85bd6e97d40`. Contagens de arquivos versionados, com categorias que podem se sobrepor:

| Área | Arquivos | Leitura |
| --- | ---: | --- |
| `src/components`, `pages`, `layouts`, `css`, `stores`, `boot`, `router` | 1.681 | UI herdada; substituir conceito, sem copiar estética |
| `src-electron`, exceto `euphoriyaData` | 425 | infraestrutura a auditar; não reutilizar automaticamente |
| `src-electron/mainScripts/euphoriyaData` + `types/I_euphoriya*` | 7 | fundação do Data Core v1, tipos e teste — PRESERVAR |
| `narra/` | 223 | referência isolada, licença MIT |
| `loreum/` | 401 | referência isolada, licença AGPL |

O pacote ainda se chama `fantasia-archive`; `src/router/routes.ts` aponta para `MainLayout`, `SplashPage` e `IndexPage` herdados. Não foi comprovada uma UI nativa Euphoriya ou Data Core v2 no repositório remoto.

## Classificação de aproveitamento

**Preservar e testar:** SQL Euphoriya v1, FTS5, entidades, cânone, conhecimento, integridade referencial, tipos e testes; dados locais e backups existentes.

**Considerar como infraestrutura, mediante teste:** TypeScript/Vue, SQLite e adaptadores de projeto, APIs de arquivo, mídia, IPC seguro, testes, acessibilidade, sistema de localização. Não assumir que uma tecnologia exige manter o mesmo visual.

**Somente referência, não transportar:** menu, splash, cabeçalho, mascote, painel administrativo, visual fantasy existente, tema, ícones e templates de Fantasia Archive. Não copiar a implementação AGPL do Loreum sem revisão legal.

## Plano sem risco ao cânone

1. Congelar alterações da UI legada em `main` até a validação de novos conceitos.
2. Criar e revisar um protótipo original do Portal, depois Códice e Character Studio, para desktop e celular.
3. Só após aprovação criar interface nova, isolada do shell legado. Possível ponto de partida: Vue 3 + Vite; preservar/adaptar infraestrutura **por contrato**, não por cópia cega.
4. Definir repositorios `Characters`, `Canon`, `Story`, `Timeline` e `Media` com adaptadores distintos desktop e navegador; `better-sqlite3` não roda diretamente no browser.
5. Introduzir dados reais apenas com backups, migrações aditivas, testes e restauração verificada.
6. Validar modo offline, privacidade, performance e navegação acessível em celular/desktop antes de distribuição.

**Licenças:** o repositório raiz é GPL-3.0 por origem Fantasia Archive. Não presumir que código copiado se torna proprietário ao mudar aparência; manter avisos e proveniência.

**Critério de conclusão da fase:** três telas aprovadas pelo criador, nenhum layout Fantasia transplantado, Data Core preservado e nenhum arquivo de usuário modificado. Este documento não autoriza migração destrutiva ou deploy da nova UI.
