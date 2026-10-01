/* TECNOFAG GUARD: comportamento básico do site (menu). Camadas visuais ficam em fx-abertura.js e fx-marca.js. */
(function () {
  "use strict";
  var botao = document.querySelector(".menu-botao");
  var lista = document.getElementById("menu-lista");
  if (!botao || !lista) return;
  function fechar() { botao.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("menu-aberto"); }
  botao.addEventListener("click", function () {
    var aberto = botao.getAttribute("aria-expanded") === "true";
    botao.setAttribute("aria-expanded", aberto ? "false" : "true");
    document.documentElement.classList.toggle("menu-aberto", !aberto);
  });
  lista.addEventListener("click", function (e) { if (e.target.closest("a")) fechar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { fechar(); } });
})();

/* Apoio: copiar a chave Pix (só aparece se o navegador permitir copiar; a chave está sempre visível no texto). */
(function () {
  "use strict";
  var botao = document.getElementById("pix-copiar");
  var chave = document.getElementById("pix-chave");
  var aviso = document.getElementById("pix-aviso");
  if (!botao || !chave || !navigator.clipboard || !window.isSecureContext) return;
  botao.hidden = false;
  botao.addEventListener("click", function () {
    navigator.clipboard.writeText(chave.getAttribute("data-chave")).then(function () {
      if (aviso) aviso.textContent = "Chave Pix copiada.";
    }, function () {
      if (aviso) aviso.textContent = "Não foi possível copiar. A chave está escrita acima.";
    });
  });
})();
