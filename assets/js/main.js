/* ÉGIDE — interactions du site (aucune dépendance) */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(kind) {
    try { return window[kind]; } catch (e) { return null; }
  }
  var session = store("sessionStorage");

  /* ---------- En-tête : ombre au défilement ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Apparition au défilement (seulement sous la ligne de flottaison) ---------- */
  var revealables = [].slice.call(document.querySelectorAll("[data-reveal]"));
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("reveal");
        io.observe(el);
      }
    });
  }

  /* ---------- Badge : inclinaison au survol ---------- */
  var stage = document.querySelector(".badge-stage");
  var badge = document.querySelector(".badge");
  if (stage && badge && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      badge.style.transform = "rotateY(" + (x * 16).toFixed(2) + "deg) rotateX(" + (-y * 12).toFixed(2) + "deg)";
    });
    stage.addEventListener("pointerleave", function () { badge.style.transform = ""; });
  }

  /* ---------- Estimateur de dispositif ---------- */
  var est = document.getElementById("estimator");
  if (est) {
    // Ratios indicatifs par tranche de 1 000 personnes présentes simultanément.
    var PROFILES = {
      festival:  { label: "Concert / festival",   sec: 4.0, stew: 5.0, host: 0.6, minSec: 4, minStew: 2, minHost: 1 },
      salon:     { label: "Salon / congrès",      sec: 1.6, stew: 3.0, host: 3.0, minSec: 2, minStew: 2, minHost: 2 },
      gala:      { label: "Gala / soirée privée", sec: 3.0, stew: 2.0, host: 8.0, minSec: 2, minStew: 1, minHost: 2 },
      sport:     { label: "Événement sportif",    sec: 4.0, stew: 8.0, host: 0.6, minSec: 4, minStew: 4, minHost: 1 },
      corporate: { label: "Corporate / lancement", sec: 2.0, stew: 2.0, host: 6.0, minSec: 2, minStew: 1, minHost: 2 },
      mariage:   { label: "Mariage / réception",  sec: 2.0, stew: 3.0, host: 6.0, minSec: 2, minStew: 1, minHost: 2 }
    };
    // Échelle du curseur : 0 → 100 correspond à 50 → 20 000 personnes (logarithmique).
    var MIN = 50, MAX = 20000;
    var range = document.getElementById("est-guests");
    var guestsOut = document.getElementById("est-guests-out");
    var hours = document.getElementById("est-hours");
    var hoursOut = document.getElementById("est-hours-out");
    var fmt = new Intl.NumberFormat("fr-BE");

    var toGuests = function (v) {
      var g = MIN * Math.pow(MAX / MIN, v / 100);
      var step = g < 500 ? 10 : g < 2000 ? 50 : g < 10000 ? 100 : 500;
      return Math.round(g / step) * step;
    };

    var compute = function () {
      var type = (est.querySelector('input[name="est-type"]:checked') || {}).value || "salon";
      var p = PROFILES[type];
      var guests = toGuests(Number(range.value));
      var h = Number(hours.value);
      var k = guests / 1000;
      var has = function (id) { var el = document.getElementById(id); return el && el.checked; };

      var sec = Math.max(p.minSec, k * p.sec);
      var stew = Math.max(p.minStew, k * p.stew);
      var host = Math.max(p.minHost, k * p.host);

      if (has("est-alcohol")) sec *= 1.25;
      if (has("est-night")) sec *= 1.2;
      if (has("est-multi")) { sec += 2; stew += 2; }
      var vip = has("est-vip") ? 2 : 0;
      if (vip) host += 1;

      sec = Math.ceil(sec) + vip;
      stew = Math.ceil(stew);
      host = Math.ceil(host);

      var field = sec + stew + host;
      var leads = field >= 6 ? 1 + Math.floor(field / 20) : 0;
      var total = field + leads;

      range.style.setProperty("--fill", range.value + "%");
      hours.style.setProperty("--fill", ((h - 4) / 20 * 100) + "%");
      guestsOut.textContent = fmt.format(guests) + (guests >= MAX ? "+" : "");
      hoursOut.textContent = h >= 24 ? "24 h +" : h + " h";

      document.getElementById("est-total").textContent = total;
      document.getElementById("est-sec").textContent = sec;
      document.getElementById("est-stew").textContent = stew;
      document.getElementById("est-host").textContent = host;
      document.getElementById("est-lead").textContent = leads;

      var note = document.getElementById("est-shift");
      note.textContent = h > 10
        ? "Au-delà de 10 h de mission, nous organisons des relèves : l'effectif présent reste le même, mais deux équipes se succèdent."
        : "Effectif présent simultanément, briefing et mise en place compris.";

      var summary = p.label + " · " + fmt.format(guests) + " personnes · " + (h >= 24 ? "24 h et plus" : h + " h") +
        " — estimation : " + sec + " agent(s) de sécurité, " + stew + " steward(s), " + host + " hôte(sse)s" +
        (leads ? ", " + leads + " coordinateur / chef d'équipe" : "") + " (" + total + " personnes).";
      if (session) {
        try {
          session.setItem("egide-estimate", JSON.stringify({ type: type, guests: guests, summary: summary }));
        } catch (e) { /* stockage indisponible : le formulaire reste vide */ }
      }
    };

    est.addEventListener("input", compute);
    est.addEventListener("change", compute);
    compute();
  }

  /* ---------- Formulaire de contact ---------- */
  var form = document.getElementById("quote-form");
  if (form) {
    // Pré-remplissage depuis l'estimateur
    var saved = null;
    if (session) {
      try { saved = JSON.parse(session.getItem("egide-estimate") || "null"); } catch (e) { saved = null; }
    }
    if (saved && saved.summary) {
      var typeSel = document.getElementById("f-type");
      var guestsIn = document.getElementById("f-guests");
      var msg = document.getElementById("f-message");
      if (typeSel && saved.type) typeSel.value = saved.type;
      if (guestsIn && saved.guests) guestsIn.value = saved.guests;
      if (msg && !msg.value) msg.value = "Estimation réalisée sur le site : " + saved.summary + "\n\n";
      var note = document.getElementById("prefill-note");
      if (note) {
        note.hidden = false;
        note.querySelector("b").textContent = saved.summary;
      }
    }

    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = new FormData(form);
      if (data.get("website")) return; // piège à robots

      var endpoint = form.getAttribute("data-endpoint");
      var lines = [];
      data.forEach(function (value, key) {
        if (key === "website" || key === "consent" || !String(value).trim()) return;
        lines.push(key + " : " + value);
      });

      var show = function (title, text) {
        status.hidden = false;
        status.querySelector("strong").textContent = title;
        status.querySelector("p").textContent = text;
        status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      };

      if (endpoint) {
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (res) {
            if (!res.ok) throw new Error(res.status);
            form.reset();
            show("Demande envoyée.", "Merci. Un coordinateur vous répond sous 24 heures ouvrables avec une première proposition.");
            if (session) { try { session.removeItem("egide-estimate"); } catch (err) { /* ignore */ } }
          })
          .catch(function () {
            show("L'envoi n'a pas abouti.", "Vérifiez votre connexion puis réessayez, ou écrivez-nous directement à contact@egide-events.be.");
          })
          .then(function () { btn.disabled = false; });
        return;
      }

      // Sans service d'envoi configuré : on prépare un e-mail pré-rempli.
      var subject = "Demande de devis — " + (data.get("type_evenement") || "événement");
      window.location.href = "mailto:contact@egide-events.be?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      show("Votre demande est prête.", "Votre messagerie devrait s'ouvrir avec la demande pré-remplie. Si rien ne s'ouvre, copiez vos informations et écrivez-nous à contact@egide-events.be.");
    });
  }

  /* ---------- Année du pied de page ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  doc.classList.add("js");
})();
