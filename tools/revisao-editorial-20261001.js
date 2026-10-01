// Revisão editorial de 2026-10-01 pedida por Guilherme (registro do que mudou e por quê; idempotente).
// - links externos centralizados no bloco da empresa (Imperial Volt e FAGUITAL clicáveis), sem botão;
// - sem duplicidade de sentido no site (cada ideia aparece uma vez, no lugar certo);
// - trajetória: estudos de 2019 e 2020 antes da ideia de 2023;
// - apoio: chave Pix (CNPJ da Imperial Volt) informada por Guilherme.
// Uso: node tools/revisao-editorial-20261001.js
"use strict";
const fs = require("fs"), path = require("path");
const f = path.join(__dirname, "..", "index.html");
let s = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");

const trocas = [
  // ABERTURA: o "ecossistema brasileiro" fica só na definição, logo abaixo
  ['        <p class="abertura-resumo">Um ecossistema brasileiro de identificação digital.</p>\n', ''],

  // O QUE É: o parágrafo 2 repetia Aplicações e Proposta; a ficha passa a ter só fatos que não estão na definição
  ['      <p>O projeto pesquisa e desenvolve novas possibilidades de identificação aplicáveis a diferentes contextos. Desenvolvido para explorar essas possibilidades, ele evolui para diferentes formatos, aplicações e cenários de uso.</p>\n', ''],
  [`        <div><dt>Nome</dt><dd>TECNOFAG GUARD®</dd></div>
        <div><dt>Natureza</dt><dd>Projeto e ecossistema brasileiro de tecnologia</dd></div>
        <div><dt>Área</dt><dd>Identificação digital e integração entre o mundo físico e experiências digitais, com hardware e software</dd></div>
        <div><dt>Criador</dt><dd>Guilherme Carvalho de Andrade (FAGUITAL)</dd></div>
        <div><dt>Origem</dt><dd>Brasil</dd></div>
        <div><dt>Início da trajetória</dt><dd>2023</dd></div>
        <div><dt>Situação</dt><dd>Em desenvolvimento</dd></div>
        <div><dt>Propriedade intelectual</dt><dd>Pedido de patente de invenção depositado junto ao INPI e marca concedida</dd></div>
        <div><dt>Site oficial</dt><dd><a href="https://tecnofagguard.com.br/">tecnofagguard.com.br</a></dd></div>`,
   `        <div><dt>Origem</dt><dd>Brasil</dd></div>
        <div><dt>Ideia</dt><dd>2023</dd></div>
        <div><dt>Situação</dt><dd>Em desenvolvimento</dd></div>
        <div><dt>Site oficial</dt><dd><a href="https://tecnofagguard.com.br/">tecnofagguard.com.br</a></dd></div>`],

  // PROPOSTA: pilares sem repetir Aplicações (pessoas, objetos), Origem (Brasil) nem PI (INPI)
  ['<p>Reconhecer pessoas, objetos e contextos e transformar esse reconhecimento em informação útil.</p>',
   '<p>Transformar o reconhecimento em informação útil, no momento em que ela é necessária.</p>'],
  [`          <h3>Tecnologia brasileira</h3>
          <p>Idealizado e desenvolvido no Brasil, com propriedade intelectual em proteção junto ao INPI.</p>`,
   `          <h3>Formatos em evolução</h3>
          <p>Uma base que se desdobra em diferentes formatos, aplicações e cenários de uso.</p>`],

  // TRAJETÓRIA: estudos antes da ideia; 2023 é o nascimento da ideia já com identidade
  [`        <li>
          <p class="marco-data"><time datetime="2023">2023</time></p>
          <h3>Onde tudo começou.</h3>
          <p>Uma ideia começa a tomar forma. Ainda distante do que o TECNOFAG GUARD se tornaria, mas já com a essência que conduziria toda a sua evolução.</p>
        </li>`,
   `        <li>
          <p class="marco-data"><time datetime="2019">2019</time> e <time datetime="2020">2020</time></p>
          <h3>Antes da ideia.</h3>
          <p>Começam estudos profundos, ainda sem a idealização de um projeto. É nesse período que se forma a base de conhecimento que, mais tarde, tornaria a ideia possível.</p>
        </li>
        <li>
          <p class="marco-data"><time datetime="2023">2023</time></p>
          <h3>Onde tudo começou.</h3>
          <p>A ideia do TECNOFAG GUARD nasce, já com a essência e a identidade que conduziriam toda a sua evolução.</p>
        </li>`],

  // PROPRIEDADE INTELECTUAL: a concessão da marca é contada na trajetória
  ['<p>O TECNOFAG GUARD possui tecnologia com pedido de patente de invenção depositado junto ao INPI, o Instituto Nacional da Propriedade Industrial. A marca TECNOFAG GUARD® foi concedida.</p>',
   '<p>O TECNOFAG GUARD possui tecnologia com pedido de patente de invenção depositado junto ao INPI, o Instituto Nacional da Propriedade Industrial.</p>'],

  // CRIADOR: sem links (centralizados no bloco da empresa) e sem repetir a Imperial Volt
  [`      <p>O TECNOFAG GUARD® foi criado por Guilherme Carvalho de Andrade (<a href="https://faguital.com.br/" rel="noopener">FAGUITAL</a>), prototipador e desenvolvedor brasileiro de tecnologias aplicadas, também dono da Imperial Volt. O TECNOFAG GUARD® é um projeto próprio, com identidade e trajetória próprias.</p>
      <p>A <a href="https://imperialvolt.com/" rel="noopener">Imperial Volt</a> é a empresa de FAGUITAL, dedicada a sites, sistemas, aplicativos e soluções sob medida, e dá a estrutura empresarial às parcerias do projeto.</p>`,
   `      <p>O TECNOFAG GUARD® foi criado por Guilherme Carvalho de Andrade, conhecido como FAGUITAL, prototipador e desenvolvedor de tecnologias aplicadas. É um projeto próprio, com identidade e trajetória próprias.</p>`],

  // PARCERIAS: bloco da empresa = ponto oficial dos links externos; sem botão
  [`        <p>Parcerias, propostas comerciais e acordos envolvendo o TECNOFAG GUARD® contam com a estrutura da <a href="https://imperialvolt.com/" rel="noopener">Imperial Volt</a>, empresa de Guilherme Carvalho de Andrade (FAGUITAL), criador do TECNOFAG GUARD®. A Imperial Volt atua com sites, sistemas, aplicativos e soluções sob medida.</p>
        <a class="botao" href="https://imperialvolt.com/" rel="noopener">Conhecer a Imperial Volt</a>`,
   `        <p>Parcerias, propostas comerciais e acordos envolvendo o TECNOFAG GUARD® contam com a estrutura da <a href="https://imperialvolt.com/" rel="noopener">Imperial Volt</a>, empresa de Guilherme Carvalho de Andrade (<a href="https://faguital.com.br/" rel="noopener">FAGUITAL</a>), criador do projeto. A Imperial Volt atua com sites, sistemas, aplicativos e soluções sob medida.</p>`],
  // a frase "Informações públicas..." fica só em Propriedade intelectual
  ['<p>Informações públicas estão disponíveis neste site. Quando uma conversa exigir informações técnicas reservadas,',
   '<p>Quando uma conversa exigir informações técnicas reservadas,'],

  // APOIE: sem repetir "brasileiro" três vezes; chave Pix validada por Guilherme
  ['      <p>O TECNOFAG GUARD é um projeto brasileiro independente em desenvolvimento.</p>\n      <p>Se você acredita no potencial da tecnologia nacional',
   '      <p>O TECNOFAG GUARD é um projeto independente em desenvolvimento. Se você acredita no potencial da tecnologia nacional'],
  [`      <div class="apoio-meios" id="apoio-meios" data-ativo="false">
        <p class="apoio-em-breve">As formas de apoio serão publicadas em breve nesta página. Enquanto isso, você pode falar com o projeto pelos canais de contato.</p>
      </div>`,
   `      <div class="apoio-meios" id="apoio-meios" data-ativo="true">
        <p>Cada apoio ajuda a manter a pesquisa, a prototipagem e o desenvolvimento em andamento. O apoio pode ser feito por Pix:</p>
        <dl class="pix">
          <div><dt>Chave Pix (CNPJ)</dt><dd><span class="pix-chave" id="pix-chave" data-chave="60179279000144">60.179.279/0001-44</span></dd></div>
          <div><dt>Titular</dt><dd>Imperial Volt</dd></div>
        </dl>
        <button class="botao pix-copiar" id="pix-copiar" type="button" hidden>Copiar chave Pix</button>
        <p class="pix-aviso" id="pix-aviso" role="status" aria-live="polite"></p>
      </div>`],

  // PERGUNTAS: removida; cada resposta já está no seu lugar (definição, criador, ficha, PI, parcerias)
  [/\n    <!-- PERGUNTAS:[^\n]*\n    <section class="secao perguntas"[\s\S]*?<\/section>\n/, '\n'],

  // CONTATO: não repetir a lista de públicos de Parcerias
  ['<p>Empresas, pesquisadores, fornecedores, profissionais e potenciais parceiros podem entrar em contato com o TECNOFAG GUARD®.</p>',
   '<p>O canal oficial para iniciar uma conversa com o TECNOFAG GUARD®:</p>'],

  // RODAPÉ: assinatura, slogan e site oficial; sem repetir a definição nem links externos
  ['<p class="rodape-info">TECNOFAG GUARD® é um projeto brasileiro de identificação digital criado por FAGUITAL.<br>Site oficial: <a href="https://tecnofagguard.com.br/">tecnofagguard.com.br</a><br>Uma iniciativa do ecossistema <a href="https://imperialvolt.com/" rel="noopener">Imperial Volt</a></p>',
   '<p class="rodape-info">Site oficial: <a href="https://tecnofagguard.com.br/">tecnofagguard.com.br</a></p>']
];

let aplicadas = 0;
for (const [de, para] of trocas) {
  if (de instanceof RegExp) { if (de.test(s)) { s = s.replace(de, para); aplicadas++; } continue; }
  if (s.includes(de)) { s = s.replace(de, para); aplicadas++; continue; }
  if (para && s.includes(para)) continue;          // já aplicada
  if (!para) continue;                             // remoção já feita
  throw new Error("trecho não encontrado: " + de.slice(0, 100));
}
fs.writeFileSync(f, s);
console.log(`trocas aplicadas: ${aplicadas} de ${trocas.length}`);
