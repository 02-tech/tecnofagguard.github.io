// Verificações de conteúdo do site oficial TECNOFAG GUARD (sem dependências).
// Uso:
//   node tools/verificar-conteudo.js comparar <htmlReferencia> <htmlNovo>   -> prova que texto/links/meta/JSON-LD não mudaram
//   node tools/verificar-conteudo.js auditar [pastaSite]                    -> sigilo, grafia da marca, traços, JSON-LD, SEO básico
"use strict";
const fs = require("fs"), path = require("path");

function semTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
function extrair(html) {
  return {
    texto: semTags(html),
    links: [...html.matchAll(/\shref="([^"]*)"/g)].map(m => m[1]),
    meta: [...html.matchAll(/<meta\b[^>]*>/g)].map(m => m[0].replace(/\s+/g, " ")),
    titulo: (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1],
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.stringify(JSON.parse(m[1]))),
    rotulos: [...html.matchAll(/\saria-label="([^"]*)"/g)].map(m => m[1]),
    titulos: [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map(m => m[1] + ":" + semTags(m[2]))
  };
}

const [modo, a, b] = process.argv.slice(2);
let falhas = 0;
const ok = (c, msg) => { console.log((c ? "ok   " : "FALHA") + " - " + msg); if (!c) falhas++; };

