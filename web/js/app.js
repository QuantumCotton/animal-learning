/**
 * Liora Active Category View — skeuomorphic flip-book (7fr : 9fr)
 * Data keys match data/animal_schema.json
 */

const STORAGE_KEY = "liora-book-settings";

/** @type {import('../data/manifest').Manifest | null} */
let manifest = null;

const state = {
  categoryIndex: 0,
  pageIndex: 0,
  selectedIndex: 0,
  language: "en",
  factLevel: "basic",
};

let audio = null;
let isAnimating = false;

const FLIP_DURATION = { grid: 520, category: 680 };

/** Main turn keyframes only — ignore ::after shadow animationend events */
const FLIP_ANIMATION_NAMES = new Set([
  "book-page-turn-forward",
  "book-page-turn-back",
  "grid-page-turn-next",
  "grid-page-turn-prev",
]);

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

async function init() {
  try {
    const res = await fetch(`/web/data/manifest.json?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText);
    manifest = await res.json();
    loadSettings();
    bindControls();
    renderTabs();
    renderGrid();
    selectFirstAnimal();
    renderDetail();
  } catch (err) {
    console.error(err);
    document.body.innerHTML =
      '<p style="padding:2rem;font-family:sans-serif;text-align:center">Could not load Liora. Run <code>npm run dev</code> from the project folder.</p>';
  }
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (s.language) state.language = s.language;
    if (s.factLevel) state.factLevel = s.factLevel;
    if (typeof s.categoryIndex === "number") state.categoryIndex = s.categoryIndex;
    if (typeof s.pageIndex === "number") state.pageIndex = s.pageIndex;
  } catch {
    /* ignore */
  }
}

function saveSettings() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      language: state.language,
      factLevel: state.factLevel,
      categoryIndex: state.categoryIndex,
      pageIndex: state.pageIndex,
    })
  );
}

function getCategory() {
  return manifest?.categories[state.categoryIndex] ?? null;
}

function getPage() {
  const cat = getCategory();
  if (!cat) return null;
  return cat.pages[state.pageIndex] ?? cat.pages[0];
}

function getAnimalsOnPage() {
  return getPage()?.animals ?? [];
}

function getSelectedAnimal() {
  const animals = getAnimalsOnPage();
  return animals[state.selectedIndex] ?? null;
}

function pickLang(obj) {
  if (!obj) return "—";
  return obj[state.language] ?? obj.en ?? "—";
}

function getFactSound(animal) {
  const sounds =
    state.factLevel === "edu" ? animal?.factSoundsEdu : animal?.factSounds;
  if (!sounds) return null;
  return sounds[state.language] ?? sounds.en ?? null;
}

function audioUrl(src) {
  if (!src) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${Date.now()}`;
}

function bindControls() {
  $$(".toggle-btn[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === state.language);
    btn.addEventListener("click", () => {
      state.language = btn.dataset.lang;
      $$(".toggle-btn[data-lang]").forEach((b) =>
        b.classList.toggle("active", b.dataset.lang === state.language)
      );
      renderDetail();
      saveSettings();
    });
  });

  $$(".toggle-btn[data-fact]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.fact === state.factLevel);
    btn.addEventListener("click", () => {
      state.factLevel = btn.dataset.fact;
      $$(".toggle-btn[data-fact]").forEach((b) =>
        b.classList.toggle("active", b.dataset.fact === state.factLevel)
      );
      renderDetail();
      saveSettings();
    });
  });

  bindGridSwipe();

  $("#btn-animal-sound").addEventListener("click", () => {
    const a = getSelectedAnimal();
    if (a?.animalSound) playAudio(a.animalSound, $("#btn-animal-sound"));
  });
  $("#btn-name-sound").addEventListener("click", () => {
    const a = getSelectedAnimal();
    if (a?.nameSound) playAudio(a.nameSound, $("#btn-name-sound"));
  });

  const factBtn = $("#btn-read-fact");
  factBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const a = getSelectedAnimal();
    const src = getFactSound(a);
    if (src) playAudio(src, factBtn);
  });

  const imageFrame = $("#image-frame");
  if (imageFrame) {
    imageFrame.addEventListener("click", () => {
      const a = getSelectedAnimal();
      if (a?.animalSound) playAudio(a.animalSound, imageFrame);
    });
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearFlipClasses() {
  const stage = $("#grid-stage");
  const pages = $("#book-pages");
  stage?.classList.remove("grid-turn-next", "grid-turn-prev");
  pages?.classList.remove("is-turning-forward", "is-turning-back");
}

function runFlipAnimation(el, className, durationMs, applyChange) {
  if (!el || prefersReducedMotion()) {
    applyChange();
    return;
  }
  if (isAnimating) return;
  isAnimating = true;
  clearFlipClasses();
  el.classList.remove(
    "is-turning-forward",
    "is-turning-back",
    "grid-turn-next",
    "grid-turn-prev"
  );
  void el.offsetWidth;
  // Apply animation at keyframe 0% before swapping grid content (avoids one-frame flash)
  el.classList.add(className);
  void el.offsetWidth;
  applyChange();

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    el.removeEventListener("animationend", onAnimEnd);
    el.removeEventListener("animationcancel", onAnimCancel);
    clearTimeout(fallbackTimer);
    el.classList.remove(className);
    isAnimating = false;
  };

  const onAnimEnd = (e) => {
    if (e.target !== el) return;
    if (!FLIP_ANIMATION_NAMES.has(e.animationName)) return;
    finish();
  };

  const onAnimCancel = (e) => {
    if (e.target !== el) return;
    finish();
  };

  el.addEventListener("animationend", onAnimEnd);
  el.addEventListener("animationcancel", onAnimCancel);
  const fallbackTimer = setTimeout(finish, durationMs + 120);
}

