(() => {
  "use strict";
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const supportsViewTimeline = CSS.supports("animation-timeline: view()");
  const supportsScrollTimeline = CSS.supports("animation-timeline: scroll()");
  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (_) {}
    },
  };
  function transition(update) {
    if (
      !reduceMotion.matches &&
      typeof document.startViewTransition === "function"
    ) {
      try {
        document.startViewTransition(update);
        return;
      } catch (_) {}
    }
    update();
  }

  const themeButton = document.querySelector(".theme-toggle");
  const systemTheme = matchMedia("(prefers-color-scheme: light)");
  const savedTheme = storage.get("forme-theme");
  root.dataset.theme = ["light", "dark"].includes(savedTheme)
    ? savedTheme
    : systemTheme.matches
      ? "light"
      : "dark";
  function updateThemeLabel() {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    themeButton.setAttribute("aria-label", `Switch to ${next} appearance`);
    themeButton.setAttribute("title", `Switch to ${next} appearance`);
  }
  updateThemeLabel();
  themeButton.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    transition(() => {
      root.dataset.theme = next;
      storage.set("forme-theme", next);
      updateThemeLabel();
    });
  });
  systemTheme.addEventListener?.("change", (e) => {
    if (!storage.get("forme-theme"))
      transition(() => {
        root.dataset.theme = e.matches ? "light" : "dark";
        updateThemeLabel();
      });
  });

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = [...siteNav.querySelectorAll("a")];
  function setNav(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    siteNav.classList.toggle("is-open", open);
    if (open && innerWidth <= 760) navLinks[0]?.focus({ preventScroll: true });
  }
  navToggle.addEventListener("click", () =>
    setNav(navToggle.getAttribute("aria-expanded") !== "true"),
  );
  navLinks.forEach((link) =>
    link.addEventListener("click", () => setNav(false)),
  );
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      navToggle.getAttribute("aria-expanded") === "true"
    ) {
      setNav(false);
      navToggle.focus();
    }
  });

  // Scroll-driven CSS handles supported browsers; this rAF fallback supplies progress and parallax elsewhere.
  const progressBar = document.querySelector(".scroll-progress__bar");
  let scrollFrame = 0;
  function onScroll() {
    scrollFrame = 0;
    const max = Math.max(
      1,
      document.documentElement.scrollHeight - innerHeight,
    );
    const progress = Math.min(100, Math.max(0, (scrollY / max) * 100));
    if (!supportsScrollTimeline) progressBar.style.width = `${progress}%`;
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = Number(el.dataset.parallax) || 0;
      const offset = reduceMotion.matches
        ? 0
        : -(rect.top + rect.height / 2 - innerHeight / 2) * speed * 0.16;
      el.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
    });
  }
  function scheduleScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll);
  }
  addEventListener("scroll", scheduleScroll, { passive: true });
  addEventListener("resize", scheduleScroll, { passive: true });
  onScroll();

  if (!supportsViewTimeline || reduceMotion.matches) {
    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion.matches) {
      const observer = new IntersectionObserver(
        (entries, obs) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      reveals.forEach((el) => observer.observe(el));
    } else reveals.forEach((el) => el.classList.add("is-visible"));
  }

  const products = {
    orbit: {
      name: "Orbit One",
      price: "$389",
      image: "assets/visuals/product-orbit.svg",
      description:
        "A quieter kind of immersion. Sculpted for long listening, soft contact and the small rituals in between.",
    },
    mono: {
      name: "Mono Field",
      price: "$249",
      image: "assets/visuals/product-mono.svg",
      description:
        "A compact sound field with a generous point of view. Designed to move from room to open air.",
    },
    arc: {
      name: "Arc Studio",
      price: "$529",
      image: "assets/visuals/product-arc.svg",
      description:
        "A considered desktop companion. Warm acoustics, architectural form and detail you can feel.",
    },
  };
  const detailDialog = document.getElementById("detail-dialog");
  const detailImage = document.getElementById("detail-image");
  const detailTitle = document.getElementById("detail-title");
  const detailDescription = document.getElementById("detail-description");
  const detailPrice = document.getElementById("detail-price");
  const bagFeedback = document.getElementById("bag-feedback");
  const addButton = document.getElementById("add-to-bag");
  let selectedProduct = null;
  function openProduct(id) {
    const product = products[id];
    if (!product) return;
    selectedProduct = product;
    detailImage.src = product.image;
    detailImage.alt = `${product.name} product view`;
    detailTitle.textContent = product.name;
    detailDescription.textContent = product.description;
    detailPrice.textContent = product.price;
    bagFeedback.textContent = "";
    addButton.innerHTML = 'Add to bag <span aria-hidden="true">↗</span>';
    detailDialog.showModal();
  }
  document
    .querySelectorAll("[data-open-product]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        openProduct(button.dataset.openProduct),
      ),
    );
  document.querySelectorAll(".product-card").forEach((card) => {
    const visual = card.querySelector(".product-card__visual");
    visual.addEventListener("pointermove", (e) => {
      if (reduceMotion.matches || e.pointerType === "touch") return;
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      visual.style.setProperty("--px", `${x * 100}%`);
      visual.style.setProperty("--py", `${y * 100}%`);
      visual.style.transform = `rotateX(${((0.5 - y) * 8).toFixed(2)}deg) rotateY(${((x - 0.5) * 11).toFixed(2)}deg)`;
    });
    visual.addEventListener("pointerleave", () => {
      visual.style.transform = "";
      visual.style.setProperty("--px", "50%");
      visual.style.setProperty("--py", "45%");
    });
    card.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target === card) {
        e.preventDefault();
        openProduct(card.dataset.product);
      }
    });
  });
  addButton.addEventListener("click", () => {
    if (!selectedProduct) return;
    bagFeedback.textContent = `${selectedProduct.name} added to your studio bag.`;
    addButton.textContent = "Added ✓";
    document.getElementById("interaction-status").textContent =
      bagFeedback.textContent;
  });

  const lightbox = document.getElementById("lightbox-dialog");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const projects = {
    kinetic: [
      "project-kinetic.svg",
      "Kinetic Systems — Digital / Product experience",
    ],
    forme: ["project-forme.svg", "Forme Objects — Identity / Art direction"],
    signal: ["project-signal.svg", "Signal / 02 — Campaign / Motion language"],
    arch: ["project-arch.svg", "Arch / Quiet spaces — Objects / Spatial study"],
    pulse: ["project-pulse.svg", "Pulse Studio — Identity / Visual system"],
    matter: ["project-matter.svg", "Material Matters — Digital / E-commerce"],
  };
  document.querySelectorAll("[data-lightbox]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = projects[button.dataset.lightbox];
      if (!item) return;
      lightboxImage.src = `assets/visuals/${item[0]}`;
      lightboxImage.alt = button.querySelector("img")?.alt || item[1];
      lightboxCaption.textContent = item[1];
      lightbox.showModal();
    }),
  );
  document
    .querySelectorAll("[data-close-dialog]")
    .forEach((button) =>
      button.addEventListener("click", () => button.closest("dialog")?.close()),
    );
  [detailDialog, lightbox].forEach((dialog) =>
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    }),
  );

  const filter = document.querySelector(".work-filter");
  const trigger = document.querySelector(".work-filter__trigger");
  const menu = document.getElementById("work-filter-menu");
  const options = [...menu.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll(".project-card")];
  const count = document.getElementById("visible-project-count");
  function setMenu(open, focusFirst = false) {
    trigger.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    if (open && focusFirst) options[0]?.focus();
  }
  trigger.addEventListener("click", () =>
    setMenu(trigger.getAttribute("aria-expanded") !== "true", true),
  );
  function applyFilter(value) {
    let visible = 0;
    cards.forEach((card) => {
      const show = value === "all" || card.dataset.category === value;
      card.classList.toggle("is-filtered-out", !show);
      if (show) visible++;
    });
    count.textContent = String(visible).padStart(2, "0");
    const chosen = options.find((option) => option.dataset.filter === value);
    document.querySelector(".work-filter__current").textContent =
      chosen.childNodes[0].textContent.trim();
    options.forEach((option) =>
      option.setAttribute(
        "aria-checked",
        String(option.dataset.filter === value),
      ),
    );
    document.getElementById("interaction-status").textContent =
      `${visible} projects shown.`;
  }
  options.forEach((option) =>
    option.addEventListener("click", () => {
      applyFilter(option.dataset.filter);
      setMenu(false);
      trigger.focus();
    }),
  );
  menu.addEventListener("keydown", (e) => {
    let i = options.indexOf(document.activeElement),
      next = i;
    if (e.key === "ArrowDown") next = (i + 1) % options.length;
    if (e.key === "ArrowUp") next = (i - 1 + options.length) % options.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = options.length - 1;
    if (next !== i) {
      e.preventDefault();
      options[next].focus();
    }
    if (e.key === "Escape") {
      setMenu(false);
      trigger.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (
      !filter.contains(e.target) &&
      trigger.getAttribute("aria-expanded") === "true"
    )
      setMenu(false);
  });
  document.querySelectorAll(".accordion__trigger").forEach((button) =>
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      document
        .getElementById(button.getAttribute("aria-controls"))
        .classList.toggle("is-open", open);
    }),
  );
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            navLinks.forEach((link) =>
              link.classList.toggle(
                "is-active",
                link.getAttribute("href") === `#${entry.target.id}`,
              ),
            );
        }),
      { rootMargin: "-35% 0px -55% 0px" },
    );
    ["collection", "studio", "work", "journal"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }
})();
