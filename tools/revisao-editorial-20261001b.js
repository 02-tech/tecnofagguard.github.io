// Revisão editorial 2 (2026-10-01, Guilherme): nome completo logo na definição; FAGUITAL e Imperial Volt sempre
// clicáveis no texto visível, sem botões; criador apresentado uma única vez; Imperial Volt é outra empresa de
// Guilherme, não parte do ecossistema. Idempotente. Uso: node tools/revisao-editorial-20261001b.js
"use strict";
const fs = require("fs"), path = require("path");
const f = path.join(__dirname, "..", "index.html");
let s = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const LINK_FAGUITAL = '<a href="https://faguital.com.br/" rel="noopener">FAGUITAL</a>';
const LINK_IV = '<a href="https://imperialvolt.com/" rel="noopener">Imperial Volt</a>';

const trocas = [
  // meta e JSON-LD: nome completo (o público ainda não conhece o nome artístico)
  ['content="Ecossistema brasileiro de identificação digital criado por FAGUITAL. O TECNOFAG GUARD® conecta o mundo físico a experiências digitais com hardware e software."',
   'content="Ecossistema brasileiro de identificação digital criado por Guilherme Carvalho de Andrade (FAGUITAL), que conecta o mundo físico a experiências digitais."'],
  ['"description": "Site oficial do TECNOFAG GUARD®, ecossistema brasileiro de identificação digital criado por FAGUITAL."',
   '"description": "Site oficial do TECNOFAG GUARD®, ecossistema brasileiro de identificação digital criado por Guilherme Carvalho de Andrade (FAGUITAL)."'],
  ['"description": "O TECNOFAG GUARD® é um ecossistema brasileiro de identificação digital criado por FAGUITAL, desenvolvido para',
   '"description": "O TECNOFAG GUARD® é um ecossistema brasileiro de identificação digital criado pelo prototipador Guilherme Carvalho de Andrade (FAGUITAL), desenvolvido para'],
  // definição: nome completo + FAGUITAL clicável
  ['é um ecossistema brasileiro de identificação digital criado por <strong>FAGUITAL</strong>, desenvolvido para',
   `é um ecossistema brasileiro de identificação digital criado pelo prototipador <strong>Guilherme Carvalho de Andrade</strong> (${LINK_FAGUITAL}), desenvolvido para`],
  // seção "Quem criou" removida: o criador já é apresentado na definição
  [/\n    <!-- CRIADOR E ECOSSISTEMA -->\n    <section class="secao criador"[\s\S]*?<\/section>\n/, '\n'],
  // bloco da empresa: sem repetir o criador; os dois nomes clicáveis
  [`contam com a estrutura da ${LINK_IV}, empresa de Guilherme Carvalho de Andrade (${LINK_FAGUITAL}), criador do projeto. A Imperial Volt atua com sites, sistemas, aplicativos e soluções sob medida.`,
   `contam com a estrutura da ${LINK_IV}, empresa de ${LINK_FAGUITAL} que atua com sites, sistemas, aplicativos e soluções sob medida.`],
  // titular do Pix: nome da empresa clicável
  ['<div><dt>Titular</dt><dd>Imperial Volt</dd></div>', `<div><dt>Titular</dt><dd>${LINK_IV}</dd></div>`]
];
let aplicadas = 0;
for (const [de, para] of trocas) {
  if (de instanceof RegExp) { if (de.test(s)) { s = s.replace(de, para); aplicadas++; } continue; }
  if (s.includes(de)) { s = s.replace(de, para); aplicadas++; continue; }
  if (para && s.includes(para)) continue;
  throw new Error("trecho não encontrado: " + de.slice(0, 100));
}
fs.writeFileSync(f, s);
console.log(`trocas aplicadas: ${aplicadas} de ${trocas.length}`);