function canGoNextPage() {
  const cat = getCategory();
  return Boolean(cat?.pages[state.pageIndex + 1]);
}

function canGoPrevPage() {
  return state.pageIndex > 0 && Boolean(getCategory()?.pages[state.pageIndex - 1]);
}

function goNextPage() {
  if (isAnimating || !canGoNextPage()) return;
  setPage(state.pageIndex + 1);
}

function goPrevPage() {
  if (isAnimating || !canGoPrevPage()) return;
  setPage(state.pageIndex - 1);
}

function setPage(index) {
  if (isAnimating) return;
  const cat = getCategory();
  if (!cat || !cat.pages[index] || index === state.pageIndex) return;
  const dir = index > state.pageIndex ? "grid-turn-next" : "grid-turn-prev";
  const stage = $("#grid-stage");
  runFlipAnimation(stage, dir, FLIP_DURATION.grid, () => {
    state.pageIndex = index;
    state.selectedIndex = 0;
    selectFirstAnimal();
    renderGrid();
    renderDetail();
    updatePageIndicators();
    saveSettings();
  });
}

function bindGridSwipe() {
  const stage = $("#grid-stage");
  if (!stage) return;

  const SWIPE_MIN = 48;
  const SWIPE_MAX_VERTICAL = 80;
  /** Movement below this is a tap — never steal the click from grid cells */
  const TAP_MOVE_MAX = 10;
  const TAP_DURATION_MAX = 350;
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let tracking = false;
  let activePointer = null;

  const isTap = (clientX, clientY) => {
    const dx = clientX - startX;
    const dy = clientY - startY;
    const dt = Date.now() - startTime;
    return (
      Math.abs(dx) < TAP_MOVE_MAX &&
      Math.abs(dy) < TAP_MOVE_MAX &&
      dt < TAP_DURATION_MAX
    );
  };

  const finishSwipe = (clientX, clientY) => {
    if (!tracking) return;
    tracking = false;
    activePointer = null;
    if (isAnimating) return;
    if (isTap(clientX, clientY)) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.abs(dx) < SWIPE_MIN) return;
    if (Math.abs(dy) > SWIPE_MAX_VERTICAL && Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) goNextPage();
    else goPrevPage();
  };

  stage.addEventListener(
    "pointerdown",
    (e) => {
      if (isAnimating) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      tracking = true;
      activePointer = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
    },
    { passive: true }
  );

  stage.addEventListener(
    "pointerup",
    (e) => {
      if (e.pointerId !== activePointer) return;
      finishSwipe(e.clientX, e.clientY);
    },
    { passive: true }
  );

  stage.addEventListener(
    "pointercancel",
    (e) => {
      if (e.pointerId === activePointer) {
        tracking = false;
        activePointer = null;
      }
    },
    { passive: true }
  );

  let wheelLocked = false;
  stage.addEventListener(
    "wheel",
    (e) => {
      if (isAnimating || wheelLocked) return;
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < 28) return;
      e.preventDefault();
      wheelLocked = true;
      if (e.deltaX > 0) goNextPage();
      else goPrevPage();
      setTimeout(() => {
        wheelLocked = false;
      }, FLIP_DURATION.grid + 100);
    },
    { passive: false }
  );
}

