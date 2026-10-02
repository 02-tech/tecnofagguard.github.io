# Estado atual: site oficial TECNOFAG GUARD® (tecnofagguard.com.br)

> 2026-10-01 · CLAUDE (posição SITES, conta nucleo-faguital, sessão eef558ae…) · claim
> `claim-20261001-sites-nucleo-tecnofagguard-site-oficial-v1` · correlation `tecnofagguard-site-oficial-20261001`.
> Autorização: briefing completo de Guilherme (chat, 2026-10-01) para estruturar, desenvolver, testar e publicar,
> com uso dos dois Codex (gpt-6-astra).

## Infraestrutura (comprovada)

- Domínio do GitHub Pages da conta `02-tech`, repositório público `02-tech/tecnofagguard.github.io`, branch `main`.
- DNS no registro.br: apex com os 4 IPs do GitHub Pages; `www` CNAME para `02-tech.github.io` (redireciona para o apex).
- **HTTPS forçado ativado em 2026-10-01** (`https_enforced: true`); `http://` responde 301 para `https://`.
- Clone local criado em `6_SITES/tecnofagguard.com.br` (raiz de sites do `README.txt` da árvore; nome do domínio,
  mesmo padrão das demais pastas de `6_SITES`). Histórico Git preservado (placeholder original: `c86fcaa`).

## Site (v1 publicada nesta data)

- HTML/CSS/JS puros, sem build e sem dependências; todo o conteúdo em HTML semântico, legível sem JavaScript.
- Conteúdo: abertura com o slogan; definição direta "O que é"; ficha (nome, natureza, área, criador, origem, início 2023,
  situação, propriedade intelectual, site oficial); proposta; aplicações como contextos em estudo (sem produtos);
  trajetória 2023 a 2026 com o marco da marca; propriedade intelectual com as frases do briefing; criador
  (Guilherme Carvalho de Andrade, com "FAGUITAL" ligado a faguital.com.br); Imperial Volt como empresa de FAGUITAL,
  com presença forte em Parcerias (bloco `#empresa`) e link para imperialvolt.com; confidencialidade como etapa da
  conversa (sem NDA de entrada); apoio (não é investimento); perguntas diretas; contato.
- SEO: title, description, canonical, Open Graph e Twitter com imagem tipográfica 1200x630, robots.txt, sitemap.xml,
  JSON-LD (`WebSite`, `WebPage`, `Project` TECNOFAG GUARD com `founder`, `foundingLocation` Brasil, `brand`, `slogan`,
  `sameAs` Instagram; `Brand`; `Person` Guilherme Carvalho de Andrade / FAGUITAL com `affiliation` Imperial Volt;
  `Organization` Imperial Volt). Sem propriedades não comprovadas (data de fundação, endereço, telefone, logo, preço).
- Visual: camada de design e abertura pelo CODEX A (conta principal, gpt-6-astra, 2 rodadas); assinatura animada do ®
  pelo CODEX B (conta nucleo, gpt-6-astra, 2 rodadas, modo somente leitura com código devolvido em texto). Integração,
  revisão e ajustes pelo CLAUDE (fundo transparente e corte só horizontal na assinatura do ®).

## Validação antes da publicação (local, 2026-10-01)

- `node tools/testar-site.js`: 7 larguras (360 a 1920) sem rolagem horizontal, 0 imagens quebradas, 0 erros; conteúdo
  visível sem JS; movimento reduzido mostra tudo de imediato; 14 focos de teclado com foco visível, primeiro é
  "Pular para o conteúdo"; ® anima uma vez ao entrar, para, e faz replay ao tocar; celular lento simulado (CPU 4x,
  4G lenta): LCP 948 ms, CLS 0, tempo bloqueado 3 ms, 103 KB transferidos; 0 quadros de animação em repouso fora da abertura.
- `node tools/verificar-conteudo.js auditar .`: sigilo (nenhum termo técnico em arquivo publicado), grafia
  TECNOFAG GUARD, sem traços na redação, frases de PI presentes e nenhuma afirmação de "já patenteado", SEO e JSON-LD
  coerentes. `comparar`: o texto, links, meta tags e JSON-LD não foram alterados pelos Codex.
- Revisão visual por quadros: abertura (feixe, foco travando, convergência e marca se formando) e ® (selo dourado).

## Pendências que dependem de Guilherme

