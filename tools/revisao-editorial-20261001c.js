// Revisão editorial 3 (2026-10-01, Guilherme): apresentação curta do criador, no momento certo da narrativa
// (logo depois da Trajetória, que termina mencionando o aniversário do criador). Só dados que o próprio Guilherme
// já publica em faguital.com.br. Idempotente. Uso: node tools/revisao-editorial-20261001c.js
"use strict";
const fs = require("fs"), path = require("path");
const f = path.join(__dirname, "..", "index.html");
let s = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const LINK_FAGUITAL = '<a href="https://faguital.com.br/" rel="noopener">FAGUITAL</a>';

const BLOCO = `
    <!-- CRIADOR: apresentação curta, sem currículo; dados públicos do próprio criador (faguital.com.br) -->
    <section class="secao criador" id="criador" aria-labelledby="titulo-criador">
      <p class="secao-rotulo">O criador</p>
      <h2 id="titulo-criador">Guilherme Carvalho de Andrade.</h2>
      <p>Petropolitano, ex-militar condecorado do Exército Brasileiro e prototipador, conhecido como ${LINK_FAGUITAL}. É quem conduz o TECNOFAG GUARD® da pesquisa à prototipagem.</p>
    </section>
`;
const ANCORA = "\n    <!-- PROPRIEDADE INTELECTUAL -->";

if (!s.includes('id="criador"')) {
  if (!s.includes(ANCORA)) throw new Error("âncora da seção de propriedade intelectual não encontrada");
  s = s.replace(ANCORA, BLOCO + ANCORA);
}
const PESSOA_DE = `        "alternateName": "FAGUITAL",
        "url": "https://faguital.com.br/",
        "nationality": { "@type": "Country", "name": "Brasil" },`;
const PESSOA_PARA = `        "alternateName": "FAGUITAL",
        "url": "https://faguital.com.br/",
        "description": "Petropolitano, ex-militar condecorado do Exército Brasileiro e prototipador, criador do TECNOFAG GUARD.",
        "homeLocation": { "@type": "Place", "name": "Petrópolis, Rio de Janeiro, Brasil" },
        "nationality": { "@type": "Country", "name": "Brasil" },`;
if (!s.includes(PESSOA_PARA)) {
  if (!s.includes(PESSOA_DE)) throw new Error("nó Person do JSON-LD não encontrado");
  s = s.replace(PESSOA_DE, PESSOA_PARA);
}
fs.writeFileSync(f, s);
console.log("ok");
