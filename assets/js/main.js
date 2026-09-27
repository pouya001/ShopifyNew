/* ÉGIDE — interactions du site */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var lenis = null;

  function store(kind) {
    try { return window[kind]; } catch (e) { return null; }
  }
  var session = store("sessionStorage");
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- Défilement doux ---------- */
  if (!reduceMotion && typeof window.Lenis === "function") {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"], a[href^="index.html#"]');
      if (!a) return;
      var hash = a.getAttribute("href").split("#")[1];
      var target = hash && document.getElementById(hash);
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); }
    });
  }
  if (hasGsap) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- En-tête ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var lastY = 0;
    var onScroll = function () {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      header.classList.toggle("is-hidden", y > 600 && y > lastY + 4 && !document.querySelector(".nav.is-open"));
      if (y < lastY - 4 || y < 600) header.classList.remove("is-hidden");
      lastY = y;
    };
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
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Hero : le faisceau qui veille sur la foule ---------- */
  var hero = document.querySelector(".hero");
  if (hero) {
    var target = { x: 0.62, y: 0.4 }, pos = { x: 0.62, y: 0.4 };
    var lastMove = 0, t0 = performance.now();
    if (finePointer) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        target.x = (e.clientX - r.left) / r.width;
        target.y = (e.clientY - r.top) / r.height;
        lastMove = performance.now();
      });
    }
    var tick = function (now) {
      if (now - lastMove > 2500 && !reduceMotion) {
        var s = (now - t0) / 1000;
        target.x = 0.58 + Math.sin(s * 0.35) * 0.22;
        target.y = 0.38 + Math.sin(s * 0.53) * 0.12;
      }
      pos.x = lerp(pos.x, target.x, 0.07);
      pos.y = lerp(pos.y, target.y, 0.07);
      hero.style.setProperty("--x", (pos.x * 100).toFixed(2) + "%");
      hero.style.setProperty("--y", (pos.y * 100).toFixed(2) + "%");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    if (hasGsap && !reduceMotion) {
      window.gsap.to(".hero-media", {
        yPercent: 18, scale: 1.06, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* ---------- Ticker radio ---------- */
  var radioMsg = document.getElementById("radio-msg");
  if (radioMsg) {
    var MESSAGES = [
      ["18:30", "CH 2 · PC → Porte A : ouverture des portes, file fluide."],
      ["19:05", "CH 3 · Accueil : 640 invités enregistrés, vestiaire à 40 %."],
      ["21:40", "CH 2 · Fosse : densité stable, deux agents en renfort côté bar."],
      ["22:15", "CH 1 · VIP : arrivée de l'artiste, accès loges sécurisé."],
      ["00:30", "CH 2 · Sorties B et C ouvertes, parking en évacuation progressive."]
    ];
    var mi = 0;
    var render = function (time, text, n) {
      radioMsg.innerHTML = "<b>" + time + "</b>&nbsp;&nbsp;" + text.slice(0, n).replace(/&/g, "&amp;").replace(/</g, "&lt;") + '<span class="radio-caret"></span>';
    };
    var play = function () {
      var m = MESSAGES[mi % MESSAGES.length], n = 0;
      if (reduceMotion) { render(m[0], m[1], m[1].length); mi++; setTimeout(play, 5000); return; }
      var type = setInterval(function () {
        n += 1;
        render(m[0], m[1], n);
        if (n >= m[1].length) { clearInterval(type); mi++; setTimeout(play, 3200); }
      }, 28);
    };
    play();
  }

  /* ---------- Manifeste : les mots s'allument ---------- */
  var manifesto = document.querySelector(".manifesto-text");
  if (manifesto && hasGsap && !reduceMotion) {
    var walk = function (node) {
      [].slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement("span");
            s.className = "w";
            s.textContent = part;
            frag.appendChild(s);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.classList.contains("pill")) {
          child.classList.add("w");
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(manifesto);
    doc.classList.add("js-split");
    var words = manifesto.querySelectorAll(".w");
    window.ScrollTrigger.create({
      trigger: manifesto,
      start: "top 78%",
      end: "bottom 45%",
      scrub: true,
      onUpdate: function (self) {
        var lit = Math.round(self.progress * words.length);
        for (var i = 0; i < words.length; i++) words[i].style.opacity = i < lit ? 1 : "";
      }
    });
  }

  /* ---------- Une nuit avec Égide : défilement horizontal ---------- */
  var night = document.querySelector(".night");
  if (night) {
    var track = night.querySelector(".night-track");
    var viewport = night.querySelector(".night-viewport");
    var clock = night.querySelector(".night-clock strong");
    var bar = night.querySelector(".night-progress");
    var cards = [].slice.call(night.querySelectorAll(".night-card[data-time]"));
    var setProgress = function (p) {
      if (bar) bar.style.setProperty("--p", p.toFixed(4));
      if (!clock || !cards.length) return;
      var idx = Math.min(cards.length - 1, Math.floor(p * cards.length));
      clock.textContent = cards[idx].getAttribute("data-time");
    };
    if (hasGsap && !reduceMotion && window.matchMedia("(min-width: 900px)").matches) {
      night.classList.add("is-pinned");
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      window.gsap.to(track, {
        x: function () { return -dist(); },
        ease: "none",
        scrollTrigger: {
          trigger: night,
          start: "top top",
          end: function () { return "+=" + dist(); },
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: function (self) { setProgress(self.progress); }
        }
      });
    } else if (viewport) {
      viewport.addEventListener("scroll", function () {
        var max = viewport.scrollWidth - viewport.clientWidth;
        setProgress(max > 0 ? viewport.scrollLeft / max : 0);
      }, { passive: true });
    }
    setProgress(0);
  }

  /* ---------- Apparitions ---------- */
  var revealables = [].slice.call(document.querySelectorAll("[data-reveal]"));
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    revealables.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("reveal"); io.observe(el); }
    });
  }

  /* ---------- Compteurs ---------- */
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, end = Number(el.getAttribute("data-count")), start = performance.now();
        var step = function (now) {
          var k = Math.min(1, (now - start) / 1600);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.textContent = "0"; co.observe(el); }
    });
  }

  /* ---------- Terrains : aperçu qui suit le curseur ---------- */
  var venues = document.querySelector(".venues");
  var preview = document.querySelector(".venue-preview");
  if (venues && preview && finePointer) {
    var imgs = [].slice.call(preview.querySelectorAll("img"));
    var p = { x: 0, y: 0 }, pt = { x: 0, y: 0 }, running = false;
    var follow = function () {
      p.x = lerp(p.x, pt.x, 0.14);
      p.y = lerp(p.y, pt.y, 0.14);
      preview.style.left = p.x + "px";
      preview.style.top = p.y + "px";
      if (running) requestAnimationFrame(follow);
    };
    venues.addEventListener("pointermove", function (e) { pt.x = e.clientX; pt.y = e.clientY; });
    [].slice.call(venues.querySelectorAll(".venue")).forEach(function (row, i) {
      row.addEventListener("pointerenter", function (e) {
        if (!running) { p.x = pt.x = e.clientX; p.y = pt.y = e.clientY; running = true; requestAnimationFrame(follow); }
        imgs.forEach(function (im, j) { im.classList.toggle("is-active", j === i); });
        preview.classList.add("is-on");
      });
    });
    venues.addEventListener("pointerleave", function () { preview.classList.remove("is-on"); running = false; });
  }

  /* ---------- Halo sur les cartes de service ---------- */
  [].slice.call(document.querySelectorAll(".service")).forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Curseur + boutons magnétiques ---------- */
  if (finePointer && !reduceMotion) {
    var cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<span class="cursor-label">Voir</span>';
    document.body.appendChild(cursor);
    doc.classList.add("has-cursor");
    var c = { x: -100, y: -100 }, ct = { x: -100, y: -100 };
    window.addEventListener("pointermove", function (e) { ct.x = e.clientX; ct.y = e.clientY; }, { passive: true });
    var moveCursor = function () {
      c.x = lerp(c.x, ct.x, 0.22);
      c.y = lerp(c.y, ct.y, 0.22);
      cursor.style.transform = "translate3d(" + c.x + "px," + c.y + "px,0)";
      requestAnimationFrame(moveCursor);
    };
    requestAnimationFrame(moveCursor);
    document.addEventListener("pointerover", function (e) {
      var view = e.target.closest("[data-cursor='view']");
      var link = e.target.closest("a, button, summary, label, input, select, textarea");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-link", !view && !!link);
    });

    [].slice.call(document.querySelectorAll(".magnetic")).forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + dx * 0.25 + "px," + dy * 0.25 + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Estimateur de dispositif ---------- */
  var est = document.getElementById("estimator");
  if (est) {
    // Ratios indicatifs par tranche de 1 000 personnes présentes simultanément.
    var PROFILES = {
      festival:  { label: "Concert / festival",    sec: 4.0, stew: 5.0, host: 0.6, minSec: 4, minStew: 2, minHost: 1 },
      salon:     { label: "Salon / congrès",       sec: 1.6, stew: 3.0, host: 3.0, minSec: 2, minStew: 2, minHost: 2 },
      gala:      { label: "Gala / soirée privée",  sec: 3.0, stew: 2.0, host: 8.0, minSec: 2, minStew: 1, minHost: 2 },
      sport:     { label: "Événement sportif",     sec: 4.0, stew: 8.0, host: 0.6, minSec: 4, minStew: 4, minHost: 1 },
      corporate: { label: "Corporate / lancement", sec: 2.0, stew: 2.0, host: 6.0, minSec: 2, minStew: 1, minHost: 2 },
      mariage:   { label: "Mariage / réception",   sec: 2.0, stew: 3.0, host: 6.0, minSec: 2, minStew: 1, minHost: 2 }
    };
    // Curseur 0 → 100 : de 50 à 20 000 personnes (échelle logarithmique).
    var MIN = 50, MAX = 20000;
    var range = document.getElementById("est-guests");
    var guestsOut = document.getElementById("est-guests-out");
    var hours = document.getElementById("est-hours");
    var hoursOut = document.getElementById("est-hours-out");
    var fmt = new Intl.NumberFormat("fr-BE");
    var toGuests = function (v) {
      var g = MIN * Math.pow(MAX / MIN, v / 100);
      var st = g < 500 ? 10 : g < 2000 ? 50 : g < 10000 ? 100 : 500;
      return Math.round(g / st) * st;
    };
    var compute = function () {
      var type = (est.querySelector('input[name="est-type"]:checked') || {}).value || "salon";
      var pr = PROFILES[type];
      var guests = toGuests(Number(range.value));
      var h = Number(hours.value);
      var k = guests / 1000;
      var has = function (id) { var el = document.getElementById(id); return el && el.checked; };
      var sec = Math.max(pr.minSec, k * pr.sec);
      var stew = Math.max(pr.minStew, k * pr.stew);
      var host = Math.max(pr.minHost, k * pr.host);
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
      document.getElementById("est-shift").textContent = h > 10
        ? "Au-delà de 10 h de mission, nous organisons des relèves : l'effectif présent reste le même, mais deux équipes se succèdent."
        : "Effectif présent simultanément, briefing et mise en place compris.";

      var summary = pr.label + " · " + fmt.format(guests) + " personnes · " + (h >= 24 ? "24 h et plus" : h + " h") +
        " — estimation : " + sec + " agent(s) de sécurité, " + stew + " steward(s), " + host + " hôte(sse)s" +
        (leads ? ", " + leads + " coordinateur / chef d'équipe" : "") + " (" + total + " personnes).";
      if (session) {
        try { session.setItem("egide-estimate", JSON.stringify({ type: type, guests: guests, summary: summary })); }
        catch (e) { /* stockage indisponible : le formulaire reste vide */ }
      }
    };
    est.addEventListener("input", compute);
    est.addEventListener("change", compute);
    compute();
  }

  /* ---------- Formulaire de contact ---------- */
  var form = document.getElementById("quote-form");
  if (form) {
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
      if (note) { note.hidden = false; note.querySelector("b").textContent = saved.summary; }
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

  /* ---------- Année ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  window.addEventListener("load", function () { if (hasGsap) window.ScrollTrigger.refresh(); });
  doc.classList.add("js");
})();
