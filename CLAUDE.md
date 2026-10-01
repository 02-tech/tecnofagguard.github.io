# Instruções do projeto: site oficial TECNOFAG GUARD® (tecnofagguard.com.br)

Este projeto pertence ao Núcleo FAGUITAL e segue o protocolo canônico em
`0_CENTRAL_ENGENHARIA/09_COLABORACAO_IA/PROTOCOLO_COORDENACAO_E_AJUDA.md`.

## Fonte canônica

- Raiz local: `C:/Users/FAGUITAL/PROJETOS/6_SITES/tecnofagguard.com.br` (clone do repositório oficial).
- Repositório: `github.com/02-tech/tecnofagguard.github.io`, branch `main` (GitHub Pages, domínio `tecnofagguard.com.br`,
  HTTPS forçado). Não criar segundo repositório nem implementação paralela.
- Estado: `docs/ESTADO_ATUAL.md` · Operação: `docs/RUNBOOK.md`.

## Regras do conteúdo público (do briefing de Guilherme, 2026-10-01)

- **Não vender o segredo. Vender o potencial.** Nada de detalhe técnico: componentes, placas, protótipos, diagramas,
  arquitetura, protocolos internos, mecanismo de funcionamento, telas internas. Ter acesso a arquivos do projeto
  não autoriza publicá-los. Imagens: só abstração (luz, partículas, linhas, foco); nunca representar o produto.
- Sem logotipo inventado: a assinatura é a tipografia `TECNOFAG GUARD®`. Grafia pública: `TECNOFAG GUARD`.
- Patente: nunca dizer que "já é patenteada". Usar "pedido de patente de invenção depositado junto ao INPI".
  Não publicar datas nem números de processos, nem a história do pedido anterior arquivado.
  A frase "Informações públicas estão disponíveis neste site." deve permanecer.
- 26/06/2024: "inicia sua trajetória junto ao INPI" (não dizer que foi depósito de patente).
- Aplicações são contextos em estudo, não produtos. Não publicar nomes internos (Pet, Saúde Crítica, Hotel etc.).
- Apoio não é investimento: nunca prometer retorno, participação, rendimento ou lucro. Pix/CNPJ só com dado validado.
- Contato: só canais oficiais validados. Não extrair contato de arquivos internos ou credenciais.
- Imperial Volt é OUTRA EMPRESA de Guilherme (não faz parte do ecossistema TECNOFAG GUARD). Aparece com força no bloco
  `#empresa` em Parcerias. Decisões de Guilherme, 2026-10-01.
- O criador é apresentado UMA vez, na definição, com o nome completo: "criado pelo prototipador Guilherme Carvalho de
  Andrade (FAGUITAL)". Não repetir quem criou nem quem é a empresa em outras seções.
- Sempre que "FAGUITAL" ou "Imperial Volt" aparecerem no texto visível, o nome é link (faguital.com.br e
  imperialvolt.com). Nunca usar botões do tipo "Conhecer a empresa".
- Sem duplicidade de sentido: cada ideia aparece uma vez, no lugar certo (a frase "Informações públicas estão
  disponíveis neste site." só em Propriedade intelectual).
- Redação em português do Brasil, sem traços ou travessões como separador.
- Todo o conteúdo existe em HTML real, legível sem JavaScript. Animações são camada visual.

## Antes de publicar

`node tools/verificar-conteudo.js auditar .` e `node tools/testar-site.js <url local> .capturas` (ver RUNBOOK).
