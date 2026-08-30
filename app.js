const hubData = [
  {
    name: "DESTINATIONS",
    categories: [...window.DEST_CATS_1, ...window.DEST_CATS_2, ...window.DEST_CATS_3],
    description: "Places to use, build, research, read, create, and publish.",
    label: "Destinations",
    count: 226
  },
  {
    name: "TRACKING & WATCHLISTS",
    categories: [...window.WATCH_CATS_1, ...window.WATCH_CATS_2],
    description: "People, topics, organizations, products, models, and platforms to follow.",
    label: "Watchlists",
    count: 130
  }
];
    const icons = {
      "GENAI ASSISTANTS & AGENTS": "spark",
      "PROMPTING & AI WORKFLOW": "prompt",
      "UTILITIES": "tool",
      "DATA, DOCUMENTS & CONVERSION": "data",
      "WRITING & PUBLISHING": "pen",
      "SOCIALS": "users",
      "IMAGE CREATION": "image",
      "DEVELOPER & AUTOMATION": "code",
      "RESEARCH & DISCOVERY": "search",
      "NEWS": "news",
      "DOCUMENTATION & LEARNING": "book",
      "FIGURES": "person",
      "TOPICS": "tag",
      "ORGANIZATIONS": "building",
      "PRODUCTS, MODELS & PLATFORMS": "boxes"
    };

    function iconSvg(name) {
      const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
      const paths = {
        spark: '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
        prompt: '<path d="M5 7h14M5 12h10M5 17h7"/><path d="m17 15 2 2-2 2"/>',
        tool: '<path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.4 2.4-3-3 2.4-2.4Z"/>',
        data: '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
        pen: '<path d="m4 20 4.2-1 10.6-10.6a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z"/><path d="m14.5 6.7 2.8 2.8"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
        image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/>',
        code: '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
        news: '<path d="M4 5h13v14H4z"/><path d="M17 8h3v9a2 2 0 0 1-2 2M7 9h7M7 13h7M7 17h4"/>',
        book: '<path d="M4 5a3 3 0 0 1 3-3h12v17H7a3 3 0 0 0-3 3V5Z"/><path d="M7 2v17"/>',
        person: '<circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
        tag: '<path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8.5" cy="8.5" r="1"/>',
        building: '<path d="M4 21V7l8-4 8 4v14"/><path d="M8 10h1M8 14h1M15 10h1M15 14h1M10 21v-4h4v4"/>',
        boxes: '<path d="m12 2 4 2.3v4.5L12 11 8 8.8V4.3L12 2ZM6 13l4 2.3v4.5L6 22l-4-2.2v-4.5L6 13ZM18 13l4 2.3v4.5L18 22l-4-2.2v-4.5L18 13Z"/>'
      };
      return `<svg ${common}>${paths[name] || paths.boxes}</svg>`;
    }

    const fallbackFavicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='9' fill='none' stroke='%236b7280' stroke-width='2'/%3E%3Cpath d='M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18' fill='none' stroke='%236b7280' stroke-width='1.5'/%3E%3C/svg%3E";

    function domainOf(url) {
      try { return new URL(url).hostname.replace(/^www\./, ""); }
      catch { return url; }
    }

    function originFavicon(url) {
      try { return new URL("/favicon.ico", new URL(url).origin).href; }
      catch { return fallbackFavicon; }
    }

    function googleFavicon(url) {
      return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=64`;
    }

    function slugify(text) {
      return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    const hub = document.getElementById("hub");
    const navChips = document.getElementById("navChips");
    const search = document.getElementById("search");
    const searchStatus = document.getElementById("searchStatus");
    const emptyState = document.getElementById("emptyState");
    const backTop = document.getElementById("backTop");

    const categories = [];
    const cards = [];
    const faviconImages = [];
    const faviconToggle = document.getElementById("faviconToggle");
    const faviconToggleLabel = document.getElementById("faviconToggleLabel");

    // Preview environments commonly block or ask permission for outbound image requests.
    // Default to network-free everywhere except GitHub Pages, while remembering a user's choice.
    const faviconPreference = localStorage.getItem("intelligenceHubFavicons");
    const isGitHubPages = location.hostname.endsWith(".github.io");
    let faviconsEnabled = faviconPreference === "on" || (faviconPreference === null && isGitHubPages);

    hubData.forEach((group, groupIndex) => {
      const groupEl = document.createElement("section");
      groupEl.className = "group";
      groupEl.dataset.group = group.name;

      const groupHeader = document.createElement("div");
      groupHeader.className = "group-header";
      groupHeader.innerHTML = `
        <div>
          <p class="group-kicker">${groupIndex === 0 ? "Use & Explore" : "Follow & Monitor"}</p>
          <h2 class="group-title">${group.label}</h2>
          <p class="group-description">${group.description}</p>
        </div>
        <div class="group-count">${group.count} links</div>
      `;
      groupEl.appendChild(groupHeader);

      const list = document.createElement("div");
      list.className = "accordion-list";

      group.categories.forEach((category, categoryIndex) => {
        const id = slugify(`${group.name}-${category.name}`);
        const catEl = document.createElement("section");
        catEl.className = "category";
        catEl.id = id;
        catEl.dataset.category = category.name;
        catEl.dataset.groupName = group.name;

        const button = document.createElement("button");
        button.className = "category-button";
        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", `${id}-panel`);
        button.innerHTML = `
          <div class="category-label">
            <span class="category-icon">${iconSvg(icons[category.name])}</span>
            <span class="category-title">${category.name}</span>
          </div>
          <div class="category-meta">
            <span class="count-pill" data-count>${category.links.length}</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
        `;

        const panel = document.createElement("div");
        panel.className = "category-panel";
        panel.id = `${id}-panel`;

        const grid = document.createElement("div");
        grid.className = "cards";

        category.links.forEach(item => {
          const card = document.createElement("a");
          const domain = domainOf(item.url);
          card.className = "bookmark-card";
          card.href = item.url;
          card.target = "_blank";
          card.rel = "noopener noreferrer";
          card.referrerPolicy = "no-referrer";
          card.title = `${item.title}\n${item.url}`;
          card.dataset.search = `${item.title} ${item.url} ${domain} ${category.name} ${group.name}`.toLowerCase();

          card.innerHTML = `
            <span class="favicon-box">
              <img class="favicon"
                   src="${fallbackFavicon}"
                   alt=""
                   loading="lazy"
                   decoding="async"
                   referrerpolicy="no-referrer"
                   data-google-favicon="${googleFavicon(item.url)}"
                   data-direct-favicon="${originFavicon(item.url)}">
            </span>
            <span class="card-copy">
              <span class="card-title">${item.title.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span>
              <span class="card-domain">${domain}</span>
            </span>
            <svg class="external" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;

          const img = card.querySelector(".favicon");
          faviconImages.push(img);
          img.addEventListener("error", () => {
            if (!faviconsEnabled) {
              img.src = fallbackFavicon;
              return;
            }
            if (img.dataset.fallbackUsed === "1") {
              img.src = fallbackFavicon;
            } else {
              img.dataset.fallbackUsed = "1";
              img.src = img.dataset.directFavicon;
            }
          });

          grid.appendChild(card);
          cards.push({ element: card, category: catEl, search: card.dataset.search });
        });

        panel.appendChild(grid);
        catEl.appendChild(button);
        catEl.appendChild(panel);
        list.appendChild(catEl);

        const categoryObj = {
          element: catEl,
          button,
          count: button.querySelector("[data-count]"),
          total: category.links.length,
          group: groupEl
        };
        categories.push(categoryObj);

        button.addEventListener("click", () => toggleCategory(categoryObj));

        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "nav-chip";
        chip.textContent = category.name;
        chip.addEventListener("click", () => {
          openCategory(categoryObj);
          catEl.scrollIntoView({behavior: "smooth", block: "start"});
        });
        navChips.appendChild(chip);

        // Open the first category in each major group by default.
        if (categoryIndex === 0) openCategory(categoryObj);
      });

      groupEl.appendChild(list);
      hub.appendChild(groupEl);
    });

    function openCategory(cat) {
      cat.element.classList.add("is-open");
      cat.button.setAttribute("aria-expanded", "true");
    }

    function closeCategory(cat) {
      cat.element.classList.remove("is-open");
      cat.button.setAttribute("aria-expanded", "false");
    }

    function toggleCategory(cat) {
      cat.element.classList.contains("is-open") ? closeCategory(cat) : openCategory(cat);
    }

    document.getElementById("expandAll").addEventListener("click", () => {
      categories.filter(c => !c.element.classList.contains("is-hidden")).forEach(openCategory);
    });

    document.getElementById("collapseAll").addEventListener("click", () => {
      categories.filter(c => !c.element.classList.contains("is-hidden")).forEach(closeCategory);
    });

    function applyFaviconState() {
      faviconImages.forEach(img => {
        delete img.dataset.fallbackUsed;
        img.src = faviconsEnabled ? img.dataset.googleFavicon : fallbackFavicon;
      });

      faviconToggleLabel.textContent = faviconsEnabled ? "Hide favicons" : "Load favicons";
      faviconToggle.setAttribute(
        "aria-label",
        faviconsEnabled ? "Hide favicons and stop external favicon requests" : "Load favicons"
      );
      faviconToggle.title = faviconsEnabled
        ? "Favicons are enabled in this browser"
        : "Favicons are paused to avoid network requests in preview/local mode";
    }

    faviconToggle.addEventListener("click", () => {
      faviconsEnabled = !faviconsEnabled;
      localStorage.setItem("intelligenceHubFavicons", faviconsEnabled ? "on" : "off");
      applyFaviconState();
    });

    function filterHub() {
      const q = search.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(card => {
        const match = !q || card.search.includes(q);
        card.element.classList.toggle("is-hidden", !match);
        if (match) visible++;
      });

      categories.forEach(cat => {
        const visibleCards = [...cat.element.querySelectorAll(".bookmark-card:not(.is-hidden)")].length;
        cat.count.textContent = q ? `${visibleCards}/${cat.total}` : cat.total;
        cat.element.classList.toggle("is-hidden", visibleCards === 0);

        if (q && visibleCards > 0) openCategory(cat);
      });

      document.querySelectorAll(".group").forEach(group => {
        const visibleCats = group.querySelectorAll(".category:not(.is-hidden)").length;
        group.classList.toggle("is-hidden", visibleCats === 0);
      });

      emptyState.classList.toggle("visible", visible === 0);
      searchStatus.textContent = q ? `${visible} match${visible === 1 ? "" : "es"}` : `${cards.length} links`;
    }

    search.addEventListener("input", filterHub);

    document.addEventListener("keydown", e => {
      const activeTag = document.activeElement?.tagName;
      const typing = activeTag === "INPUT" || activeTag === "TEXTAREA";

      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        search.focus();
        search.select();
      }
      if (e.key === "Escape" && document.activeElement === search) {
        search.value = "";
        filterHub();
        search.blur();
      }
    });

    window.addEventListener("scroll", () => {
      backTop.classList.toggle("visible", window.scrollY > 550);
    }, {passive: true});

    backTop.addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}));

    applyFaviconState();
    document.getElementById("totalLinks").textContent = cards.length;
    searchStatus.textContent = `${cards.length} links`;
