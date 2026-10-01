/* TECNOFAG GUARD® · Rodada 2. Luz, foco e convergência, sem recursos externos.
   O HTML é a fonte de todo conteúdo. Canvas e pseudo-elementos só decoram. */
(function () {
  "use strict";
  var abertura = document.getElementById("inicio");
  var campo = abertura && abertura.querySelector(".abertura-fx");
  if (!abertura || !campo) return;
  var preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ponteiroPreciso = window.matchMedia("(hover: hover) and (pointer: fine)");
  var movimentoReduzido = preferencia.matches;
  var possuiObservador = "IntersectionObserver" in window;
  var raiz = document.documentElement;
  function limitar(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function suave(v) { v = limitar(v, 0, 1); return v * v * (3 - 2 * v); }
  function trecho(t, inicio, fim) { return suave((t - inicio) / (fim - inicio)); }

  /* Revelações finitas: o estado sem classes já é legível. Mantemos o
     observador para pausar inclusive efeitos curtos fora da tela. */
  var alvos = document.querySelectorAll(".secao, .contextos > li, .linha-tempo > li, .passos > li");
  var observadorSecoes;
  function prepararRevelacoes() {
    if (observadorSecoes) observadorSecoes.disconnect();
    if (movimentoReduzido || !possuiObservador) {
      alvos.forEach(function (e) { e.classList.remove("fx-fora"); });
      return;
    }
    observadorSecoes = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var e = entrada.target;
        e.classList.toggle("fx-fora", !entrada.isIntersecting);
        if (entrada.isIntersecting) e.classList.add(e.classList.contains("secao") ? "secao-revelando" : "fx-entrou");
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    alvos.forEach(function (e) { observadorSecoes.observe(e); });
  }
  prepararRevelacoes();
  var linha = document.querySelector(".linha-tempo");
  var linhaVisivel = false, quadroLinha = 0;
  function desenharLinha() {
    quadroLinha = 0;
    if (!linha || !linhaVisivel || movimentoReduzido || document.hidden) return;
    var r = linha.getBoundingClientRect();
    linha.style.setProperty("--progresso", limitar((window.innerHeight * .78 - r.top) / Math.max(1, r.height - 48), 0, 1).toFixed(4));
  }
  function agendarLinha() {
    if (linhaVisivel && !movimentoReduzido && !document.hidden && !quadroLinha) quadroLinha = window.requestAnimationFrame(desenharLinha);
  }
  if (linha && possuiObservador) {
    new IntersectionObserver(function (entradas) {
      linhaVisivel = entradas[0].isIntersecting;
      if (linhaVisivel) agendarLinha();
      else if (quadroLinha) { window.cancelAnimationFrame(quadroLinha); quadroLinha = 0; }
    }).observe(linha);
  }

  var canvas = document.createElement("canvas");
  canvas.className = "abertura-canvas";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = null;
  try { ctx = canvas.getContext("2d", { alpha: true }); } catch (_) { /* O CSS estático permanece. */ }
  if (ctx) campo.appendChild(canvas);
  var DURACAO = 4650; // Texto assenta em 4,5 s; botão termina 150 ms depois.
  var QUADRO = 1000 / 30;
  var largura = 0, altura = 0, raio = 0;
  var centroX = 0, centroY = 0, topoSlogan = 0, faixaMarca = 0, alturaMarca = 0;
  var pontos = [], particulas = [];
  var quadro = 0, ultimoTempo = 0, tempoAbertura = 0, tempoAmbiente = 0;
  var inicioSequencia = performance.now(), inicioPausa = 0, pausadoPor = 0;
  var alvoX = 0, alvoY = 0, deslocamentoX = 0, deslocamentoY = 0;
  var precisaDimensionar = true;
  var retangulo = abertura.getBoundingClientRect();
  var naTela = retangulo.bottom > 0 && retangulo.top < window.innerHeight;
  var sequencia = !!ctx && !movimentoReduzido && possuiObservador && naTela && !document.hidden && window.scrollY < 2;

  /* Halo rasterizado uma vez. Sem blur de tela inteira no loop.
     DPR até 1,5 no celular e 2 no desktop; teto de 1,8 milhão de pixels. */
  var brilho = document.createElement("canvas");
  brilho.width = brilho.height = 128;
  var brilhoCtx = brilho.getContext("2d");
  if (brilhoCtx) {
    var g = brilhoCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(218,253,255,.8)");
    g.addColorStop(.07, "rgba(135,235,250,.45)");
    g.addColorStop(.3, "rgba(67,171,202,.14)");
    g.addColorStop(1, "rgba(31,94,123,0)");
    brilhoCtx.fillStyle = g;
    brilhoCtx.fillRect(0, 0, 128, 128);
  }
  function dimensionar() {
    if (!ctx) return;
    var limites = campo.getBoundingClientRect();
    var titulo = document.querySelector(".marca-titulo");
    largura = Math.max(1, limites.width); altura = Math.max(1, limites.height);
    var proporcao = Math.min(window.devicePixelRatio || 1, largura < 640 ? 1.5 : 2, Math.sqrt(1800000 / (largura * altura)));
    QUADRO = 1000 / (largura < 640 ? 24 : 30);
    canvas.width = Math.round(largura * proporcao); canvas.height = Math.round(altura * proporcao);
    ctx.setTransform(proporcao, 0, 0, proporcao, 0, 0);
    /* offset* independe do scale animado e preserva o centro real da marca. */
    var texto = abertura.querySelector(".abertura-texto");
    centroX = largura / 2;
    centroY = texto.offsetTop + titulo.offsetTop + titulo.offsetHeight / 2;
    topoSlogan = texto.offsetTop + abertura.querySelector(".slogan-1").offsetHeight / 2;
    faixaMarca = titulo.offsetWidth * .93; alturaMarca = titulo.offsetHeight * .65;
    raio = Math.min(largura * .43, altura * .43);
    pontos = []; particulas = [];
    var semente = 47;
    function aleatorio() { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; }
    for (var i = 0; i < (largura < 640 ? 34 : 58); i++) {
      pontos.push({ angulo: aleatorio() * Math.PI * 2, distancia: .7 + aleatorio() * .9, tamanho: .5 + aleatorio(), fase: aleatorio() * 6.28 });
    }
    /* Destinos na faixa tipográfica, sem desenhar letras no canvas. */
    for (var p = 0; p < (largura < 640 ? 64 : 130); p++) {
      var angulo = aleatorio() * Math.PI * 2, distancia = .65 + aleatorio() * .8;
      particulas.push({ deX: Math.cos(angulo) * largura * distancia, deY: Math.sin(angulo) * altura * distancia * .55,
        paraX: (aleatorio() - .5) * faixaMarca, paraY: (aleatorio() - .5) * alturaMarca,
        atraso: aleatorio() * .18, tamanho: .55 + aleatorio() * 1.2 });
    }
    precisaDimensionar = false;
  }
  function halo(x, y, rx, ry, alpha) {
    if (!brilhoCtx || alpha <= .002) return;
    ctx.globalAlpha = limitar(alpha, 0, 1);
    ctx.drawImage(brilho, x - rx, y - ry, rx * 2, ry * 2); ctx.globalAlpha = 1;
  }
  function elipse(x, y, rx, ry, giro, inicio, fim, alpha, espessura) {
    if (alpha < .002) return;
    ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), giro, inicio, fim);
    ctx.strokeStyle = "rgba(151,230,243," + limitar(alpha, 0, 1) + ")";
    ctx.lineWidth = espessura || .7; ctx.stroke();
  }
  function segmento(x1, y1, x2, y2, alpha, espessura) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = "rgba(172,240,249," + limitar(alpha, 0, 1) + ")";
    ctx.lineWidth = espessura || 1; ctx.stroke();
  }
  function desenhar() {
    if (!ctx || !largura || !altura) return;
    ctx.clearRect(0, 0, largura, altura);
    var t = sequencia ? tempoAbertura / 1000 : 5;
    var ambiente = movimentoReduzido ? 0 : tempoAmbiente / 1000;
    var cx = centroX + deslocamentoX, cy = centroY + deslocamentoY;
    var assentar = trecho(t, 2.5, 4.5), respirar = .5 + Math.sin(ambiente * .36) * .5;
    ctx.save(); ctx.globalCompositeOperation = "lighter";

    /* 0–0,95 s: rastro em perspectiva e linhas de arrasto legíveis em quadros. */
    if (t < 1.12) {
      var chegada = limitar(t / .92, 0, 1);
      var percurso = chegada < .7 ? Math.pow(chegada / .7, 1.35) * .8 : .8 + (1 - Math.pow(1 - (chegada - .7) / .3, 3)) * .2;
      var deX = -largura * .22, deY = cy + altura * .42;
      var px = deX + (cx - deX) * percurso, py = deY + (cy - deY) * percurso;
      var forca = trecho(t, .02, .18) * (1 - trecho(t, .91, 1.12));
      for (var f = 0; f < 9; f++) {
        var afastamento = (f - 4) * (2 + (1 - chegada) * 5);
        var luz = ctx.createLinearGradient(deX, deY, px, py);
        luz.addColorStop(0, "rgba(79,181,223,0)");
        luz.addColorStop(.45, "rgba(87,194,224," + .12 * forca + ")");
        luz.addColorStop(1, "rgba(225,255,255," + (f === 4 ? .95 : .21) * forca + ")");
        ctx.beginPath(); ctx.moveTo(deX, deY + afastamento * 3);
        ctx.quadraticCurveTo(px - largura * .18, py + altura * .12 + afastamento, px, py + afastamento * .08);
        ctx.strokeStyle = luz; ctx.lineWidth = f === 4 ? 2 : 1; ctx.stroke();
      }
      halo(px, py, raio * .46, raio * .24, forca);
      for (var a = 0; a < 18; a++) {
        var v = (a * .061 + t * 1.7) % 1;
        var sx = deX + (px - deX) * v, sy = deY + (py - deY) * v;
        var desvio = Math.sin(a * 7.31) * (1 - v) * raio * .48;
        segmento(sx - largura * .07, sy + altura * .036 + desvio, sx, sy + desvio, forca * v * .46, .7);
      }
    }
    /* 0,9–1,6 s: desaceleração, flash localizado e planos fechando o foco. */
    var foco = trecho(t, .82, 1.12);
    var flash = Math.exp(-Math.pow((t - .96) / .115, 2));
    halo(cx, cy, raio * .9, raio * .52, flash * .95);
    if (t > .83 && t < 2.65) {
      var trava = trecho(t, .88, 1.58), vis = foco * (1 - trecho(t, 1.9, 2.65));
      for (var anel = 0; anel < 3; anel++) {
        var rx = raio * (.36 + anel * .24 + (1 - trava) * 1.05);
        elipse(cx, cy, rx, rx * .62, -.26 + anel * .2, .08 + anel, Math.PI * 1.78 + anel, vis * (.65 - anel * .15), anel === 0 ? 1.2 : .65);
      }
      var cantos = raio * (.5 + (1 - trava) * .6);
      for (var c = 0; c < 4; c++) {
        var sinalX = c % 2 ? 1 : -1, sinalY = c < 2 ? -1 : 1;
        var x = cx + sinalX * cantos, y = cy + sinalY * cantos * .38;
        segmento(x, y, x - sinalX * 13, y, vis * .8);
        segmento(x, y, x, y - sinalY * 7, vis * .8);
      }
    }
    if (t > .98 && t < 1.65) {
      var scan = limitar((t - .98) / .67, 0, 1);
      var scanX = cx - faixaMarca * .52 + faixaMarca * 1.04 * scan;
      segmento(scanX, topoSlogan - 17, scanX, topoSlogan + 17, Math.sin(scan * Math.PI) * .8);
      halo(scanX, topoSlogan, 45, 30, .35 * Math.sin(scan * Math.PI));
    }
    /* 1,6–2,6 s: convergência para o espaço da marca HTML; partículas
       dissolvem enquanto o texto real ganha nitidez em CSS. */
    if (t > 1.48 && t < 2.75) {
      for (var p = 0; p < particulas.length; p++) {
        var ponto = particulas[p], mov = trecho(t, 1.48 + ponto.atraso, 2.38 + ponto.atraso);
        var x1 = cx + ponto.deX + (ponto.paraX - ponto.deX) * mov;
        var y1 = cy + ponto.deY + (ponto.paraY - ponto.deY) * mov;
        var alpha = trecho(t, 1.48, 1.7) * (1 - trecho(t, 2.25 + ponto.atraso, 2.7));
        var arrasto = .065 * Math.sin(mov * Math.PI);
        segmento(x1, y1, x1 + (ponto.deX - ponto.paraX) * arrasto, y1 + (ponto.deY - ponto.paraY) * arrasto, alpha * .5, ponto.tamanho * .65);
        ctx.fillStyle = "rgba(196,249,255," + alpha * .85 + ")";
        ctx.fillRect(x1, y1, ponto.tamanho, ponto.tamanho);
      }
      halo(cx, cy, faixaMarca * .68, alturaMarca * 1.9, Math.sin(trecho(t, 1.5, 2.7) * Math.PI) * .33);
    }
    /* Campo final. Movimento reduzido usa esta mesma composição estática. */
    var campoFinal = trecho(t, 1.4, 3.5);
    halo(cx, cy, raio * 1.8, raio * .9, campoFinal * (.17 + respirar * .035));
    var giro = -.24 + Math.sin(ambiente * .09) * .01;
    elipse(cx, cy, raio * 1.36, raio * .47, giro, .06, 5.8, campoFinal * .25);
    elipse(cx, cy, raio * 1.12, raio * .36, giro, 2.7, 8.6, campoFinal * .18);
    elipse(cx, cy, raio * .9, raio * .9, -.2, -.7, .75, campoFinal * .085);
    elipse(cx, cy, raio * .9, raio * .9, -.2, 2.5, 3.9, campoFinal * .08);
    for (var q = 0; q < pontos.length; q++) {
      var pt = pontos[q], angulo = pt.angulo + ambiente * .008;
      var dx = Math.cos(angulo) * raio * pt.distancia, dy = Math.sin(angulo) * raio * pt.distancia * .43;
      var x2 = cx + dx * Math.cos(giro) - dy * Math.sin(giro);
      var y2 = cy + dx * Math.sin(giro) + dy * Math.cos(giro);
      ctx.fillStyle = "rgba(176,226,238," + campoFinal * (.25 + Math.sin(ambiente * .45 + pt.fase) * .1) + ")";
      ctx.fillRect(x2, y2, pt.tamanho, pt.tamanho);
    }
    var selo = Math.exp(-Math.pow((t - 2.52) / .2, 2));
    elipse(cx, cy, raio * (1.25 + assentar * .15), raio * .43, giro, .1, 6.1, selo * .35);
    ctx.restore();
  }
  function concluirAbertura() {
    sequencia = false; tempoAbertura = DURACAO;
    abertura.classList.remove("abertura-em-curso", "abertura-pausada");
  }
  function parar() {
    if (quadro) window.cancelAnimationFrame(quadro);
    quadro = 0; ultimoTempo = 0;
  }
  function podeAnimar() { return !!ctx && naTela && !document.hidden && !movimentoReduzido && possuiObservador; }
  function animar(agora) {
    quadro = 0;
    if (!podeAnimar()) { ultimoTempo = 0; return; }
    var intervalo = sequencia ? QUADRO : 1000 / 18;
    if (!ultimoTempo || agora - ultimoTempo >= intervalo - 1) {
      var delta = ultimoTempo ? Math.min(agora - ultimoTempo, 80) : QUADRO;
      ultimoTempo = agora; tempoAmbiente += delta;
      /* Relógio real alinhado ao CSS. CPU lenta não atrasa a luz em relação
         ao texto. Intervalos de aba oculta são descontados. */
      if (sequencia) {
        tempoAbertura = agora - inicioSequencia - pausadoPor;
        if (tempoAbertura >= DURACAO) concluirAbertura();
      }
      deslocamentoX += (alvoX - deslocamentoX) * .055;
      deslocamentoY += (alvoY - deslocamentoY) * .055;
      if (precisaDimensionar) dimensionar();
      desenhar();
    }
    quadro = window.requestAnimationFrame(animar);
  }
  function iniciar() { if (podeAnimar() && !quadro) quadro = window.requestAnimationFrame(animar); }
  function atualizarDimensoes() {
    precisaDimensionar = true; agendarLinha();
    if (ctx && naTela && !document.hidden && !quadro) { dimensionar(); desenhar(); }
  }
  if (ctx) { dimensionar(); desenhar(); }
  if (sequencia) { inicioSequencia = performance.now(); abertura.classList.add("abertura-em-curso"); }
  if (possuiObservador) {
    new IntersectionObserver(function (entradas) {
      naTela = entradas[0].isIntersecting;
      if (naTela) {
        if (ctx && precisaDimensionar && !document.hidden) { dimensionar(); desenhar(); }
        iniciar();
      } else { parar(); concluirAbertura(); }
    }).observe(abertura);
  }
  if ("ResizeObserver" in window) new ResizeObserver(atualizarDimensoes).observe(campo);
  window.addEventListener("resize", atualizarDimensoes, { passive: true });
  window.addEventListener("scroll", function () {
    if (sequencia) { concluirAbertura(); if (naTela && !document.hidden) desenhar(); }
    agendarLinha();
  }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    raiz.classList.toggle("fx-aba-oculta", document.hidden);
    if (document.hidden) {
      parar();
      if (quadroLinha) { window.cancelAnimationFrame(quadroLinha); quadroLinha = 0; }
      if (sequencia) { inicioPausa = performance.now(); abertura.classList.add("abertura-pausada"); }
    } else {
      if (sequencia && inicioPausa) { pausadoPor += performance.now() - inicioPausa; inicioPausa = 0; }
      abertura.classList.remove("abertura-pausada");
      if (ctx && naTela && precisaDimensionar) { dimensionar(); desenhar(); }
      iniciar(); agendarLinha();
    }
  });
  function mudarPreferencia() {
    movimentoReduzido = preferencia.matches;
    parar(); concluirAbertura();
    alvoX = alvoY = deslocamentoX = deslocamentoY = 0;
    prepararRevelacoes();
    if (linha && movimentoReduzido) linha.style.removeProperty("--progresso");
    if (ctx && naTela && !document.hidden) { if (precisaDimensionar) dimensionar(); desenhar(); }
    iniciar(); agendarLinha();
  }
  if (preferencia.addEventListener) preferencia.addEventListener("change", mudarPreferencia);
  else if (preferencia.addListener) preferencia.addListener(mudarPreferencia);
  abertura.addEventListener("pointermove", function (evento) {
    if (!podeAnimar() || !ponteiroPreciso.matches || evento.pointerType === "touch") return;
    var r = abertura.getBoundingClientRect();
    alvoX = limitar(evento.clientX / largura - .5, -.5, .5) * 12;
    alvoY = limitar((evento.clientY - r.top) / altura - .5, -.5, .5) * 8;
  }, { passive: true });
  abertura.addEventListener("pointerleave", function () { alvoX = alvoY = 0; }, { passive: true });
  abertura.addEventListener("focusin", concluirAbertura);
  window.addEventListener("pagehide", function () {
    parar(); concluirAbertura();
    if (quadroLinha) { window.cancelAnimationFrame(quadroLinha); quadroLinha = 0; }
  });
  window.addEventListener("pageshow", function (evento) { if (evento.persisted) { iniciar(); agendarLinha(); } });
  iniciar();
})();
