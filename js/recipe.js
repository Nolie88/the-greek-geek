/* ==========================================================================
   THE GREEK GEEK — recipe detail page
   Servings scaler, ingredient checklist, quest steps, cook mode, toast.
   ========================================================================== */
(function () {
  "use strict";
  const D = window.GrimoireData;
  const GG = window.GG;

  const slug = new URLSearchParams(location.search).get("slug");
  const recipe = slug ? D.getRecipeBySlug(slug) : null;
  if (!recipe) {
    location.replace("404.html");
    return;
  }

  /* ---- Session state (persists across reloads within the tab session) ----- */
  const STORE_KEY = "gg-recipe-" + recipe.slug;
  let state = { servings: recipe.servings, checked: [], done: [] };
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY));
    if (saved && typeof saved.servings === "number") state = saved;
  } catch (e) { /* fresh state */ }
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  const factor = () => state.servings / recipe.servings;

  /* ---- Quantity formatting ------------------------------------------------- */
  const FRACTIONS = [
    [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"], [1 / 2, "½"],
    [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"],
  ];
  function formatQty(value) {
    if (value >= 100) return String(Math.round(value));
    if (value >= 10) return String(Math.round(value * 2) / 2);
    const whole = Math.floor(value);
    const frac = value - whole;
    if (frac < 0.05) return String(whole || Math.round(value));
    for (const [f, glyph] of FRACTIONS) {
      if (Math.abs(frac - f) < 0.05) return (whole ? whole + " " : "") + glyph;
    }
    return String(Math.round(value * 10) / 10);
  }

  const INVARIANT_UNITS = new Set(["g", "kg", "ml", "l", "tbsp", "tsp"]);
  function formatIngredient(ing) {
    if (ing.qty == null) return { qty: "", text: ing.item };
    const scaled = ing.qty * factor();
    const qtyStr = formatQty(scaled);
    let unit = ing.unit || "";
    if (unit && !INVARIANT_UNITS.has(unit) && scaled > 1) unit += "s";
    let item = ing.item;
    if (!unit && ing.itemPlural && scaled > 1) item = ing.itemPlural;
    return { qty: qtyStr + (unit ? " " + unit : ""), text: item };
  }

  /* ---- Header --------------------------------------------------------------- */
  const cat = D.getCategory(recipe.category);
  document.title = recipe.title + " | The Greek Geek";
  document.querySelector('meta[name="description"]').setAttribute("content", recipe.excerpt);
  document.getElementById("r-category").textContent = cat ? cat.label : "";
  document.getElementById("r-title").textContent = recipe.title;
  document.getElementById("r-stars").innerHTML = GG.sparkleStars(recipe.difficulty);
  document.getElementById("r-prep").textContent = "⏱ Prep " + recipe.prepMinutes + " min";
  document.getElementById("r-cook").textContent = "🔥 Cook " + recipe.cookMinutes + " min";
  document.getElementById("r-total").textContent = "✦ Total " + D.totalMinutes(recipe) + " min";
  document.getElementById("r-tags").innerHTML =
    recipe.tags.map((t) => `<span class="tag">${GG.escapeHtml(t)}</span>`).join("") +
    (D.isSpeedrun(recipe)
      ? '<span class="tag" style="color:var(--ember);background:var(--ember-soft);border-color:rgba(255,140,90,0.4)">speedrun</span>'
      : "");

  /* Favourite toggle beside the meta chips (main.js delegation handles clicks) */
  if (window.FavouritesStore) {
    document.querySelector(".meta-chips").insertAdjacentHTML("beforeend", `
      <button type="button" class="fav-toggle fav-toggle--inline" data-fav-slug="${GG.escapeHtml(recipe.slug)}"
              aria-pressed="${window.FavouritesStore.has(recipe.slug)}">
        <svg viewBox="0 0 24 24" aria-hidden="true" width="15" height="15"><path d="${GG.SPARKLE_PATH}"/></svg>
        <span class="fav-label">${window.FavouritesStore.has(recipe.slug) ? "Favourited" : "Save to favourites"}</span>
      </button>`);
  }

  /* ---- SEO: OpenGraph + Recipe JSON-LD ---------------------------------------- */
  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }
  setMeta('meta[property="og:title"]', recipe.title + " | The Greek Geek");
  setMeta('meta[property="og:description"]', recipe.excerpt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.excerpt,
    image: new URL("assets/mascot/miso-cooking.png", document.baseURI).href,
    author: { "@type": "Person", name: "The Greek Geek" },
    datePublished: recipe.publishedAt,
    prepTime: "PT" + recipe.prepMinutes + "M",
    cookTime: "PT" + recipe.cookMinutes + "M",
    totalTime: "PT" + D.totalMinutes(recipe) + "M",
    recipeYield: recipe.servings + " servings",
    recipeCategory: (D.getCategory(recipe.category) || {}).hint || recipe.category,
    keywords: recipe.tags.join(", "),
    nutrition: {
      "@type": "NutritionInformation",
      servingSize: "1 serving",
      calories: recipe.macros.calories + " calories",
      proteinContent: recipe.macros.protein + " g",
      carbohydrateContent: recipe.macros.carbs + " g",
      fatContent: recipe.macros.fat + " g",
    },
    recipeIngredient: recipe.ingredients.map((ing) => {
      if (ing.qty == null) return ing.item;
      let unit = ing.unit || "";
      if (unit && !INVARIANT_UNITS.has(unit) && ing.qty > 1) unit += "s";
      const item = !unit && ing.itemPlural && ing.qty > 1 ? ing.itemPlural : ing.item;
      return ing.qty + (unit ? " " + unit : "") + " " + item;
    }),
    recipeInstructions: recipe.steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: text,
    })),
  };
  const ldScript = document.createElement("script");
  ldScript.type = "application/ld+json";
  ldScript.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(ldScript);

  /* ---- Hero frame ------------------------------------------------------------ */
  const frame = document.getElementById("r-frame");
  frame.style.background = recipe.heroGradient;
  frame.setAttribute("aria-label", "Placeholder artwork for " + recipe.title);
  document.getElementById("r-frame-emoji").textContent = recipe.heroEmoji;

  /* ---- Stats panel ------------------------------------------------------------ */
  // Reference maxes for the bar meters (rough single-meal ceilings).
  const STAT_META = [
    { key: "calories", label: "Calories", unit: " kcal", max: 700, color: "gold" },
    { key: "protein", label: "Protein", unit: "g", max: 50, color: "ember" },
    { key: "carbs", label: "Carbs", unit: "g", max: 80, color: "teal" },
    { key: "fat", label: "Fat", unit: "g", max: 35, color: "parch" },
  ];
  const statRows = document.getElementById("stat-rows");
  statRows.innerHTML = STAT_META.map((s) => `
    <div class="stat-row">
      <span class="stat-row__label">${s.label}</span>
      <div class="meter"><div class="meter__fill meter__fill--${s.color}" data-stat="${s.key}"></div></div>
      <span class="stat-row__value">${recipe.macros[s.key]}${s.unit}</span>
    </div>`).join("");
  requestAnimationFrame(() => {
    STAT_META.forEach((s) => {
      const fill = statRows.querySelector(`[data-stat="${s.key}"]`);
      fill.style.width = Math.min(100, (recipe.macros[s.key] / s.max) * 100) + "%";
    });
  });

  function renderTotals() {
    const m = recipe.macros;
    const n = state.servings;
    document.getElementById("stat-totals").textContent =
      `Whole batch (${n} ${n === 1 ? "serving" : "servings"}): ` +
      `${Math.round(m.calories * n)} kcal · ${Math.round(m.protein * n)}g protein · ` +
      `${Math.round(m.carbs * n)}g carbs · ${Math.round(m.fat * n)}g fat`;
  }

  /* ---- Servings scaler ---------------------------------------------------------- */
  const scaleValue = document.getElementById("scale-value");
  const scaleDown = document.getElementById("scale-down");
  const scaleUp = document.getElementById("scale-up");
  const MIN_SERV = 1, MAX_SERV = 12;

  function renderScaler() {
    scaleValue.textContent = state.servings;
    scaleDown.disabled = state.servings <= MIN_SERV;
    scaleUp.disabled = state.servings >= MAX_SERV;
    document.getElementById("scaler-label").textContent =
      state.servings === recipe.servings ? "Servings" : `Servings (recipe: ${recipe.servings})`;
  }
  scaleDown.addEventListener("click", () => setServings(state.servings - 1));
  scaleUp.addEventListener("click", () => setServings(state.servings + 1));
  function setServings(n) {
    state.servings = Math.min(MAX_SERV, Math.max(MIN_SERV, n));
    save();
    renderScaler();
    renderIngredients();
    renderTotals();
  }

  /* ---- Ingredients checklist ------------------------------------------------------ */
  const ingList = document.getElementById("ingredient-list");
  function renderIngredients() {
    ingList.innerHTML = recipe.ingredients.map((ing, i) => {
      const f = formatIngredient(ing);
      const checked = state.checked.includes(i);
      return `
        <li>
          <button type="button" class="ingredient" data-index="${i}" aria-pressed="${checked}">
            <span class="ingredient__box" aria-hidden="true">✓</span>
            <span class="ingredient__text">${f.qty ? `<span class="qty">${GG.escapeHtml(f.qty)}</span> ` : ""}${GG.escapeHtml(f.text)}</span>
          </button>
        </li>`;
    }).join("");
  }
  ingList.addEventListener("click", (e) => {
    const btn = e.target.closest(".ingredient");
    if (!btn) return;
    const i = Number(btn.dataset.index);
    const at = state.checked.indexOf(i);
    at === -1 ? state.checked.push(i) : state.checked.splice(at, 1);
    save();
    btn.setAttribute("aria-pressed", String(at === -1));
  });

  /* ---- Quest steps ------------------------------------------------------------------ */
  const stepList = document.getElementById("step-list");
  let currentStep = 0;
  let wasAllDone = recipe.steps.every((_, i) => state.done.includes(i));

  stepList.innerHTML = recipe.steps.map((text, i) => `
    <li class="step" data-index="${i}">
      <span class="step__num" aria-hidden="true"></span>
      <p class="step__text">${GG.escapeHtml(text)}</p>
      <button type="button" class="step__done" aria-pressed="false" aria-label="Mark step ${i + 1} complete">✓</button>
    </li>`).join("");

  const stepEls = Array.from(stepList.querySelectorAll(".step"));

  function renderSteps() {
    stepEls.forEach((el, i) => {
      const done = state.done.includes(i);
      el.classList.toggle("is-done", done);
      el.classList.toggle("is-current", i === currentStep);
      const btn = el.querySelector(".step__done");
      btn.setAttribute("aria-pressed", String(done));
      btn.setAttribute("aria-label", (done ? "Unmark" : "Mark") + " step " + (i + 1) + (done ? " complete" : " as complete"));
    });
    renderCookControls();
  }

  function toggleStep(i) {
    const at = state.done.indexOf(i);
    at === -1 ? state.done.push(i) : state.done.splice(at, 1);
    save();
    const allDone = recipe.steps.every((_, k) => state.done.includes(k));
    if (allDone && !wasAllDone) showToast();
    wasAllDone = allDone;
    renderSteps();
  }

  stepList.addEventListener("click", (e) => {
    const btn = e.target.closest(".step__done");
    if (!btn) return;
    toggleStep(Number(btn.closest(".step").dataset.index));
  });

  /* ---- Quest Complete toast ----------------------------------------------------------- */
  const toast = document.getElementById("quest-toast");
  let toastTimer = null;
  function showToast() {
    toast.classList.remove("is-visible");
    void toast.offsetWidth; // restart sparkle animation
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4200);
  }

  /* ---- Cook mode ------------------------------------------------------------------------ */
  const cookBtn = document.getElementById("cook-mode-btn");
  const cookExit = document.getElementById("cook-exit");
  const cookPrev = document.getElementById("cook-prev");
  const cookNext = document.getElementById("cook-next");
  const cookDone = document.getElementById("cook-done");
  const cookProgress = document.getElementById("cook-progress");
  let wakeLock = null;

  function inCookMode() { return document.body.classList.contains("cook-mode"); }

  function renderCookControls() {
    if (!inCookMode()) return;
    cookProgress.textContent = "Step " + (currentStep + 1) + " / " + recipe.steps.length;
    cookPrev.disabled = currentStep === 0;
    cookNext.disabled = currentStep === recipe.steps.length - 1;
    cookDone.textContent = state.done.includes(currentStep) ? "↺ Undo" : "✓ Done";
  }

  async function enterCookMode() {
    const firstUndone = recipe.steps.findIndex((_, i) => !state.done.includes(i));
    currentStep = firstUndone === -1 ? recipe.steps.length - 1 : firstUndone;
    document.body.classList.add("cook-mode");
    cookBtn.setAttribute("aria-pressed", "true");
    renderSteps();
    window.scrollTo({ top: 0 });
    try { wakeLock = await navigator.wakeLock.request("screen"); } catch (e) { /* unsupported — fine */ }
  }
  function exitCookMode() {
    document.body.classList.remove("cook-mode");
    cookBtn.setAttribute("aria-pressed", "false");
    renderSteps();
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  cookBtn.addEventListener("click", () => (inCookMode() ? exitCookMode() : enterCookMode()));
  cookExit.addEventListener("click", exitCookMode);
  cookPrev.addEventListener("click", () => { if (currentStep > 0) { currentStep--; renderSteps(); } });
  cookNext.addEventListener("click", () => { if (currentStep < recipe.steps.length - 1) { currentStep++; renderSteps(); } });
  cookDone.addEventListener("click", () => {
    const wasDone = state.done.includes(currentStep);
    toggleStep(currentStep);
    // Auto-advance after completing a step (not when undoing)
    if (!wasDone && currentStep < recipe.steps.length - 1) { currentStep++; renderSteps(); }
  });
  document.addEventListener("keydown", (e) => {
    if (!inCookMode()) return;
    if (e.key === "ArrowRight") cookNext.click();
    else if (e.key === "ArrowLeft") cookPrev.click();
    else if (e.key === "Escape") exitCookMode();
  });

  /* ---- Print ------------------------------------------------------------------------------ */
  document.getElementById("print-btn").addEventListener("click", () => window.print());

  /* ---- Prev / next + related --------------------------------------------------------------- */
  const adj = D.getAdjacentRecipes(recipe.slug);
  const prevEl = document.getElementById("pager-prev");
  const nextEl = document.getElementById("pager-next");
  prevEl.href = "recipe.html?slug=" + encodeURIComponent(adj.prev.slug);
  prevEl.querySelector(".name").textContent = adj.prev.title;
  nextEl.href = "recipe.html?slug=" + encodeURIComponent(adj.next.slug);
  nextEl.querySelector(".name").textContent = adj.next.title;

  document.getElementById("related-grid").innerHTML =
    D.getRelatedRecipes(recipe.slug, 3).map(GG.recipeCard).join("");
  if (window.GG_observeReveals) window.GG_observeReveals();

  /* ---- Initial paint ------------------------------------------------------------------------ */
  renderScaler();
  renderIngredients();
  renderTotals();
  renderSteps();
})();
