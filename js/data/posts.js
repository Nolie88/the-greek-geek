/* ==========================================================================
   THE GREEK GEEK — diary (blog) data layer
   Same contract as recipes.js: pages only call the DiaryData API below,
   so a CMS/database can replace this file without touching page code.
   ========================================================================== */

(function () {
  "use strict";

  const POSTS = [
    {
      slug: "i-brined-everything-for-a-week",
      title: "I Brined Everything for a Week (For Science)",
      publishedAt: "2026-08-12",
      readMinutes: 6,
      excerpt:
        "Chicken, feta, even the tomatoes. A seven-day experiment in salt, osmosis, and knowing when to stop.",
      body: [
        "It started, as most kitchen disasters do, with a wiki dive. One article on osmosis at 1am and suddenly I had five containers of salt water in the fridge and a spreadsheet named brine_log_v2.",
        "The short version: a 6% brine for 45 minutes made the single juiciest chicken breast I have ever cooked, and it wasn't close. The moisture loss on the un-brined control was visible in the pan — a sad grey puddle of what could have been.",
        "The surprising winner was halloumi. Twenty minutes in a light herb brine before grilling and it seasoned itself all the way through. The loser: cherry tomatoes, which turned into sad little water balloons. Not every experiment drops loot.",
        "What I'm keeping in the rotation: quick-brining any lean protein destined for high heat, and salting tomatoes on the board, not in the bowl. What I'm abandoning: brined cucumber 'experiments' that were just bad pickles with extra steps.",
      ],
    },
    {
      slug: "my-kitchen-loadout-2026",
      title: "My Kitchen Loadout, 2026 Edition",
      publishedAt: "2026-07-30",
      readMinutes: 8,
      excerpt:
        "The gear I actually use every week — one good knife, a scale, and a wok — and the gadget drawer of shame.",
      body: [
        "Every RPG teaches the same lesson: gear score matters less than using what you have. My entire weekly rotation runs on maybe six items, and none of them are the air fryer I swore would change my life.",
        "The S-tier: a 20cm chef's knife I keep genuinely sharp (a sharp cheap knife beats a dull expensive one, every time), a digital scale because cups are a unit of chaos, and a carbon steel wok that went from intimidating to irreplaceable in about three uses.",
        "The A-tier: a cast iron pan for anything that needs a crust, an instant-read thermometer that ended a decade of anxiety-cutting into chicken, and a stick blender for soups and smoothie emergencies.",
        "The drawer of shame contains: an avocado slicer, a strawberry huller, and a 'garlic rocker'. Combined uses since purchase: four. Buy tools, not single-purpose trinkets — a lesson that cost me exactly one kitchen drawer.",
      ],
    },
    {
      slug: "what-greek-grandmothers-know-about-meal-prep",
      title: "What Greek Grandmothers Know About Meal Prep",
      publishedAt: "2026-07-08",
      readMinutes: 5,
      excerpt:
        "Yiayia never called it meal prep, but the Sunday pot of fasolada fed everyone for three days. Some lessons.",
      body: [
        "Meal prep influencers act like batch cooking was invented in 2019 alongside the bento box economy. My grandmother has been 'meal prepping' since before refrigeration was reliable, and her system needs no containers with compartments.",
        "Lesson one: cook things that improve overnight. Fasolada, gigantes, stews with tomato and olive oil — day two is genuinely better than day one, because the flavours keep developing. Prep food that peaks later, and leftovers become an upgrade, not a compromise.",
        "Lesson two: one pot, many meals. Sunday's braised chicken became Monday's shredded chicken over rice and Tuesday's soup. Nothing was ever 'a portion'; everything was an ingredient for the next thing.",
        "Lesson three, and the one I hold onto: she never once ate something joyless because it was 'healthy'. The food was healthy because it was mostly vegetables, beans, and olive oil — not because anyone suffered. That's the whole philosophy of this site, honestly. Yiayia was the original min-maxer.",
      ],
    },
  ];

  function getAllPosts() {
    return POSTS.slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  function getPostBySlug(slug) {
    return POSTS.find((p) => p.slug === slug) || null;
  }

  window.DiaryData = { getAllPosts, getPostBySlug };
})();