if (modo === "comparar") {
  const A = extrair(fs.readFileSync(a, "utf8")), B = extrair(fs.readFileSync(b, "utf8"));
  for (const k of Object.keys(A)) {
    const igual = JSON.stringify(A[k]) === JSON.stringify(B[k]);
    if (!igual && k === "texto") {
      let i = 0; while (i < A.texto.length && A.texto[i] === B.texto[i]) i++;
      console.log("  primeira diferença de texto:\n  ref: ..." + A.texto.slice(Math.max(0, i - 60), i + 80) + "\n  nov: ..." + B.texto.slice(Math.max(0, i - 60), i + 80));
    }
    ok(igual, `${k} idêntico`);
  }
} else if (modo === "auditar") {
  const raiz = a || ".";
  const publicos = [];
  (function andar(d) {
    for (const n of fs.readdirSync(d)) {
      if ([".git", "docs", "tools", "node_modules", ".capturas"].includes(n)) continue;
      const p = path.join(d, n);
      if (fs.statSync(p).isDirectory()) andar(p); else if (/\.(html|css|js|xml|txt|svg|json|webmanifest)$/.test(n)) publicos.push(p);
    }
  })(raiz);
  // 1) sigilo: termos técnicos que não podem aparecer em nada que é publicado (texto ou código)
  const proibidos = /\b(nfc|rfid|esp32|esp-?8266|arduino|raspberry|stm32|atmega|microcontrolador|antena|pcb|placa(s)? de circuito|circuito impresso|pinagem|firmware|bluetooth|ble|wi-?fi|uid|ntag|mifare|qr ?code|leitor|i2c|spi|uart|gpio|sensor(es)?|chip(s)?|protocolo interno)\b/i;
  for (const p of publicos) {
    const linhas = fs.readFileSync(p, "utf8").split(/\r?\n/);
    linhas.forEach((l, i) => { const m = l.match(proibidos); if (m) ok(false, `sigilo: termo "${m[0]}" em ${path.relative(raiz, p)}:${i + 1}`); });
  }
  ok(true, `sigilo: ${publicos.length} arquivos públicos varridos`);
  const html = fs.readFileSync(path.join(raiz, "index.html"), "utf8");
  const texto = semTags(html);
  // 2) grafia da marca no texto público
  const variantes = texto.match(/\b(TecnoFag ?Guard|TecnofagGuard|Tecno ?FAG\b|TecnoFAG\b|Tecnofag Guard|tecnofag guard)\b/g) || [];
  ok(variantes.length === 0, "grafia: só TECNOFAG GUARD no texto " + JSON.stringify(variantes));
  // 3) traços como separador na redação pública (hífen de palavra composta é permitido)
  const tracos = texto.match(/.{0,25}(\s[-–—]\s|—|–).{0,25}/g) || [];
  ok(tracos.length === 0, "redação: sem traços/travessões " + JSON.stringify(tracos));
  // 4) afirmações proibidas sobre patente
  ok(!/já (é )?patentead|tecnologia patentead|patente concedida|patente registrada/i.test(texto), "PI: nunca diz que já é patenteada");
  ok(/pedido de patente de invenção depositado junto ao INPI/.test(texto), "PI: frase do pedido de patente presente");
  ok(/Informações públicas estão disponíveis neste site\./.test(texto), "PI: 'Informações públicas estão disponíveis neste site.' presente");
  ok(!/(retorno financeiro|rendimento|lucro|participação societária)(?![^.]*não)/i.test(texto.replace(/Não é investimento e não envolve[^.]*\./, "")), "apoio: sem promessa financeira fora do aviso");
  // 5) definição e relações semânticas no texto (não só em metadados)
  ok(/O TECNOFAG GUARD® é um ecossistema brasileiro de identificação digital criado por FAGUITAL/.test(texto), "definição direta presente no texto");
  for (const t of ["FAGUITAL", "Brasil", "hardware", "software", "INPI", "em desenvolvimento", "tecnofagguard.com.br", "2023"])
    ok(new RegExp(t, "i").test(texto), `relação no texto: ${t}`);
  // 6) SEO técnico
  const um = (re, msg) => ok(re.test(html), msg);
  um(/<html lang="pt-BR"/, "lang pt-BR");
  um(/<link rel="canonical" href="https:\/\/tecnofagguard\.com\.br\/">/, "canonical correto");
  ok(!/noindex/i.test(html), "sem noindex");
  um(/<meta name="description" content="[^"]{80,170}">/, "meta description com tamanho adequado");
  um(/property="og:image" content="https:\/\/tecnofagguard\.com\.br\/assets\/img\/og-tecnofag-guard\.png"/, "og:image absoluta");
  ok((html.match(/<h1\b/g) || []).length === 1, "exatamente um h1");
  ok(fs.existsSync(path.join(raiz, "assets/img/og-tecnofag-guard.png")), "imagem Open Graph existe");
  const robots = fs.readFileSync(path.join(raiz, "robots.txt"), "utf8");
  ok(/Allow: \//.test(robots) && /Sitemap: https:\/\/tecnofagguard\.com\.br\/sitemap\.xml/.test(robots) && !/Disallow: \/\s*$/m.test(robots), "robots.txt libera e aponta o sitemap");
  ok(/<loc>https:\/\/tecnofagguard\.com\.br\/<\/loc>/.test(fs.readFileSync(path.join(raiz, "sitemap.xml"), "utf8")), "sitemap.xml com a URL canônica");
  // 7) JSON-LD válido e coerente
  const blocos = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  ok(blocos.length === 1, "um bloco JSON-LD");
  const g = JSON.parse(blocos[0][1])["@graph"];
  const ids = new Set(g.map(n => n["@id"]));
  const refs = JSON.stringify(g).match(/"@id":"[^"]+"/g).map(s => s.slice(7, -1));
  ok(refs.every(r => ids.has(r)), "JSON-LD: toda referência @id aponta para um nó existente");
  const proj = g.find(n => n["@type"] === "Project");
  ok(proj && proj.founder && proj.foundingLocation && proj.url === "https://tecnofagguard.com.br/", "JSON-LD: projeto com criador, origem e URL oficial");
  ok(!/foundingDate|address|telephone|logo|aggregateRating|award|offers|price/.test(blocos[0][1]), "JSON-LD: sem propriedades não comprovadas (data de fundação, endereço, telefone, logo, avaliações, prêmios, preço)");
} else {
  console.error("uso: comparar <ref> <novo> | auditar [pasta]"); process.exit(2);
}
console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTUDO OK");
process.exit(falhas ? 1 : 0);
