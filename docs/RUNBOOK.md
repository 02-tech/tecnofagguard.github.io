# RUNBOOK: site oficial TECNOFAG GUARD® (tecnofagguard.com.br)

## Onde está

- Local: `C:\Users\FAGUITAL\PROJETOS\6_SITES\tecnofagguard.com.br`
- GitHub: `02-tech/tecnofagguard.github.io`, branch `main`, publicado pelo GitHub Pages (build Jekyll padrão).
  `gh` logado como `02-tech` (admin). Domínio: `CNAME` = `tecnofagguard.com.br`; DNS no registro.br
  (apex com os 4 IPs do GitHub Pages, `www` CNAME para `02-tech.github.io`). HTTPS forçado (ativado em 2026-10-01).
- `_config.yml` exclui do site publicado: `docs/`, `tools/`, `CLAUDE.md`, `README.md`. Conferir após cada mudança
  de estrutura que esses caminhos respondem 404 no ar.

## Estrutura

```
index.html                 conteúdo completo (HTML semântico, JSON-LD, metadados)
assets/css/site.css        design do site
assets/css/fx-marca.css    assinatura animada do ® no rodapé
assets/js/site.js          menu
assets/js/fx-abertura.js   abertura, fundo e revelações de seção (camada visual)
assets/js/fx-marca.js      animação do ® (uma vez ao entrar; replay ao tocar no ®)
assets/img/og-tecnofag-guard.png   imagem de compartilhamento (gerada por tools/gerar-og.js a partir de tools/og.html)
favicon.svg                abstrato (anel de foco), NÃO é logotipo; trocar se houver identidade gráfica aprovada
robots.txt, sitemap.xml    SEO
tools/                     testes e utilitários (não publicados)
docs/                      estado e operação (não publicados)
```

Sem build e sem dependências: HTML, CSS e JavaScript puros.

## Testar localmente

```
cd C:\Users\FAGUITAL\PROJETOS\6_SITES\tecnofagguard.com.br
python -m http.server 8840 --bind 127.0.0.1          (em outro terminal)
node tools/verificar-conteudo.js auditar .            (sigilo, grafia, traços, PI, SEO, JSON-LD)
node tools/testar-site.js http://127.0.0.1:8840/ .capturas
```

`testar-site.js` cobre 7 larguras, sem JavaScript, movimento reduzido, teclado, animação do ® e métricas com celular
lento simulado (CPU 4x, 4G lenta). Ele sempre fecha o Chrome que abre. Se um teste falhar de forma estranha, antes
de culpar o código: medir a CPU e procurar Chrome headless órfão (lição LESSON-20261001-171726-70B5A8).

Para provar que uma mudança visual não alterou texto, links, meta tags ou JSON-LD:
`node tools/verificar-conteudo.js comparar <index antigo> <index novo>`.

## Publicar

```
git add -A && git commit -m "..." && git push origin main
```

O GitHub Pages publica em cerca de 1 minuto. Conferir: `gh api repos/02-tech/tecnofagguard.github.io/pages/builds/latest`
e rodar `node tools/testar-site.js https://tecnofagguard.com.br/ .capturas-producao`.

## Ativar pendências quando houver dado validado

- **Formas de apoio** (`#apoie`, bloco `#apoio-meios`, hoje `data-ativo="false"` com aviso "em breve"): substituir o
  aviso pelo meio validado (ex.: chave Pix do projeto e titular). Nunca usar dado não confirmado por Guilherme.
- **Contato** (`#contato`, lista `#canais`): hoje só o Instagram oficial. Acrescentar e-mail ou WhatsApp oficiais
  do TECNOFAG GUARD quando existirem (o domínio não tem e-mail: sem registro MX).
- Ao adicionar perfis oficiais, incluir também em `sameAs` do JSON-LD.
- Novas páginas (sobre, história, imprensa, atualizações): criar pasta com `index.html` (ex.: `/imprensa/`), mesmo
  cabeçalho e rodapé, canonical próprio, e acrescentar ao `sitemap.xml`.

## Rollback

`git revert <commit>` e `git push`, ou voltar ao commit anterior. O placeholder original é o commit `c86fcaa`.
Para desfazer o HTTPS forçado: `gh api -X PUT repos/02-tech/tecnofagguard.github.io/pages -F https_enforced=false`
(não recomendado).