function setCategory(index) {
  if (isAnimating) return;
  if (!manifest || index < 0 || index >= manifest.categories.length) return;
  if (index === state.categoryIndex) return;
  const dir = index > state.categoryIndex ? "is-turning-forward" : "is-turning-back";
  const pages = $("#book-pages");
  runFlipAnimation(pages, dir, FLIP_DURATION.category, () => {
    state.categoryIndex = index;
    state.pageIndex = 0;
    state.selectedIndex = 0;
    renderTabs();
    renderGrid();
    selectFirstAnimal();
    renderDetail();
    updatePageIndicators();
    popActiveTab();
    saveSettings();
  });
}

function popActiveTab() {
  if (prefersReducedMotion()) return;
  const active = document.querySelector(".category-tab.active");
  if (!active) return;
  active.classList.remove("tab-pop");
  void active.offsetWidth;
  active.classList.add("tab-pop");
  active.addEventListener(
    "animationend",
    () => active.classList.remove("tab-pop"),
    { once: true }
  );
}

function selectFirstAnimal() {
  const animals = getAnimalsOnPage();
  const idx = animals.findIndex((a) => a !== null);
  state.selectedIndex = idx >= 0 ? idx : 0;
}

function renderTabs() {
  if (!manifest) return;
  const left = $("#tabs-left");
  const right = $("#tabs-right");
  left.innerHTML = "";
  right.innerHTML = "";

  const compact = window.matchMedia("(max-width: 700px)").matches;

  manifest.categories.forEach((cat, i) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "category-tab" + (i === state.categoryIndex ? " active" : "");
    tab.style.background = cat.tabColor || cat.color;
    tab.setAttribute("aria-label", cat.title);
    tab.title = cat.title;
    tab.innerHTML = `<span class="tab-icon" aria-hidden="true">${cat.emoji}</span>`;
    tab.addEventListener("click", () => setCategory(i));

    if (compact) {
      left.appendChild(tab);
    } else if (i < state.categoryIndex) {
      left.appendChild(tab);
    } else {
      right.appendChild(tab);
    }
  });
}

window.addEventListener("resize", () => {
  if (manifest) renderTabs();
});

function renderGrid() {
  const cat = getCategory();
  const grid = $("#animal-grid");
  grid.innerHTML = "";
  if (!cat) return;

  $("#active-category-label").textContent = `Category: ${cat.title}`;

  const animals = getAnimalsOnPage();

  for (let i = 0; i < 16; i++) {
    const animal = animals[i];
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "grid-cell" + (animal ? "" : " empty");
    if (i === state.selectedIndex && animal) cell.classList.add("selected");

    if (animal) {
      const img = document.createElement("img");
      img.src = animal.image;
      img.alt = pickLang(animal.name);
      img.loading = "lazy";
      cell.appendChild(img);
      cell.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        state.selectedIndex = i;
        renderGrid();
        renderDetail();
        if (animal.animalSound) playAudio(animal.animalSound, cell);
      });
    }

    grid.appendChild(cell);
  }

  updatePageIndicators();
}

