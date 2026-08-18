# The Greek Geek

A recipe grimoire from a fantasy anime game — healthy, geek-flavoured recipes with real macros.

## Run locally

```
node tools/dev-server.js
```

Then open http://localhost:4173. The server has no dependencies and routes unknown URLs to `404.html`.

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Home — hero, latest recipes, Recipe of the Week, about teaser, newsletter |
| `recipes.html` + `js/recipes.js` | The Grimoire — filterable/searchable/sortable recipe grid |
| `recipe.html` + `js/recipe.js` | Recipe detail (`?slug=…`) — stats panel, servings scaler, ingredient checklist, quest steps, cook mode, print stylesheet |
| `about.html` | The cook's story + Miso's lore |
| `diary.html` / `article.html` | Blog index and article template (`?slug=…`) |
| `404.html` | Sleeping-Miso not-found page |
| `css/style.css` | The entire design system (tokens at the top) |
| `js/data/recipes.js` | Recipe data + `GrimoireData` accessor API |
| `js/data/posts.js` | Diary posts + `DiaryData` accessor API |
| `js/favourites.js` | `FavouritesStore` — session-backed favourites with a pluggable backend for future accounts |
| `js/main.js` | Shared behaviour: nav, scroll reveal, hero particles, render helpers, search overlay, favourites overlay, "Roll for a recipe" button |
| `assets/mascot/` | Miso PNGs (never stretch or recolour) |

## Swapping in a database later

Pages never touch the raw arrays — they only call `GrimoireData.*` / `DiaryData.*`
(`queryRecipes`, `getRecipeBySlug`, `getAllPosts`, …). To move to a real backend,
reimplement those functions as `fetch` calls returning the same shapes; no page
or template code changes.

Note: **Speedruns** is a virtual category — any recipe whose prep + cook time is
under 30 minutes qualifies automatically, regardless of its home category.
