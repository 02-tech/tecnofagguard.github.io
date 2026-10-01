/*
 * TECNOFAG GUARD®
 * Apresentação finita de 3,6 segundos, com partículas em elementos DOM.
 * Preserva todos os textos e os atributos acessíveis existentes.
 * Não utiliza canvas, bibliotecas, temporizadores ou loops JavaScript.
 */
(() => {
  "use strict";

  function prepararMarca() {
    const assinatura = document.querySelector(".rodape .assinatura");

    if (!assinatura || assinatura.dataset.fxMarcaPronta === "true") {
      return;
    }

    const rodape = assinatura.closest(".rodape");
    const registro = assinatura.querySelector(".assinatura-reg");
    const nome = assinatura.querySelector(".assinatura-nome");
    const legenda = assinatura.querySelector(".assinatura-legenda");

    /*
     * Sem observação de visibilidade, mantém a assinatura estática.
     * O efeito só é habilitado quando pode ser pausado fora da tela.
     */
    if (
      !rodape ||
      !registro ||
      !nome ||
      !legenda ||
      typeof window.IntersectionObserver !== "function"
    ) {
      return;
    }

    const preferencia = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    const fragmento = document.createDocumentFragment();

    function criarDecoracao(classe) {
      const elemento = document.createElement("span");
      elemento.className = `fx-marca-decoracao ${classe}`;
      elemento.setAttribute("aria-hidden", "true");
      fragmento.appendChild(elemento);
      return elemento;
    }

    /*
     * Todos os elementos acrescentados são vazios, decorativos
     * e irmãos do botão. O conteúdo original permanece intacto.
     */
    const aura = criarDecoracao("fx-marca-aura");
    criarDecoracao("fx-marca-onda");
    criarDecoracao("fx-marca-aro");

    const quantidade = 28;
    const particulas = Array.from(
      { length: quantidade },
      () => criarDecoracao("fx-marca-particula")
    );

    assinatura.appendChild(fragmento);
    assinatura.dataset.fxMarcaPronta = "true";

    let emExecucao = false;
    let jaReproduziu = false;
    let assinaturaVisivel = false;
    let assinaturaPronta = false;
    let rodapePronto = false;
    let paginaSuspensa = false;
    let larguraInicial = 0;
    let alturaInicial = 0;

    function restaurar() {
      emExecucao = false;
      assinatura.classList.remove("fx-marca-ativa", "fx-marca-pausada");
    }

    function estaNaTela(caixa = assinatura.getBoundingClientRect()) {
      const altura =
        window.innerHeight || document.documentElement.clientHeight;
      const largura = document.documentElement.clientWidth;

      return (
        caixa.width > 0 &&
        caixa.height > 0 &&
        caixa.bottom > 0 &&
        caixa.top < altura &&
        caixa.right > 0 &&
        caixa.left < largura
      );
    }

    /*
     * Mede a composição uma única vez por reprodução, antes de animar.
     * A aura indica o centro do espaço reservado acima do nome.
     * Nenhuma consulta de layout ocorre por quadro.
     */
    function prepararTrajetorias() {
      const caixaRegistro = registro.getBoundingClientRect();
      const caixaAura = aura.getBoundingClientRect();

      if (
        caixaRegistro.width <= 0 ||
        caixaRegistro.height <= 0 ||
        caixaAura.width <= 0 ||
        caixaAura.height <= 0
      ) {
        return false;
      }

      const estiloRegistro = window.getComputedStyle(registro);
      const estiloAssinatura = window.getComputedStyle(assinatura);
      const tamanhoFonte = Number.parseFloat(estiloRegistro.fontSize);

      const escala = Number.parseFloat(
        estiloAssinatura.getPropertyValue("--fx-marca-escala")
      ) || 2.85;

      if (!Number.isFinite(tamanhoFonte)) {
        return false;
      }

      const centroX = caixaAura.left + caixaAura.width / 2;
      const centroY = caixaAura.top + caixaAura.height / 2;
      const registroX = caixaRegistro.left + caixaRegistro.width / 2;
      const registroY = caixaRegistro.top + caixaRegistro.height / 2;
      const raio = Math.min(caixaAura.width, caixaAura.height) / 2;

      const raioInicial = Math.min(
        raio * 0.72,
        Math.max(18, tamanhoFonte * escala * 0.52 + 5)
      );

      assinatura.style.setProperty(
        "--fx-marca-deslocamento-x",
        `${(centroX - registroX).toFixed(2)}px`
      );
      assinatura.style.setProperty(
        "--fx-marca-deslocamento-y",
        `${(centroY - registroY).toFixed(2)}px`
      );
      assinatura.style.setProperty(
        "--fx-marca-raio-inicial",
        `${raioInicial.toFixed(2)}px`
      );
      assinatura.style.setProperty(
        "--fx-marca-onda-inicio",
        (raioInicial / raio).toFixed(4)
      );

      const fatorRastro = Math.max(0.85, Math.min(1.3, raio / 65));

      /*
       * Distribuição determinística: pequenas variações de raio e
       * direção formam um halo, sem aparência de confete aleatório.
       */
      particulas.forEach((particula, indice) => {
        const variacao =
          ((indice * 11) % quantidade) / (quantidade - 1);

        const angulo =
          (indice / quantidade) * Math.PI * 2 +
          Math.sin(indice * 2.4) * 0.075;

        const anguloInicial = angulo - 0.1;
        const raioFinal = raio * (0.81 + variacao * 0.19);

        const propriedades = {
          "--fx-marca-x0":
            `${(Math.cos(anguloInicial) * raioInicial).toFixed(2)}px`,
          "--fx-marca-y0":
            `${(Math.sin(anguloInicial) * raioInicial).toFixed(2)}px`,
          "--fx-marca-x1":
            `${(Math.cos(angulo) * raioFinal).toFixed(2)}px`,
          "--fx-marca-y1":
            `${(Math.sin(angulo) * raioFinal).toFixed(2)}px`,
          "--fx-marca-angulo":
            `${(angulo * 180 / Math.PI).toFixed(2)}deg`,
          "--fx-marca-intensidade":
            (0.54 + variacao * 0.4).toFixed(3),
          "--fx-marca-comprimento":
            `${((3 + variacao * 4) * fatorRastro).toFixed(2)}px`,
          "--fx-marca-espessura":
            `${(1 + (indice % 3) * 0.25).toFixed(2)}px`
        };

        Object.entries(propriedades).forEach(([propriedade, valor]) => {
          particula.style.setProperty(propriedade, valor);
        });
      });

      return true;
    }

    function reproduzir() {
      if (emExecucao || document.hidden || paginaSuspensa) {
        return;
      }

      const caixa = assinatura.getBoundingClientRect();
      assinaturaVisivel = estaNaTela(caixa);

      if (!assinaturaVisivel) {
        return;
      }

      const movimentoReduzido = Boolean(
        preferencia && preferencia.matches
      );

      if (!movimentoReduzido && !prepararTrajetorias()) {
        return;
      }

      /*
       * Uma reprodução manual também consome a apresentação automática.
       * O botão conserva o foco e não acumula novas execuções.
       */
      jaReproduziu = true;
      emExecucao = true;
      larguraInicial = caixa.width;
      alturaInicial = caixa.height;

      assinatura.classList.remove("fx-marca-pausada");
      assinatura.classList.add("fx-marca-ativa");

      /*
       * Se a folha de estilos estiver indisponível ou for substituída,
       * não deixa o controle preso em uma execução inexistente.
       */
      const animacoes = window.getComputedStyle(registro)
        .animationName.split(",")
        .map((nomeAnimacao) => nomeAnimacao.trim());

      if (
        !animacoes.includes("fx-marca-registro") &&
        !animacoes.includes("fx-marca-cor")
      ) {
        restaurar();
      }
    }

    function sincronizar() {
      const pausar =
        !assinaturaVisivel || document.hidden || paginaSuspensa;

      if (emExecucao) {
        assinatura.classList.toggle("fx-marca-pausada", pausar);
        return;
      }

      if (
        !jaReproduziu &&
        assinaturaPronta &&
        rodapePronto &&
        !pausar
      ) {
        reproduzir();
      }
    }

    /*
     * Mede a fração da área que pode caber na viewport.
     * Rodapés altos continuam elegíveis em paisagem e com zoom.
     */
    function fracaoVisivel(entrada) {
      if (!entrada.isIntersecting) {
        return 0;
      }

      const caixa = entrada.boundingClientRect;
      const intersecao = entrada.intersectionRect;
      const raiz = entrada.rootBounds;

      const alturaDisponivel = raiz
        ? raiz.height
        : window.innerHeight;

      const larguraDisponivel = raiz
        ? raiz.width
        : document.documentElement.clientWidth;

      const altura = Math.min(caixa.height, alturaDisponivel);
      const largura = Math.min(caixa.width, larguraDisponivel);

      if (altura <= 0 || largura <= 0) {
        return 0;
      }

      return Math.max(
        0,
        Math.min(
          1,
          intersecao.height / altura,
          intersecao.width / largura
        )
      );
    }

    const limiares = Array.from(
      { length: 41 },
      (_, indice) => indice / 40
    );

    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        const fracao = fracaoVisivel(entrada);

        if (entrada.target === assinatura) {
          assinaturaVisivel = fracao > 0;
          assinaturaPronta = fracao >= 0.6;
        }

        if (entrada.target === rodape) {
          rodapePronto = fracao >= 0.6;
        }
      }

      sincronizar();
    }, {
      threshold: limiares
    });

    function atualizarObservacao() {
      const caixa = assinatura.getBoundingClientRect();

      /*
       * Uma mudança real de composição encerra o efeito no estado final.
       * Mudanças apenas na altura da viewport preservam a reprodução.
       */
      if (
        emExecucao &&
        (
          Math.abs(caixa.width - larguraInicial) > 1 ||
          Math.abs(caixa.height - alturaInicial) > 1
        )
      ) {
        restaurar();
      }

      assinaturaVisivel = estaNaTela(caixa);
      assinaturaPronta = false;
      rodapePronto = false;

      sincronizar();

      observador.disconnect();
      observador.observe(rodape);
      observador.observe(assinatura);
    }

    /*
     * O click nativo já atende mouse, toque, Enter e Espaço.
     * Não há handlers de teclado que possam duplicar o replay.
     */
    registro.addEventListener("click", reproduzir);

    registro.addEventListener("animationend", (evento) => {
      if (
        evento.target === registro &&
        (
          evento.animationName === "fx-marca-registro" ||
          evento.animationName === "fx-marca-cor"
        )
      ) {
        restaurar();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        sincronizar();
      } else {
        atualizarObservacao();
      }
    });

    window.addEventListener("pagehide", () => {
      paginaSuspensa = true;
      sincronizar();
    });

    window.addEventListener("pageshow", () => {
      paginaSuspensa = false;
      atualizarObservacao();
    });

    window.addEventListener("resize", atualizarObservacao, {
      passive: true
    });

    window.addEventListener("beforeprint", restaurar);

    /*
     * A troca da preferência encerra imediatamente qualquer movimento.
     * O próximo replay utiliza a modalidade escolhida pelo usuário.
     */
    if (preferencia) {
      if (typeof preferencia.addEventListener === "function") {
        preferencia.addEventListener("change", restaurar);
      } else if (typeof preferencia.addListener === "function") {
        preferencia.addListener(restaurar);
      }
    }

    observador.observe(rodape);
    observador.observe(assinatura);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prepararMarca, {
      once: true
    });
  } else {
    prepararMarca();
  }
})();