1. **Formas de apoio**: bloco `#apoio-meios` mostra "em breve". Falta o meio validado (ex.: chave Pix do projeto e titular).
2. **Contato**: só o Instagram oficial `@tecnofagguard.com.br` (citado como oficial no app TECNOFAG GUARD; sem login não
   foi possível confirmar o conteúdo do perfil). Falta e-mail ou WhatsApp oficiais do projeto. O domínio não tem MX.
3. Confirmar a frase do bloco `#empresa` ("Parcerias, propostas comerciais e acordos ... contam com a estrutura da
   Imperial Volt"): escrita a partir do pedido de Guilherme para a empresa aparecer com força em Parcerias.
4. Google Search Console: não há acesso autorizado nesta sessão. Para acelerar a descoberta: verificar a propriedade
   `tecnofagguard.com.br` (registro TXT no registro.br) e enviar `https://tecnofagguard.com.br/sitemap.xml`. Sem prazo garantido.
5. Teste em celular real (desempenho e sensação da abertura em aparelho físico).

## Rollback

`git revert` do commit desta publicação e `git push`; ou voltar ao placeholder `c86fcaa`. Ver `docs/RUNBOOK.md`.

## Publicação e validação em produção — 2026-10-01

- Commit `9616475` publicado em `main`; build do GitHub Pages `built` para esse commit.
- `https://tecnofagguard.com.br/` responde 200; `http://`, `https://www.` e `http://www.` respondem 301 para o apex HTTPS.
- Arquivos internos NÃO publicados (404): `docs/`, `tools/`, `CLAUDE.md`, `README.md`, `_config.yml`.
- Conteúdo servido idêntico ao local (index, CSS, JS, robots, sitemap). Sem `noindex`.
- `node tools/testar-site.js https://tecnofagguard.com.br/`: TODOS OS TESTES OK. Celular lento simulado: LCP 740 ms,
  CLS 0, tempo bloqueado 0 ms, 30 KB transferidos (com compressão do GitHub Pages).
- PageSpeed Insights (API pública): recusado com 429 (cota diária anônima esgotada); não executado. Repetir depois em
  https://pagespeed.web.dev/ ou com chave de API.

## Revisão editorial publicada: 2026-10-01 (pedidos de Guilherme no chat, com prints do celular)

Scripts que registram cada troca: `tools/revisao-editorial-20261001.js`, `...b.js`, `...c.js` (idempotentes).
- Criador apresentado uma vez, com nome completo, na definição: "criado pelo prototipador Guilherme Carvalho de Andrade
  (FAGUITAL)". Bloco curto "O criador" depois da Trajetória (petropolitano, ex-militar condecorado do Exército Brasileiro
  e prototipador), só com dados que ele já publica em faguital.com.br. Detalhes militares (infantaria, comunicações,
  montanha) ficam para o site pessoal, por recomendação, sem alterar aquele projeto.
- FAGUITAL e Imperial Volt são SEMPRE links no texto visível; nenhum botão "conhecer". Imperial Volt é outra empresa
  de Guilherme, não parte do ecossistema (frase "Uma iniciativa do ecossistema Imperial Volt" removida do rodapé).
- Duplicidades removidas: resumo da abertura, segundo parágrafo da definição, itens da ficha já ditos na definição,
  pilar "Tecnologia brasileira", concessão da marca repetida em PI, seção "Quem criou", seção de perguntas, segunda
  ocorrência de "Informações públicas estão disponíveis neste site.", lista de públicos repetida em Contato, descrição
  repetida no rodapé.
- Trajetória: novo marco "2019 e 2020: Antes da ideia" (estudos profundos, sem idealização do projeto); 2023 passa a ser
  o nascimento da ideia, já com identidade. Ficha: "Ideia 2023".
- Apoio ativo: chave Pix CNPJ 60.179.279/0001-44 (informada por Guilherme), titular Imperial Volt (link), botão para
  copiar a chave quando o navegador permite; aviso de que apoio não é investimento mantido.
- Testes locais: testar-site.js TODOS OK (LCP 924 ms, CLS 0); verificar-conteudo auditar TUDO OK.

## 2026-10-02: identidade digital unificada

- JSON-LD: a pessoa passou a usar o @id canônico `https://faguital.com.br/#person` e a empresa `https://imperialvolt.com/#organization` (antes eram nós locais deste site). `llms.txt` e `humans.txt` criados. Gerador em faguital.com.br/tools/entidade-20261002.js.
