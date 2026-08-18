/* ==========================================================================
   THE GREEK GEEK — shared behaviour
   Nav, scroll reveal, hero particles, newsletter, and render helpers.
   ========================================================================== */

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav: glass drawer -------------------------------------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (navToggle && nav) {
    const backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "icon-btn nav-close";
    closeBtn.setAttribute("aria-label", "Close menu");
    closeBtn.textContent = "✕";
    nav.prepend(closeBtn);

    function setNav(open) {
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      if (open) setTimeout(() => closeBtn.focus(), 40);
      else if (nav.contains(document.activeElement)) navToggle.focus();
    }
    navToggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
    closeBtn.addEventListener("click", () => setNav(false));
    backdrop.addEventListener("click", () => setNav(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setNav(false);
    });
  }

  /* ---- Scroll reveal (staggered fade-and-rise) ---------------------------- */
  const supportsReveal = "IntersectionObserver" in window && !reducedMotion;
  const io = supportsReveal
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

  // Observes every un-revealed .reveal element. Pages that inject cards call
  // this again (window.GG_observeReveals) after rendering.
  function observeReveals() {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
      if (!io) {
        el.classList.add("is-visible");
        return;
      }
      const siblings = el.parentElement
        ? Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"))
        : [];
      const idx = siblings.indexOf(el);
      el.style.setProperty("--reveal-delay", `${Math.max(idx, 0) * 90}ms`);
      io.observe(el);
    });
  }
  observeReveals();
  window.GG_observeReveals = observeReveals;

  /* ---- Hero particles: golden motes drifting upward ------------------------ */
  const canvas = document.querySelector(".hero__particles canvas");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    const hero = canvas.closest(".hero");
    let motes = [];
    let raf = null;
    let w = 0, h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(randomY) {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 6,
        r: 0.8 + Math.random() * 1.9,
        vy: 0.15 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.5,
      };
    }

    function tick(t) {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.vy;
        m.x += m.vx + Math.sin(t / 1600 + m.phase) * 0.18;
        if (m.y < -8) Object.assign(m, spawn(false));
        const flicker = 0.75 + Math.sin(t / 700 + m.phase) * 0.25;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 201, 100, ${(m.alpha * flicker).toFixed(3)})`;
        ctx.shadowColor = "rgba(212, 175, 55, 0.8)";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    }

    function start() {
      resize();
      const count = Math.min(60, Math.max(24, Math.round(w / 22)));
      motes = Array.from({ length: count }, () => spawn(true));
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    start();
    window.addEventListener("resize", () => { stop(); start(); });
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stop() : start();
    });
  }

  /* ---- Newsletter (placeholder — no backend yet) --------------------------- */
  document.querySelectorAll("form[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = form.parentElement.querySelector(".form-success");
      form.hidden = true;
      if (success) {
        success.classList.add("is-visible");
        success.focus && success.focus();
      }
    });
  });

  /* ---- Footer year ---------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();

/* ==========================================================================
   Render helpers — shared by home + grimoire pages (global GG namespace)
   ========================================================================== */
window.GG = (function () {
  "use strict";

  const SPARKLE_PATH = "M12 1.6 L14.6 9.4 L22.4 12 L14.6 14.6 L12 22.4 L9.4 14.6 L1.6 12 L9.4 9.4 Z";

  function sparkleStars(difficulty, max) {
    max = max || 3;
    let out = `<span class="stars" role="img" aria-label="Difficulty: ${difficulty} of ${max} stars">`;
    for (let i = 1; i <= max; i++) {
      out += `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="${i <= difficulty ? "lit" : "dim"}" d="${SPARKLE_PATH}"/></svg>`;
    }
    return out + "</span>";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function formatDate(iso) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  function favButton(recipe, variant) {
    const Fav = window.FavouritesStore;
    const pressed = Fav ? Fav.has(recipe.slug) : false;
    return `
      <button type="button" class="fav-toggle${variant ? " fav-toggle--" + variant : ""}"
              data-fav-slug="${escapeHtml(recipe.slug)}" aria-pressed="${pressed}"
              aria-label="Favourite: ${escapeHtml(recipe.title)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${SPARKLE_PATH}"/></svg>
      </button>`;
  }

  function recipeCard(recipe) {
    const D = window.GrimoireData;
    const cat = D.getCategory(recipe.category);
    const mins = D.totalMinutes(recipe);
    const media = recipe.heroImage
      ? `<img src="${escapeHtml(recipe.heroImage)}" alt="" loading="lazy" width="480" height="300">`
      : `<span aria-hidden="true">${recipe.heroEmoji}</span>`;
    return `
      <article class="recipe-card panel ornate reveal">
        <span class="corners" aria-hidden="true"></span>
        ${favButton(recipe)}
        <a class="recipe-card__link" href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
          <div class="recipe-card__media" style="background:${recipe.heroGradient}">
            ${media}
            <span class="category-badge">${escapeHtml(cat ? cat.label : "")}</span>
          </div>
          <div class="recipe-card__body">
            <h3 class="recipe-card__title flourish">${escapeHtml(recipe.title)}</h3>
            <div class="recipe-card__meta">
              ${sparkleStars(recipe.difficulty)}
              <span>⏱ ${mins} min</span>
              <span>🔥 ${recipe.macros.calories} kcal</span>
              <span>💪 ${recipe.macros.protein}g protein</span>
            </div>
            <p class="recipe-card__excerpt">${escapeHtml(recipe.excerpt)}</p>
            <div class="tag-row">
              ${recipe.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
              ${D.isSpeedrun(recipe) ? '<span class="tag" style="color:var(--ember);background:var(--ember-soft);border-color:rgba(255,140,90,0.4)">speedrun</span>' : ""}
            </div>
          </div>
        </a>
      </article>`;
  }

  // Compact row for overlay result lists
  function resultRow(recipe) {
    const D = window.GrimoireData;
    const cat = D.getCategory(recipe.category);
    return `
      <div class="result-item">
        <a class="result-row panel" href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
          <span class="result-row__thumb" style="background:${recipe.heroGradient}" aria-hidden="true">${recipe.heroEmoji}</span>
          <span>
            <span class="result-row__title">${escapeHtml(recipe.title)}</span>
            <span class="result-row__meta">⏱ ${D.totalMinutes(recipe)} min · 🔥 ${recipe.macros.calories} kcal · ${escapeHtml(cat ? cat.label : "")}</span>
          </span>
        </a>
        ${favButton(recipe, "row")}
      </div>`;
  }

  // Miso-fronted loading / empty states
  function miniState(kind, pose, title, text) {
    return `
      <div class="mini-state${kind === "loading" ? " mini-state--loading" : ""}" role="status">
        <img src="assets/mascot/${pose}" alt="" width="150" height="124">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(text)}</p>
      </div>`;
  }

  return { sparkleStars, escapeHtml, formatDate, recipeCard, resultRow, favButton, miniState, SPARKLE_PATH };
})();

/* ==========================================================================
   Site-wide polish features — injected on every page:
   header favourites button, search overlay, favourites overlay,
   "Roll for a recipe" button. Requires GrimoireData + FavouritesStore.
   ========================================================================== */
(function () {
  "use strict";
  const D = window.GrimoireData;
  const Fav = window.FavouritesStore;
  const GG = window.GG;
  if (!D || !Fav) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Overlay plumbing (shared by search + favourites) --------------------- */
  let openOverlayEl = null;
  let lastFocus = null;

  function buildOverlay(id, label, headHtml) {
    const el = document.createElement("div");
    el.className = "overlay";
    el.id = id;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", label);
    el.hidden = true;
    el.innerHTML = `
      <div class="overlay__inner">
        <div class="overlay__head">
          <h2 class="overlay__title">${headHtml}</h2>
          <button type="button" class="icon-btn overlay__close" aria-label="Close">✕</button>
        </div>
        <div class="overlay__slot"></div>
      </div>`;
    document.body.appendChild(el);
    el.querySelector(".overlay__close").addEventListener("click", closeOverlay);
    el.addEventListener("click", (e) => { if (e.target === el) closeOverlay(); });
    return el;
  }

  function openOverlay(el, focusEl) {
    lastFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("is-open"));
    document.body.classList.add("overlay-open");
    openOverlayEl = el;
    (focusEl || el.querySelector(".overlay__close")).focus();
  }

  function closeOverlay() {
    if (!openOverlayEl) return;
    const el = openOverlayEl;
    openOverlayEl = null;
    el.classList.remove("is-open");
    document.body.classList.remove("overlay-open");
    setTimeout(() => { el.hidden = true; }, reducedMotion ? 0 : 280);
    if (lastFocus) lastFocus.focus();
  }

  // Esc closes; Tab is trapped inside the open overlay
  document.addEventListener("keydown", (e) => {
    if (!openOverlayEl) return;
    if (e.key === "Escape") { closeOverlay(); return; }
    if (e.key !== "Tab") return;
    const focusables = openOverlayEl.querySelectorAll(
      'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });

  /* ---- Search overlay --------------------------------------------------------- */
  const searchOverlay = buildOverlay("search-overlay", "Search the grimoire", "✦ Search the Grimoire");
  searchOverlay.querySelector(".overlay__slot").innerHTML = `
    <div class="search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <label class="visually-hidden" for="overlay-search-input">Search recipes</label>
      <input type="search" id="overlay-search-input" placeholder="Chicken, potion, under 30 minutes…" autocomplete="off">
    </div>
    <div class="overlay__results" id="overlay-search-results" aria-live="polite"></div>
    <p class="overlay__hint"><kbd>Esc</kbd> to close · results update as you type</p>`;

  const searchInput = searchOverlay.querySelector("#overlay-search-input");
  const searchResults = searchOverlay.querySelector("#overlay-search-results");

  function searchInitialState() {
    searchResults.innerHTML = GG.miniState("empty", "miso-scroll.png",
      "The grimoire awaits", "Start typing to search every recipe scroll by name, ingredient vibe, or tag.");
  }

  let searchTimer = null;
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    clearTimeout(searchTimer);
    if (!q) { searchInitialState(); return; }
    searchResults.innerHTML = GG.miniState("loading", "miso-cooking.png",
      "Stirring the cauldron…", "Searching the grimoire.");
    searchTimer = setTimeout(() => {
      const matches = D.queryRecipes({ query: q }, "popular");
      searchResults.innerHTML = matches.length
        ? matches.map(GG.resultRow).join("")
        : GG.miniState("empty", "miso-peek.png",
            "No scrolls match that incantation", "Try a different word — or roll the d20 and let fate cook.");
    }, 160);
  });

  // Enter opens the top result
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = searchResults.querySelector(".result-row");
    if (first) first.click();
  });

  function openSearch() {
    searchInput.value = "";
    searchInitialState();
    openOverlay(searchOverlay, searchInput);
  }

  /* ---- Favourites overlay ------------------------------------------------------- */
  const favOverlay = buildOverlay("fav-overlay", "Favourite recipes", "✦ Favourite Scrolls");
  const favSlot = favOverlay.querySelector(".overlay__slot");

  function renderFavourites() {
    const recipes = Fav.list().map(D.getRecipeBySlug).filter(Boolean);
    favSlot.innerHTML = recipes.length
      ? `<div class="overlay__results">${recipes.map(GG.resultRow).join("")}</div>`
      : GG.miniState("empty", "miso-star.png",
          "No favourites yet", "Tap the sparkle star on any recipe and it will be kept safe here.");
  }

  /* ---- Header buttons ------------------------------------------------------------ */
  const actions = document.querySelector(".header-actions");
  if (actions) {
    const searchLink = actions.querySelector('a[href="recipes.html?focus=search"]');
    if (searchLink) {
      searchLink.addEventListener("click", (e) => { e.preventDefault(); openSearch(); });
    }
    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "icon-btn fav-open";
    favBtn.setAttribute("aria-label", "View favourite recipes");
    favBtn.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path d="${GG.SPARKLE_PATH}"/></svg>
      <span class="fav-count" hidden>0</span>`;
    favBtn.addEventListener("click", () => { renderFavourites(); openOverlay(favOverlay); });
    actions.insertBefore(favBtn, actions.querySelector(".btn"));
  }

  /* ---- Favourite toggle delegation + sync ------------------------------------------ */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav-slug]");
    if (!btn) return;
    e.preventDefault();
    Fav.toggle(btn.dataset.favSlug);
  });

  function syncFavUI() {
    document.querySelectorAll("[data-fav-slug]").forEach((btn) => {
      const pressed = Fav.has(btn.dataset.favSlug);
      btn.setAttribute("aria-pressed", String(pressed));
      const label = btn.querySelector(".fav-label");
      if (label) label.textContent = pressed ? "Favourited" : "Save to favourites";
    });
    document.querySelectorAll(".fav-count").forEach((badge) => {
      badge.textContent = Fav.count();
      badge.hidden = Fav.count() === 0;
    });
    if (openOverlayEl === favOverlay) renderFavourites();
  }
  Fav.onChange(syncFavUI);
  syncFavUI();
  // Cards rendered after this script runs get synced by their page calling GG_observeReveals;
  // also observe DOM additions cheaply via a microtask on load.
  window.addEventListener("load", syncFavUI);

  /* ---- "Roll for a recipe" floating button -------------------------------------------- */
  const roll = document.createElement("button");
  roll.type = "button";
  roll.className = "roll-btn";
  roll.setAttribute("aria-label", "Roll for a random recipe");
  roll.innerHTML = `
    <span class="roll-btn__clip" aria-hidden="true"><img src="assets/mascot/miso-d20.png" alt="" width="64" height="64"></span>
    <span class="roll-num" aria-hidden="true"></span>`;
  document.body.appendChild(roll);

  let rolling = false;
  // Reset if the page is restored from the back-forward cache mid/post-roll
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      rolling = false;
      roll.classList.remove("is-rolling", "is-settled");
    }
  });
  roll.addEventListener("click", () => {
    if (rolling) return;
    const currentSlug = new URLSearchParams(location.search).get("slug");
    const pool = D.getAllRecipes().filter((r) => r.slug !== currentSlug);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const go = () => { location.href = "recipe.html?slug=" + encodeURIComponent(pick.slug); };
    if (reducedMotion) { go(); return; }

    rolling = true;
    const num = roll.querySelector(".roll-num");
    roll.classList.add("is-rolling");
    const flicker = setInterval(() => {
      num.textContent = 1 + Math.floor(Math.random() * 20);
    }, 65);
    setTimeout(() => {
      clearInterval(flicker);
      num.textContent = 20; // house rule: fate always crits
      roll.classList.remove("is-rolling");
      roll.classList.add("is-settled");
      setTimeout(go, 240);
    }, 480);
  });
})();
