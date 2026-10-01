// Captura quadros da animação do ® no rodapé (para revisão visual).
// Uso: node tools/quadros-marca.js <url> <pastaSaida> [largura] [altura]
// O Chrome é sempre encerrado no final, mesmo com erro.
"use strict";
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const [URL0, OUT, W = "390", H = "844"] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "tg-q-"));
const port = 9200 + Math.floor(Math.random() * 90);
const ch = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${perfil}`, "--hide-scrollbars", "--no-first-run", "about:blank"], { stdio: "ignore" });
const fim = c => { try { matarChrome(); } catch (e) { /* já saiu */ } setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) { /* ok */ } process.exit(c); }, 400); };
setTimeout(() => { console.error("TIMEOUT"); fim(3); }, 90000);
// No Windows o Chrome headless se desvincula do processo aberto pelo node (nem ch.kill nem taskkill /T o alcançam):
// encerra todo chrome.exe cuja linha de comando contém a pasta de perfil EXCLUSIVA deste teste (nunca o Chrome do usuário).
function matarChrome() {
  try { ch.kill(); } catch (e) { /* já saiu */ }
  if (process.platform !== "win32") return;
  const marca = require("path").basename(perfil);
  require("child_process").spawnSync("powershell.exe", ["-NoProfile", "-Command",
    "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*" + marca + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"],
    { stdio: "ignore", timeout: 30000 });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let alvos; for (let i = 0; i < 60; i++) { try { alvos = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
  const ws = new WebSocket(alvos.find(x => x.type === "page").webSocketDebuggerUrl); await new Promise(r => ws.addEventListener("open", r));
  let id = 0; const pend = new Map(), erros = [];
  ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") erros.push(m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description); });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result.result.value;
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: +W, height: +H, deviceScaleFactor: 2, mobile: +W < 900 });
  await send("Page.navigate", { url: URL0 });
  for (let i = 0; i < 80; i++) { if (await ev("document.readyState") === "complete") break; await sleep(150); }
  await sleep(800);
  await ev(`document.getElementById("rodape").scrollIntoView({ block: "end" })`);
  const t0 = Date.now();
  for (const ms of [150, 600, 1100, 1600, 2100, 2600, 3200, 4200]) {
    await sleep(Math.max(0, ms - (Date.now() - t0)));
    const caixa = await ev(`(() => { const r = document.querySelector(".assinatura").getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top + scrollY - 90), width: innerWidth, height: Math.min(innerHeight, r.height + 180) }; })()`);
    const r = await send("Page.captureScreenshot", { format: "png", clip: { ...caixa, scale: 1 } });
    fs.writeFileSync(path.join(OUT, `marca_${W}_${String(ms).padStart(4, "0")}ms.png`), Buffer.from(r.result.data, "base64"));
  }
  console.log("quadros salvos em", OUT, erros.length ? "ERROS: " + erros.join(" | ") : "(0 erros JS)");
  fim(0);
})().catch(e => { console.error(e); fim(1); });
