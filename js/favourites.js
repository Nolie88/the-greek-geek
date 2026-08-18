/* ==========================================================================
   THE GREEK GEEK — favourites store
   Pages talk only to the FavouritesStore API. The storage backend is
   pluggable: SessionBackend keeps favourites for the browsing session.
   When real accounts arrive, implement the same {load, save} contract
   against the API and swap it in — nothing else changes.
   ========================================================================== */
(function () {
  "use strict";

  const SessionBackend = {
    load() {
      try { return JSON.parse(sessionStorage.getItem("gg-favourites")) || []; }
      catch (e) { return []; }
    },
    save(slugs) {
      try { sessionStorage.setItem("gg-favourites", JSON.stringify(slugs)); }
      catch (e) { /* private mode — favourites become tab-lifetime only */ }
    },
  };

  const backend = SessionBackend;
  const slugs = new Set(backend.load());
  const listeners = [];

  function list() { return Array.from(slugs); }
  function has(slug) { return slugs.has(slug); }
  function count() { return slugs.size; }
  function toggle(slug) {
    slugs.has(slug) ? slugs.delete(slug) : slugs.add(slug);
    backend.save(list());
    listeners.forEach((cb) => cb(list()));
    return slugs.has(slug);
  }
  function onChange(cb) { listeners.push(cb); }

  window.FavouritesStore = { list, has, count, toggle, onChange };
})();
