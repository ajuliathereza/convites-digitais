document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // 1) CONFIGURAÇÃO DO CONVITE (edite só essa parte)
  // =========================================================
  const convite = {
    nome: "Joaquim",
    idade: 1,

    // Textos principais
    mensagemAbertura: "Você acaba de receber um convite especial!",
    mensagemInterna: "Hakuna Matata! Todo o reino te espera para esse dia especial! 🦁",

    // Informações visíveis no card
    dataExibicao: "15 de Março",
    horaExibicao: "16:00",
    local: "Espaço Festa Alegria",
    endereco: "Rua Exemplo, 123 — São Paulo/SP",

    // Data real do evento (usada na contagem regressiva)
    // IMPORTANTE: manter em formato ISO com fuso (-03:00 para Brasil)
    // Exemplo: "2026-03-15T16:00:00-03:00"
    dataEventoISO: "2026-03-15T16:00:00-03:00",

    // WhatsApp para confirmação (somente números)
    // Ex.: 5511999999999
    whatsappNumero: "5511999999999",
    whatsappMensagem: "Oi! 💛 Estou confirmando presença no aniversário do Joaquim 🦁✨",

    // Google Maps
    // Se você já tiver um link do Maps, coloque em mapsLink.
    // Se deixar vazio, ele vai pesquisar com mapsQuery.
    mapsLink: "",
    mapsQuery: "Rua Exemplo, 123, São Paulo, SP",

    // Álbum de fotos (deixe vazio enquanto não tiver link)
    albumLink: ""
  };

  // =========================================================
  // 2) AJUSTES DE ANIMAÇÃO / TEMPO
  // =========================================================
  const TEMPOS = {
    // Tempo total para abrir tampa + subir carta + trocar para o conteúdo
    abrirEnvelopeMostrarConteudo: 1100,

    // Tempo para decidir se vídeo falhou e mostrar fallback
    fallbackVideoMs: 2500
  };

  // =========================================================
  // 3) HELPERS (funções auxiliares)
  // =========================================================

  // Atalho para pegar elemento por ID
  const $ = (id) => document.getElementById(id);

  // Atualiza texto com segurança (só se o elemento existir)
  function setText(node, value) {
    if (node) node.textContent = value;
  }

  // Abre links em nova aba de forma segura
  function openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Verifica se um valor é um elemento HTML
  function isHTMLElement(elm) {
    return elm instanceof HTMLElement;
  }

  // =========================================================
  // 4) MAPA DE ELEMENTOS DO HTML
  // =========================================================
  const el = {
    // Textos
    txtNome: $("txtNome"),
    txtIdade: $("txtIdade"),
    txtMensagemAbertura: $("txtMensagemAbertura"),
    txtMensagemInterna: $("txtMensagemInterna"),
    txtData: $("txtData"),
    txtHora: $("txtHora"),
    txtLocal: $("txtLocal"),
    txtEndereco: $("txtEndereco"),

    // Envelope / etapas
    btnAbrir: $("btnAbrir"),
    envelope: $("envelope"),
    stageEnvelope: $("stageEnvelope"),
    stageContent: $("stageContent"),

    // Botões
    btnRsvp: $("btnRsvp"),
    btnMaps: $("btnMaps"),
    btnPresentes: $("btnPresentes"),
    btnAlbum: $("btnAlbum"),

    // Modal
    modal: $("modalPresentes"),

    // Contagem
    countdownText: $("countdownText"),

    // Vídeo topo
    heroVideo: $("heroVideo"),
    heroFallback: $("heroFallback")
  };

  // =========================================================
  // 5) APLICAR DADOS NO HTML
  // =========================================================
  function aplicarDadosNoConvite() {
    setText(el.txtNome, convite.nome);
    setText(el.txtIdade, convite.idade);
    setText(el.txtMensagemAbertura, convite.mensagemAbertura);
    setText(el.txtMensagemInterna, convite.mensagemInterna);
    setText(el.txtData, convite.dataExibicao);
    setText(el.txtHora, convite.horaExibicao);
    setText(el.txtLocal, convite.local);
    setText(el.txtEndereco, convite.endereco);
  }

  // =========================================================
  // 6) VÍDEO DO TOPO + FALLBACK
  // =========================================================
  function configurarVideoTopo() {
    if (!el.heroVideo) return;

    // Em celulares, autoplay só costuma funcionar com muted
    el.heroVideo.play().catch(() => {
      // Navegador pode bloquear autoplay; sem problema visual.
    });

    // Se o vídeo der erro de carregamento
    el.heroVideo.addEventListener("error", () => {
      el.heroFallback?.classList.add("is-visible");
    });

    // Se não carregar rápido, mostra fallback preventivamente
    const fallbackTimeout = setTimeout(() => {
      if (el.heroVideo && el.heroVideo.readyState < 2) {
        el.heroFallback?.classList.add("is-visible");
      }
    }, TEMPOS.fallbackVideoMs);

    // Se carregou, remove fallback e limpa timeout
    el.heroVideo.addEventListener("loadeddata", () => {
      clearTimeout(fallbackTimeout);
      el.heroFallback?.classList.remove("is-visible");
    });
  }

  // =========================================================
  // 7) ENVELOPE (animação de abrir) - CORRIGIDO ✅
  //    CSS usa:
  //    - .is-flap-open (abre a tampa)
  //    - .is-letter-out (sobe a carta)
  // =========================================================
  function configurarEnvelope() {
    let envelopeOpened = false;

    if (!el.btnAbrir || !el.envelope || !el.stageEnvelope || !el.stageContent) {
      return;
    }

    el.btnAbrir.addEventListener("click", () => {
      // Evita abrir duas vezes
      if (envelopeOpened) return;
      envelopeOpened = true;

      // 1) Abre a tampa
      el.envelope.classList.add("is-flap-open");

      // 2) Depois a carta sobe (sincronizado com CSS)
      setTimeout(() => {
        el.envelope.classList.add("is-letter-out");
      }, 260);

      // Desabilita botão para não clicar repetido
      el.btnAbrir.disabled = true;

      // Vibração curtinha (se o dispositivo suportar)
      if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
        navigator.vibrate(30);
      }

      // 3) Depois da animação completa, troca para conteúdo
      setTimeout(() => {
        el.stageEnvelope.classList.add("hidden");
        el.stageContent.classList.remove("hidden");
        el.stageContent.classList.add("is-visible");

        // Faz scroll suave até o conteúdo (bom para mobile)
        el.stageContent.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }, TEMPOS.abrirEnvelopeMostrarConteudo);
    });
  }

  // =========================================================
  // 8) BOTÃO WHATSAPP (Confirmar presença)
  // =========================================================
  function configurarBotaoWhatsapp() {
    el.btnRsvp?.addEventListener("click", () => {
      // Remove qualquer caractere que não seja número
      const numero = (convite.whatsappNumero || "").replace(/\D/g, "");

      // Validação simples
      if (!numero) {
        alert("Defina o número de WhatsApp no arquivo script.js.");
        return;
      }

      // Mensagem codificada para URL
      const texto = encodeURIComponent(convite.whatsappMensagem || "Confirmando presença!");

      // Link oficial do WhatsApp
      const url = `https://wa.me/${numero}?text=${texto}`;
      openExternal(url);
    });
  }

  // =========================================================
  // 9) BOTÃO MAPS (abrir localização)
  // =========================================================
  function configurarBotaoMaps() {
    el.btnMaps?.addEventListener("click", () => {
      let url = (convite.mapsLink || "").trim();

      // Se não tiver link pronto, monta busca no Google Maps
      if (!url) {
        const queryBase = (convite.mapsQuery || convite.endereco || "").trim();

        if (!queryBase) {
          alert("Defina o endereço no script.js para abrir o Maps.");
          return;
        }

        const query = encodeURIComponent(queryBase);
        url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      }

      openExternal(url);
    });
  }

  // =========================================================
  // 10) MODAL DE PRESENTES
  // =========================================================
  function configurarModalPresentes() {
    if (!el.modal) return;

    // Abre o modal
    function abrirModal() {
      el.modal?.classList.remove("hidden");
      document.body.classList.add("modal-open");

      // Foco no botão de fechar (acessibilidade)
      const closeBtn = el.modal?.querySelector(".modal__close");
      if (isHTMLElement(closeBtn)) closeBtn.focus();
    }

    // Fecha o modal
    function fecharModal() {
      el.modal?.classList.add("hidden");
      document.body.classList.remove("modal-open");

      // Devolve foco ao botão que abriu o modal
      if (isHTMLElement(el.btnPresentes)) {
        el.btnPresentes.focus();
      }
    }

    // Clique no botão "Sugestões de presentes"
    el.btnPresentes?.addEventListener("click", abrirModal);

    // Fecha clicando no backdrop ou em botões com data-close="true"
    el.modal.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.dataset.close === "true") {
        fecharModal();
      }
    });

    // Fecha com ESC
    document.addEventListener("keydown", (event) => {
      const modalAberto = el.modal && !el.modal.classList.contains("hidden");
      if (event.key === "Escape" && modalAberto) {
        fecharModal();
      }
    });
  }

  // =========================================================
