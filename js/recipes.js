/* ==========================================================================
   THE GREEK GEEK — Grimoire page: filters, live search, sort
   ========================================================================== */
(function () {
  "use strict";
  const D = window.GrimoireData;
  const GG = window.GG;

  const state = {
    category: null,   // single-select
    tags: [],         // multi-select (AND)
    difficulty: null, // single-select 1–3
    query: "",
    sort: "newest",
  };

  const grid = document.getElementById("recipe-grid");
  const emptyState = document.getElementById("empty-state");
  const resultsCount = document.getElementById("results-count");
  const clearBtn = document.getElementById("clear-filters");
  const searchInput = document.getElementById("recipe-search");
  const sortSelect = document.getElementById("recipe-sort");

  /* ---- Build filter chips ------------------------------------------------- */
  const catRow = document.getElementById("category-chips");
  D.getCategories().forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "chip" + (cat.id === "speedruns" ? " chip--ember" : "");
    btn.dataset.category = cat.id;
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `${GG.escapeHtml(cat.label)} <span style="opacity:0.65;font-size:0.72em;">(${GG.escapeHtml(cat.hint)})</span>`;
    btn.addEventListener("click", () => {
      state.category = state.category === cat.id ? null : cat.id;
      render();
    });
    catRow.appendChild(btn);
  });

  const tagRow = document.getElementById("tag-chips");
  D.getDietTags().forEach((tag) => {
    const btn = document.createElement("button");
    btn.className = "chip chip--teal";
    btn.dataset.tag = tag;
    btn.setAttribute("aria-pressed", "false");
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      const i = state.tags.indexOf(tag);
      i === -1 ? state.tags.push(tag) : state.tags.splice(i, 1);
      render();
    });
    tagRow.appendChild(btn);
  });

  const diffRow = document.getElementById("difficulty-chips");
  [1, 2, 3].forEach((level) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.dataset.difficulty = String(level);
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = GG.sparkleStars(level);
    btn.setAttribute("aria-label", `Difficulty ${level} of 3`);
    btn.addEventListener("click", () => {
      state.difficulty = state.difficulty === level ? null : level;
      render();
    });
    diffRow.appendChild(btn);
  });

  /* ---- Search + sort ------------------------------------------------------- */
  let debounce = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      state.query = searchInput.value;
      render();
    }, 120);
  });

  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    render();
  });

  function clearAll() {
    state.category = null;
    state.tags = [];
    state.difficulty = null;
    state.query = "";
    searchInput.value = "";
    render();
  }
  clearBtn.addEventListener("click", clearAll);
  document.getElementById("empty-clear").addEventListener("click", clearAll);

  /* ---- Render --------------------------------------------------------------- */
  function syncChips() {
    catRow.querySelectorAll(".chip").forEach((c) =>
      c.setAttribute("aria-pressed", String(c.dataset.category === state.category)));
    tagRow.querySelectorAll(".chip").forEach((c) =>
      c.setAttribute("aria-pressed", String(state.tags.includes(c.dataset.tag))));
    diffRow.querySelectorAll(".chip").forEach((c) =>
      c.setAttribute("aria-pressed", String(Number(c.dataset.difficulty) === state.difficulty)));
  }

  function render() {
    syncChips();
    const results = D.queryRecipes(
      { category: state.category, tags: state.tags, difficulty: state.difficulty, query: state.query },
      state.sort
    );

    const filtering = state.category || state.tags.length || state.difficulty || state.query.trim();
    clearBtn.hidden = !filtering;
    resultsCount.textContent = `${results.length} ${results.length === 1 ? "scroll" : "scrolls"} found`;

    grid.innerHTML = results.map(GG.recipeCard).join("");
    emptyState.hidden = results.length !== 0;
    grid.hidden = results.length === 0;

    if (window.GG_observeReveals) window.GG_observeReveals();
  }

  render();

  /* Header search icon lands here with ?focus=search */
  if (new URLSearchParams(location.search).get("focus") === "search") {
    searchInput.focus();
  }
})();
