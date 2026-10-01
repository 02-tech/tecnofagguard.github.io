// Testes do site oficial TECNOFAG GUARD em Chrome headless (sem dependências externas).
// Uso: node tools/testar-site.js <url> [pastaSaida]
//   ex.: node tools/testar-site.js http://127.0.0.1:8840/ .capturas
// Verifica: rolagem horizontal, erros de console/rede, imagens quebradas, conteúdo sem JS, movimento reduzido,
// foco visível por teclado, abertura, animação do ® (execução única e replay), métricas em celular lento.
// O Chrome é SEMPRE encerrado (finally, sinais e timeout global): teste estourado não deixa navegador órfão.
"use strict";
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");

const URL0 = process.argv[2], OUT = process.argv[3] || ".capturas";
if (!URL0) { console.error("uso: node tools/testar-site.js <url> [pastaSaida]"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9400 + Math.floor(Math.random() * 90);
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "tg-"));
const ch = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${perfil}`,
  "--hide-scrollbars", "--no-first-run", "about:blank"], { stdio: "ignore" });

let encerrado = false;
function encerrar(codigo) {
  if (!encerrado) { encerrado = true; try { ch.kill(); } catch (e) { /* já saiu */ } }
  setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) { /* ok */ } process.exit(codigo); }, 400);
}
process.on("SIGINT", () => encerrar(130)); process.on("SIGTERM", () => encerrar(143));
process.on("uncaughtException", e => { console.error("ERRO", e); encerrar(1); });
const limite = setTimeout(() => { console.error("TIMEOUT GLOBAL"); encerrar(3); }, 8 * 60 * 1000);

const sleep = ms => new Promise(r => setTimeout(r, ms));
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? "ok   " : "FALHA") + " - " + msg); if (!cond) falhas++; };

(async () => {
  let alvos;
  for (let i = 0; i < 60; i++) { try { alvos = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(alvos.find(x => x.type === "page").webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));
  let id = 0; const pend = new Map(); let erros = [];
  ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") erros.push("JS: " + (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text).slice(0, 200));
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") erros.push("console.error: " + JSON.stringify(m.params.args.map(a => a.value || a.description)).slice(0, 200));
    if (m.method === "Network.responseReceived" && m.params.response.status >= 400) erros.push(m.params.response.status + " " + m.params.response.url);
    if (m.method === "Network.loadingFailed" && !m.params.canceled) erros.push("falha de rede: " + m.params.errorText);
  });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result.result.value; };
  const tela = async (w, h, mobile) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  const abrir = async () => {
    erros = [];
    await send("Page.navigate", { url: URL0 });
    for (let i = 0; i < 120; i++) { if (await ev("document.readyState") === "complete") break; await sleep(150); }
  };
  const foto = async nome => { const r = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(OUT, nome), Buffer.from(r.result.data, "base64")); };
  await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");

  // 1) larguras: overflow, erros, imagens; capturas da abertura terminada, do meio e do rodapé
  const larguras = [[360, 800, true], [390, 844, true], [412, 915, true], [844, 390, true], [768, 1024, true], [1366, 768, false], [1920, 1080, false]];
  for (const [w, h, m] of larguras) {
    await tela(w, h, m); await abrir(); await sleep(7000);
    const r = await ev(`({ ov: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      quebradas: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length })`);
    ok(r.ov <= 0, `${w}x${h}: sem rolagem horizontal (excesso ${r.ov}px)`);
    ok(r.quebradas === 0, `${w}x${h}: 0 imagens quebradas`);
    ok(erros.length === 0, `${w}x${h}: 0 erros de console/rede ${erros.join(" | ")}`);
    await foto(`abertura_${w}x${h}.png`);
    if (w === 390 || w === 1366) {
      for (const sec of ["o-que-e", "aplicacoes", "trajetoria", "parcerias", "contato"]) {
        await ev(`document.getElementById("${sec}").scrollIntoView({block:"start"})`); await sleep(1300);
        await foto(`${sec}_${w}x${h}.png`);
      }
    }
  }

  // 2) conteúdo sem JavaScript: textos principais visíveis
  await tela(390, 844, true);
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await abrir(); await sleep(800);
  const semJs = await ev(`(() => { const vis = sel => { const e = document.querySelector(sel); if (!e) return false; const s = getComputedStyle(e);
      const r = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && parseFloat(s.opacity) > 0.5 && r.width > 0 && r.height > 0; };
    return ["#titulo-principal", ".slogan-1", ".slogan-2", ".chamada", ".definicao-texto", ".ficha", ".contextos", ".linha-tempo", "#titulo-pi", ".faq", ".canais", ".assinatura"].map(s => [s, vis(s)]); })()`);
  ok(semJs.every(x => x[1]), "sem JS: conteúdo principal visível " + JSON.stringify(semJs.filter(x => !x[1])));
  await send("Emulation.setScriptExecutionDisabled", { value: false });

  // 3) movimento reduzido: conteúdo visível logo de cara, ® sem deslocamento
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await abrir(); await sleep(1500);
  const red = await ev(`(() => { const op = s => parseFloat(getComputedStyle(document.querySelector(s)).opacity);
    return { h1: op("#titulo-principal"), s1: op(".slogan-1"), s2: op(".slogan-2"), ch: op(".chamada"), def: op(".definicao-texto") }; })()`);
  ok(Object.values(red).every(v => v > 0.9), "movimento reduzido: textos visíveis sem esperar animação " + JSON.stringify(red));
  await foto("reduzido_abertura_390x844.png");
  await send("Emulation.setEmulatedMedia", { features: [] });

  // 4) teclado: Tab percorre links/botões com foco visível
  await tela(1366, 768, false); await abrir(); await sleep(6500);
  const focos = [];
  for (let i = 0; i < 14; i++) {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await sleep(120);
    focos.push(await ev(`(() => { const e = document.activeElement; if (!e || e === document.body) return null; const s = getComputedStyle(e);
      const visivel = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== "none");
      return { tag: e.tagName, txt: (e.textContent || "").trim().slice(0, 30), visivel }; })()`));
  }
  const validos = focos.filter(Boolean);
  ok(validos.length >= 10, `teclado: ${validos.length} elementos recebem foco em sequência`);
  ok(validos.every(f => f.visivel), "teclado: foco visível em todos " + JSON.stringify(validos.filter(f => !f.visivel)));
  ok(validos[0] && /pular/i.test(validos[0].txt), "teclado: primeiro foco é 'Pular para o conteúdo'");

  // 5) animação do ® no rodapé: roda uma vez ao entrar, depois para; replay no clique
  await tela(390, 844, true); await abrir(); await sleep(5000);
  await ev(`window.__marca = []; new MutationObserver(ms => ms.forEach(m => window.__marca.push(Math.round(performance.now()) + " " + m.target.className))).observe(document.querySelector(".assinatura"), { attributes: true, subtree: true, attributeFilter: ["class", "style"] })`);
  await ev(`document.getElementById("rodape").scrollIntoView({ block: "end" })`); await sleep(5000);
  const m1 = await ev("window.__marca.length");
  ok(m1 > 0, `® anima ao entrar na tela (${m1} mudanças)`);
  await foto("rodape_390x844.png");
  await ev("window.__marca = []"); await sleep(2500);
  const parado = await ev("window.__marca.length");
  ok(parado === 0, `® fica parado depois da animação (${parado} mudanças em 2,5 s)`);
  await ev(`document.querySelector(".assinatura-reg").click()`); await sleep(1200);
  await foto("rodape_replay_meio_390x844.png");
  await sleep(3500);
  ok(await ev("window.__marca.length") > 0, "® faz replay ao tocar");
  ok(erros.length === 0, "rodapé: 0 erros " + erros.join(" | "));

  // 6) métricas em celular lento (CPU 4x, 4G lenta): LCP, CLS, tempo bloqueado
  await tela(390, 844, true);
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.__m = { lcp: 0, cls: 0, longo: 0 };
    new PerformanceObserver(l => l.getEntries().forEach(e => window.__m.lcp = e.startTime)).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) window.__m.cls += e.value; })).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => window.__m.longo += Math.max(0, e.duration - 50))).observe({ type: "longtask", buffered: true });` });
  await abrir(); await sleep(9000);
  const met = await ev(`(() => { const n = performance.getEntriesByType("navigation")[0]; const bytes = performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), n.transferSize || 0);
    return { lcp: Math.round(__m.lcp), cls: +__m.cls.toFixed(4), bloqueioMs: Math.round(__m.longo), carregado: Math.round(n.loadEventEnd), kb: Math.round(bytes / 1024) }; })()`);
  console.log("métricas (celular lento simulado):", JSON.stringify(met));
  ok(met.lcp > 0 && met.lcp < 2500, `LCP ${met.lcp} ms (bom < 2500)`);
  ok(met.cls < 0.1, `CLS ${met.cls} (bom < 0,1)`);
  ok(met.bloqueioMs < 600, `tempo bloqueado ${met.bloqueioMs} ms (alvo < 600 com CPU 4x)`);
  await send("Emulation.setCPUThrottlingRate", { rate: 1 });

  // 7) CPU em repouso: com a abertura fora da tela e rodapé parado, nada deve rodar continuamente
  await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await abrir(); await sleep(7000);
  await ev(`document.getElementById("perguntas").scrollIntoView()`); await sleep(1500);
  const raf = await ev(`new Promise(res => { let n = 0; const orig = window.requestAnimationFrame; let ativo = true;
    window.requestAnimationFrame = cb => { if (ativo) n++; return orig(cb); }; setTimeout(() => { ativo = false; window.requestAnimationFrame = orig; res(n); }, 2000); })`);
  ok(raf < 20, `repouso fora da abertura: ${raf} pedidos de quadro em 2 s (loops pausados)`);

  console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTODOS OS TESTES OK");
  clearTimeout(limite); encerrar(falhas ? 1 : 0);
})().catch(e => { console.error("ERRO", e); encerrar(1); });
