/* ==========================================================================
   THE GREEK GEEK — recipe data layer
   All recipe access goes through the GrimoireData API at the bottom.
   To swap in a real database/API later, reimplement those functions
   (they can become async fetch calls) — no page code needs to change shape.
   ========================================================================== */

(function () {
  "use strict";

  // Category registry — "speedruns" is a virtual category: any recipe whose
  // total time is under 30 minutes qualifies, whatever its home category.
  const CATEGORIES = [
    { id: "main-quests", label: "Main Quests", hint: "dinners" },
    { id: "side-quests", label: "Side Quests", hint: "sides & snacks" },
    { id: "potions", label: "Potions", hint: "drinks & smoothies" },
    { id: "sweet-loot", label: "Sweet Loot", hint: "desserts" },
    { id: "speedruns", label: "Speedruns", hint: "under 30 min", virtual: true },
  ];

  const DIET_TAGS = ["high-protein", "vegetarian", "gluten-free", "low-carb"];

  const RECIPES = [
    {
      slug: "critical-hit-protein-ramen",
      title: "Critical Hit Protein Ramen",
      heroImage: null, // placeholder gradient until photos exist
      heroGradient: "linear-gradient(135deg, #3d2f4f, #7a4a3a)",
      heroEmoji: "🍜",
      category: "main-quests",
      tags: ["high-protein"],
      difficulty: 2,
      prepMinutes: 15,
      cookMinutes: 20,
      servings: 2,
      publishedAt: "2026-08-10",
      popularity: 96,
      excerpt:
        "A weeknight ramen that rolls max damage: real chicken broth shortcut, soft egg, and 42g of protein per bowl.",
      // qty: number|null (null = "to taste"), unit: singular (pluralised in UI),
      // item/itemPlural: used when there is no unit and qty ≠ 1
      ingredients: [
        { qty: 2, unit: null, item: "chicken breast (about 200g), sliced thin", itemPlural: "chicken breasts (about 200g each), sliced thin" },
        { qty: 2, unit: "nest", item: "wholewheat ramen noodles" },
        { qty: 1, unit: "litre", item: "low-sodium chicken stock" },
        { qty: 2, unit: "tbsp", item: "white miso paste" },
        { qty: 1, unit: "tbsp", item: "soy sauce (or tamari)" },
        { qty: 1, unit: "thumb", item: "ginger, grated" },
        { qty: 2, unit: "clove", item: "garlic, minced" },
        { qty: 2, unit: null, item: "egg", itemPlural: "eggs" },
        { qty: 2, unit: "head", item: "pak choi, halved" },
        { qty: 100, unit: "g", item: "shiitake mushrooms, sliced" },
        { qty: 2, unit: null, item: "spring onion, sliced", itemPlural: "spring onions, sliced" },
        { qty: 1, unit: "tsp", item: "sesame oil, plus chilli oil to taste" },
      ],
      steps: [
        "Soft-boil the eggs: 6 minutes 30 seconds in simmering water, then straight into iced water. Peel when cool.",
        "Warm the stock with the miso, soy, ginger, and garlic. Keep it at a gentle simmer — never a hard boil, or the miso turns bitter.",
        "Sear the sliced chicken in a hot pan with a little sesame oil until golden and cooked through, about 4–5 minutes.",
        "Drop the shiitake and pak choi into the broth for the final 3 minutes.",
        "Cook the noodles separately per the packet, then drain. (Separate pot = clear broth. Trust the process.)",
        "Build the bowls: noodles, broth and greens, chicken, halved egg, spring onions, and a ritual drizzle of chilli oil.",
      ],
      macros: { calories: 545, protein: 42, carbs: 52, fat: 16 },
      nerdNote:
        "In most RPGs a critical hit lands at a 5% base rate. This ramen crits every time — miso paste is loaded with glutamates, the same umami compounds your brain is literally wired to reward.",
    },
    {
      slug: "speedrun-chicken-stir-fry",
      title: "Speedrun Chicken Stir-Fry",
      heroImage: null,
      heroGradient: "linear-gradient(135deg, #2f4f3d, #b3703f)",
      heroEmoji: "🥡",
      category: "main-quests",
      tags: ["high-protein", "gluten-free", "low-carb"],
      difficulty: 1,
      prepMinutes: 10,
      cookMinutes: 10,
      servings: 2,
      publishedAt: "2026-08-14",
      popularity: 88,
      excerpt:
        "Any% world record dinner: one wok, ten minutes of heat, and a glossy ginger-garlic sauce with no added sugar.",
      ingredients: [
        { qty: 2, unit: null, item: "chicken breast, cut into even 2cm pieces", itemPlural: "chicken breasts, cut into even 2cm pieces" },
        { qty: 1, unit: null, item: "red pepper, sliced", itemPlural: "red peppers, sliced" },
        { qty: 1, unit: "head", item: "broccoli, cut into small florets" },
        { qty: 1, unit: null, item: "carrot, ribboned with a peeler", itemPlural: "carrots, ribboned with a peeler" },
        { qty: 3, unit: "clove", item: "garlic, minced" },
        { qty: 1, unit: "thumb", item: "ginger, grated" },
        { qty: 3, unit: "tbsp", item: "tamari (gluten-free soy sauce)" },
        { qty: 1, unit: "tbsp", item: "rice vinegar" },
        { qty: 1, unit: "tsp", item: "cornflour, mixed with 3 tbsp cold water" },
        { qty: 1, unit: "tbsp", item: "olive oil" },
        { qty: 1, unit: "tsp", item: "sesame seeds" },
      ],
      steps: [
        "Mise en place is your route plan — chop everything before the pan gets hot. Once you start, there are no pauses.",
        "Get the wok screaming hot with the oil. Sear the chicken in a single layer, undisturbed, for 2 minutes, then toss for 2 more until golden.",
        "Add broccoli, pepper, and carrot. Stir-fry 3 minutes — vegetables should stay bright and snappy.",
        "Add garlic and ginger for 30 seconds, just until fragrant.",
        "Pour in tamari, vinegar, and the cornflour slurry. Toss 60 seconds until the sauce turns glossy and clings.",
        "Plate, scatter sesame seeds, stop the timer. GG.",
      ],
      macros: { calories: 385, protein: 44, carbs: 18, fat: 14 },
      nerdNote:
        "Speedrunners save frames; stir-fry saves nutrients. Quick high-heat cooking preserves more vitamin C in broccoli than long boiling — most of the loss in boiled veg literally leaches into the water you pour away.",
    },
    {
      slug: "mana-potion-berry-smoothie",
      title: "Mana Potion Berry Smoothie",
      heroImage: null,
      heroGradient: "linear-gradient(135deg, #2c3e6b, #6b3a7a)",
      heroEmoji: "🫐",
      category: "potions",
      tags: ["vegetarian", "gluten-free"],
      difficulty: 1,
      prepMinutes: 5,
      cookMinutes: 0,
      servings: 1,
      publishedAt: "2026-08-16",
      popularity: 91,
      excerpt:
        "Restores 250 MP. Blueberries, Greek yoghurt, and oats blended into a violet elixir that actually keeps you full.",
      ingredients: [
        { qty: 150, unit: "g", item: "frozen blueberries" },
        { qty: 100, unit: "g", item: "frozen strawberries" },
        { qty: 150, unit: "g", item: "Greek yoghurt (full fat or 2%)" },
        { qty: 30, unit: "g", item: "rolled oats" },
        { qty: 1, unit: "tbsp", item: "honey" },
        { qty: 1, unit: "tbsp", item: "chia seeds" },
        { qty: 150, unit: "ml", item: "milk (dairy or oat)" },
        { qty: null, unit: null, item: "Squeeze of lemon" },
      ],
      steps: [
        "Load the blender in this order: liquid first, then yoghurt, then frozen fruit, oats, chia, honey, lemon. Blades need liquid at the bottom to build a vortex.",
        "Blend on low for 20 seconds, then high for 40–60 seconds until completely smooth and the colour of a proper mana flask.",
        "Too thick? Add milk a splash at a time. Too thin? A few more frozen berries.",
        "Pour into your favourite glass — presentation is 10% of the stat bonus — and drink while the chill lasts.",
      ],
      macros: { calories: 420, protein: 21, carbs: 62, fat: 11 },
      nerdNote:
        "Classic mana potions are blue because of copper sulphate — please don't drink that. This one is violet from anthocyanins, the antioxidant pigments in blueberries, which shift colour with pH just like a real alchemy experiment.",
    },
    {
      slug: "buff-stat-greek-village-salad",
      title: "Buff Stat Greek Village Salad",
      heroImage: null,
      heroGradient: "linear-gradient(135deg, #2f5a4f, #a33f3f)",
      heroEmoji: "🫒",
      category: "side-quests",
      tags: ["vegetarian", "gluten-free", "low-carb"],
      difficulty: 1,
      prepMinutes: 15,
      cookMinutes: 0,
      servings: 4,
      publishedAt: "2026-07-28",
      popularity: 74,
      excerpt:
        "The horiatiki my grandmother made, stats included. No lettuce, no shortcuts — just ripe tomatoes, feta, and good oil.",
      ingredients: [
        { qty: 4, unit: null, item: "ripe tomato, cut into chunky wedges", itemPlural: "ripe tomatoes, cut into chunky wedges" },
        { qty: 1, unit: null, item: "cucumber, cut into thick half-moons", itemPlural: "cucumbers, cut into thick half-moons" },
        { qty: 1, unit: null, item: "green pepper, cut into rings", itemPlural: "green peppers, cut into rings" },
        { qty: 1, unit: null, item: "small red onion, thinly sliced", itemPlural: "small red onions, thinly sliced" },
        { qty: 200, unit: "g", item: "block of feta (never pre-crumbled)" },
        { qty: 16, unit: null, item: "Kalamata olive", itemPlural: "Kalamata olives" },
        { qty: 4, unit: "tbsp", item: "extra virgin olive oil" },
        { qty: 1, unit: "tbsp", item: "red wine vinegar" },
        { qty: 1, unit: "tsp", item: "dried oregano (rigani if you can find it)" },
        { qty: null, unit: null, item: "Sea salt" },
      ],
      steps: [
        "Cut the vegetables chunky and rustic — a village salad is not diced. Season the tomatoes with salt first and let them sit 5 minutes to draw out their juices.",
        "Toss tomatoes, cucumber, pepper, onion, and olives in a wide shallow bowl with the vinegar.",
        "Lay the feta on top in one glorious slab. Breaking it up early is a war crime in at least three Greek villages.",
        "Pour the olive oil generously over everything, especially the feta, and shower with oregano.",
        "Serve with bread for the pan juices — the tomato-oil puddle at the bottom is the true endgame loot.",
      ],
      macros: { calories: 285, protein: 9, carbs: 12, fat: 23 },
      nerdNote:
        "A tomato at room temperature has measurably more aroma compounds than a fridge-cold one — chilling below 12°C switches off the genes that produce them. Store your tomatoes on the counter; it's a permanent flavour buff.",
    },
    {
      slug: "loot-drop-chocolate-protein-brownies",
      title: "Loot Drop Chocolate Protein Brownies",
      heroImage: null,
      heroGradient: "linear-gradient(135deg, #3a2b28, #8a5a2b)",
      heroEmoji: "🍫",
      category: "sweet-loot",
      tags: ["high-protein", "vegetarian"],
      difficulty: 2,
      prepMinutes: 15,
      cookMinutes: 22,
      servings: 9,
      publishedAt: "2026-08-02",
      popularity: 82,
      excerpt:
        "Epic-rarity dessert: fudgy dark chocolate brownies with 11g protein a square and no sad protein-bar aftertaste.",
      ingredients: [
        { qty: 150, unit: "g", item: "dark chocolate (70%), roughly chopped" },
        { qty: 80, unit: "g", item: "butter" },
        { qty: 2, unit: null, item: "egg", itemPlural: "eggs" },
        { qty: 1, unit: null, item: "egg white", itemPlural: "egg whites" },
        { qty: 80, unit: "g", item: "Greek yoghurt" },
        { qty: 70, unit: "g", item: "coconut sugar (or light brown sugar)" },
        { qty: 60, unit: "g", item: "chocolate whey or casein protein powder" },
        { qty: 40, unit: "g", item: "plain wholemeal flour" },
        { qty: 20, unit: "g", item: "cocoa powder" },
        { qty: 1, unit: "tsp", item: "vanilla, plus a pinch of sea salt" },
      ],
      steps: [
        "Heat the oven to 170°C fan and line a 20cm square tin. Melt 100g of the chocolate with the butter over low heat; cool slightly.",
        "Whisk eggs, egg white, and sugar for 2 full minutes until pale and slightly foamy — this builds the shiny crackle top.",
        "Whisk in the yoghurt, vanilla, and the cooled chocolate-butter mix.",
        "Fold in protein powder, flour, cocoa, and salt until just combined. Overmixing is how brownies become cake, and cake here is a loss condition.",
        "Fold through the remaining chopped chocolate, scrape into the tin, and bake 20–24 minutes — the centre should still wobble slightly.",
        "Cool completely in the tin before cutting into 9 squares. The wait is the hardest boss in this recipe.",
      ],
      macros: { calories: 235, protein: 11, carbs: 19, fat: 13 },
      nerdNote:
        "Protein powder steals moisture from bakes — that's why most protein brownies taste like drywall. The Greek yoghurt here is the counter-spell: its water and fat rebind the crumb, and casein handles heat better than whey if you have it.",
    },
    {
      slug: "boss-fight-lemon-chicken",
      title: "Boss Fight Slow-Braised Lemon Chicken",
      heroImage: null,
      heroGradient: "linear-gradient(135deg, #4f4a2f, #b38f3f)",
      heroEmoji: "🍋",
      category: "main-quests",
      tags: ["high-protein", "gluten-free"],
      difficulty: 3,
      prepMinutes: 20,
      cookMinutes: 70,
      servings: 4,
      publishedAt: "2026-07-15",
      popularity: 79,
      excerpt:
        "A Sunday raid: chicken thighs braised with lemon, oregano, and baby potatoes until everything surrenders.",
      ingredients: [
        { qty: 8, unit: null, item: "bone-in, skin-on chicken thigh", itemPlural: "bone-in, skin-on chicken thighs" },
        { qty: 600, unit: "g", item: "baby potatoes, halved" },
        { qty: 1, unit: null, item: "whole garlic bulb, cloves separated and peeled", itemPlural: "whole garlic bulbs, cloves separated and peeled" },
        { qty: 2, unit: null, item: "lemon (half juiced and zested, half sliced)", itemPlural: "lemons (half juiced and zested, half sliced)" },
        { qty: 300, unit: "ml", item: "chicken stock" },
        { qty: 3, unit: "tbsp", item: "extra virgin olive oil" },
        { qty: 1, unit: "tbsp", item: "dried oregano" },
        { qty: 1, unit: "tsp", item: "Dijon mustard" },
        { qty: null, unit: null, item: "Handful of fresh parsley" },
        { qty: null, unit: null, item: "Sea salt and black pepper" },
      ],
      steps: [
        "Phase one: pat the chicken dry, season hard, and sear skin-side down in a cold oven-safe pan brought up to medium-high. Leave it 8 minutes until deep gold. Do not poke it.",
        "Remove the chicken. Toss potatoes and garlic cloves in the rendered fat until they pick up colour, about 5 minutes.",
        "Whisk the stock with lemon juice, zest, mustard, and oregano; pour it around the potatoes.",
        "Phase two: nestle the thighs back in skin-side up, keeping the skin above the liquid line — crispy skin is the victory condition. Tuck lemon slices between them.",
        "Into a 180°C fan oven, uncovered, for 55–65 minutes until the potatoes are fondant-soft and the sauce has reduced.",
        "Rest 10 minutes, scatter with parsley, and serve from the pan. Roll credits.",
      ],
      macros: { calories: 520, protein: 38, carbs: 28, fat: 28 },
      nerdNote:
        "The 'boss mechanic' here is a Maillard-then-braise combo: searing creates hundreds of new flavour compounds, and the acidic lemon braise then dissolves them off the pan into the sauce. Deglazing is just loot collection.",
    },
  ];

  // ---- Accessor API ------------------------------------------------------
  // Keep pages talking to these functions only. When a real backend arrives,
  // make them async and fetch — the shapes stay the same.

  function totalMinutes(recipe) {
    return recipe.prepMinutes + recipe.cookMinutes;
  }

  function isSpeedrun(recipe) {
    return totalMinutes(recipe) < 30;
  }

  function getAllRecipes() {
    return RECIPES.slice();
  }

  function getRecipeBySlug(slug) {
    return RECIPES.find((r) => r.slug === slug) || null;
  }

  function getLatestRecipes(count) {
    return RECIPES.slice()
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, count || 3);
  }

  function getRecipeOfTheWeek() {
    return RECIPES.slice().sort((a, b) => b.popularity - a.popularity)[0];
  }

  function getCategories() {
    return CATEGORIES.slice();
  }

  function getCategory(id) {
    return CATEGORIES.find((c) => c.id === id) || null;
  }

  function getDietTags() {
    return DIET_TAGS.slice();
  }

  // filters: { category, tags: [], difficulty, query }, sort: newest|quickest|popular
  function queryRecipes(filters, sort) {
    filters = filters || {};
    let out = RECIPES.slice();

    if (filters.category) {
      out = filters.category === "speedruns"
        ? out.filter(isSpeedrun)
        : out.filter((r) => r.category === filters.category);
    }
    if (filters.tags && filters.tags.length) {
      out = out.filter((r) => filters.tags.every((t) => r.tags.includes(t)));
    }
    if (filters.difficulty) {
      out = out.filter((r) => r.difficulty === filters.difficulty);
    }
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      out = out.filter((r) =>
        [r.title, r.excerpt, r.nerdNote, r.tags.join(" "), (getCategory(r.category) || {}).label]
          .join(" ").toLowerCase().includes(q)
      );
    }

    if (sort === "quickest") out.sort((a, b) => totalMinutes(a) - totalMinutes(b));
    else if (sort === "popular") out.sort((a, b) => b.popularity - a.popularity);
    else out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return out;
  }

  // Neighbours in newest-first order: prev = newer, next = older (wraps around).
  function getAdjacentRecipes(slug) {
    const sorted = RECIPES.slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const i = sorted.findIndex((r) => r.slug === slug);
    if (i === -1) return { prev: null, next: null };
    return {
      prev: sorted[(i - 1 + sorted.length) % sorted.length],
      next: sorted[(i + 1) % sorted.length],
    };
  }

  // Related = same category scores highest, then shared dietary tags.
  function getRelatedRecipes(slug, count) {
    const base = getRecipeBySlug(slug);
    if (!base) return [];
    return RECIPES.filter((r) => r.slug !== slug)
      .map((r) => ({
        r,
        score:
          (r.category === base.category ? 2 : 0) +
          r.tags.filter((t) => base.tags.includes(t)).length +
          r.popularity / 1000,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count || 3)
      .map((x) => x.r);
  }

  window.GrimoireData = {
    getAllRecipes,
    getRecipeBySlug,
    getAdjacentRecipes,
    getRelatedRecipes,
    getLatestRecipes,
    getRecipeOfTheWeek,
    getCategories,
    getCategory,
    getDietTags,
    queryRecipes,
    totalMinutes,
    isSpeedrun,
  };
})();
