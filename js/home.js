/* THE GREEK GEEK — homepage rendering (latest recipes + recipe of the week) */
(function () {
  "use strict";
  const D = window.GrimoireData;
  const GG = window.GG;

  /* Latest three recipes */
  const latestGrid = document.getElementById("latest-grid");
  if (latestGrid) {
    latestGrid.innerHTML = D.getLatestRecipes(3).map(GG.recipeCard).join("");
  }

  /* Recipe of the Week */
  const rotw = document.getElementById("rotw-panel");
  if (rotw) {
    const r = D.getRecipeOfTheWeek();
    const cat = D.getCategory(r.category);
    rotw.insertAdjacentHTML(
      "beforeend",
      `
      <div class="feature-panel__media" style="background:${r.heroGradient}" aria-hidden="true">${r.heroEmoji}</div>
      <div>
        <span class="kicker"><img src="assets/mascot/miso-star.png" alt="" class="miso-float" width="677" height="369"> Recipe of the Week</span>
        <h3 class="flourish" style="font-size:clamp(1.5rem,3vw,2rem);">${GG.escapeHtml(r.title)}</h3>
        <div class="recipe-card__meta" style="margin-bottom:0.9rem;">
          ${GG.sparkleStars(r.difficulty)}
          <span>⏱ ${D.totalMinutes(r)} min</span>
          <span>${GG.escapeHtml(cat ? cat.label : "")}</span>
          <span>🔥 ${r.macros.calories} kcal</span>
          <span>💪 ${r.macros.protein}g protein</span>
        </div>
        <p style="color:var(--text-muted);">${GG.escapeHtml(r.excerpt)}</p>
        <a class="btn btn--ember" href="recipe.html?slug=${encodeURIComponent(r.slug)}">Start the Quest</a>
      </div>`
    );
  }

  /* Hand injected cards to the shared scroll-reveal observer */
  if (window.GG_observeReveals) window.GG_observeReveals();
})();
