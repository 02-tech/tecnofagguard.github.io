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