// 11) BOTÃO DO ÁLBUM (prévia clicável)
// =========================================================
function configurarAlbum() {
  if (!el.btnAlbum) return;

  const linkAlbum = (convite.albumLink || "./album.html").trim();

  // Sempre mostra "Em breve"
  el.btnAlbum.textContent = "Em breve";

  // Se tiver link, deixa clicável como "prévia"
  if (linkAlbum) {
    el.btnAlbum.disabled = false;
    el.btnAlbum.removeAttribute("aria-disabled");
    el.btnAlbum.setAttribute("title", "Ver prévia do álbum");

    el.btnAlbum.addEventListener("click", () => {
      openExternal(linkAlbum);
    }, { once: true }); // evita duplicar listener
  } else {
    // Sem link, mantém desativado
    el.btnAlbum.disabled = true;
    el.btnAlbum.setAttribute("aria-disabled", "true");
    el.btnAlbum.removeAttribute("title");
  }
}

  // =========================================================
  // 12) CONTAGEM REGRESSIVA
  // =========================================================
  function configurarContagemRegressiva() {
    if (!el.countdownText) return;

    // Converte a data do evento uma vez
    const dataEvento = new Date(convite.dataEventoISO);

    // Se a data estiver inválida, avisa
    if (Number.isNaN(dataEvento.getTime())) {
      el.countdownText.textContent = "Defina uma data válida no script.js";
      return;
    }

    // Formata o texto da contagem
    function formatCountdown(ms) {
      const totalSeg = Math.floor(ms / 1000);

      const dias = Math.floor(totalSeg / 86400);
      const horas = Math.floor((totalSeg % 86400) / 3600);
      const minutos = Math.floor((totalSeg % 3600) / 60);
      const segundos = totalSeg % 60;

      if (dias > 0) {
        return `Faltam ${dias}d ${horas}h ${minutos}min para a festa!`;
      }

      if (horas > 0) {
        return `É hoje! Faltam ${horas}h ${minutos}min ${segundos}s 🥳`;
      }

      if (minutos > 0) {
        return `É hoje! Faltam ${minutos}min ${segundos}s 🥳`;
      }

      return `É agoraaa! 🎉🦁`;
    }

    // Atualiza no card
    function atualizarContagem() {
      const agora = new Date();
      const diff = dataEvento.getTime() - agora.getTime();

      if (diff <= 0) {
        el.countdownText.textContent = "A festa já começou (ou já aconteceu) 💛";
        return;
      }

      el.countdownText.textContent = formatCountdown(diff);
    }

    // Roda agora e depois a cada 1s
    atualizarContagem();
    setInterval(atualizarContagem, 1000);
  }

  // =========================================================
  // 13) INICIALIZAÇÃO
  // =========================================================
  aplicarDadosNoConvite();
  configurarVideoTopo();
  configurarEnvelope();
  configurarBotaoWhatsapp();
  configurarBotaoMaps();
  configurarModalPresentes();
  configurarAlbum();
  configurarContagemRegressiva();
});