function updatePageIndicators() {
  const dots = $("#page-dots");
  if (!dots) return;
  const cat = getCategory();
  const hasP2 = cat?.pages[1] != null;
  dots.hidden = !hasP2;
  dots.querySelectorAll(".page-dot").forEach((dot) => {
    const i = Number(dot.dataset.page);
    dot.classList.toggle("active", state.pageIndex === i);
    dot.hidden = i === 1 && !hasP2;
  });
}

function renderDetail() {
  const animal = getSelectedAnimal();
  const frame = $("#image-frame");
  const img = $("#detail-image");
  const placeholder = $("#image-placeholder");

  if (!animal) {
    frame.classList.remove("has-image");
    img.removeAttribute("src");
    img.alt = "";
    placeholder.hidden = false;
    $("#detail-name").textContent = "—";
    $("#detail-height").textContent = "—";
    $("#detail-weight").textContent = "—";
    $("#detail-fact").textContent = "Choose an animal from the grid.";
    $("#detail-habitat").textContent = "—";
    $("#detail-region").textContent = "—";
    $("#detail-diet").textContent = "—";
    $("#fact-label").textContent =
      state.factLevel === "edu" ? "EDU Fact" : "Basic / Fun Fact";
    $("#btn-animal-sound").disabled = true;
    $("#btn-name-sound").disabled = true;
    $("#btn-read-fact").disabled = true;
    return;
  }

  placeholder.hidden = true;
  frame.classList.add("has-image");
  img.src = animal.image;
  img.alt = pickLang(animal.name);

  $("#detail-name").textContent = pickLang(animal.name);
  $("#detail-height").textContent = pickLang(animal.heightLength);
  $("#detail-weight").textContent = pickLang(animal.weight);
  $("#detail-fact").textContent = pickLang(
    state.factLevel === "edu" ? animal.facts.edu : animal.facts.basic
  );
  $("#fact-label").textContent =
    state.factLevel === "edu" ? "EDU Fact" : "Basic / Fun Fact";
  $("#detail-habitat").textContent = pickLang(animal.habitat);
  $("#detail-region").textContent = pickLang(animal.region);
  $("#detail-diet").textContent = pickLang(animal.diet);

  $("#btn-animal-sound").disabled = !animal.animalSound;
  $("#btn-name-sound").disabled = !animal.nameSound;

  const factBtn = $("#btn-read-fact");
  const factSrc = getFactSound(animal);
  const factHint = factBtn.querySelector(".fact-btn-hint");
  factBtn.disabled = !factSrc;
  if (factHint) {
    factHint.textContent = factSrc
      ? "Tap to hear this fact read aloud"
      : state.factLevel === "edu"
        ? "EDU voice not recorded yet for this animal"
        : "Voice not recorded yet for this animal";
  }
  factBtn.classList.toggle("has-audio", Boolean(factSrc));
}

let playingEl = null;

function playAudio(src, highlightEl = null) {
  stopAudio();
  if (highlightEl) {
    playingEl = highlightEl;
    playingEl.classList.add("is-playing");
  }
  const url = audioUrl(src);
  audio = new Audio(url);
  audio.addEventListener("ended", () => clearPlayingHighlight());
  audio.addEventListener("error", () => {
    console.warn("Could not play audio:", url);
    clearPlayingHighlight();
  });
  audio.play().catch((err) => {
    console.warn("Audio play blocked or failed:", url, err?.message || err);
    clearPlayingHighlight();
  });
}

function clearPlayingHighlight() {
  if (playingEl) {
    playingEl.classList.remove("is-playing");
    playingEl = null;
  }
}

function stopAudio() {
  clearPlayingHighlight();
  if (audio) {
    audio.pause();
    audio.onended = null;
    audio.onerror = null;
    audio = null;
  }
}

init();
