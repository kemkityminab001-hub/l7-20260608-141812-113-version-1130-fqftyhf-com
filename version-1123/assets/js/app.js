const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character];
  });
}

function initMobileNavigation() {
  const button = qs('[data-mobile-toggle]');
  const panel = qs('[data-mobile-panel]');
  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function initGlobalSearchForms() {
  qsa('[data-global-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = qs('input[name="q"]', form);
      const query = input ? input.value.trim() : '';
      const target = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
      window.location.href = target;
    });
  });
}

function initHeroCarousel() {
  const hero = qs('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = qsa('[data-hero-slide]', hero);
  const dots = qsa('[data-hero-dot]', hero);
  const prev = qs('[data-hero-prev]', hero);
  const next = qs('[data-hero-next]', hero);
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === active));
    dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === active));
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(active + 1), 5000);
  };

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      show(idx);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(active - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(active + 1);
      restart();
    });
  }

  if (slides.length > 0) {
    show(0);
    restart();
  }
}

function initCardFilters() {
  qsa('[data-filter-panel]').forEach((panel) => {
    const scopeSelector = panel.dataset.filterPanel;
    const scope = scopeSelector ? qs(scopeSelector) : document;
    if (!scope) {
      return;
    }

    const cards = qsa('[data-movie-card]', scope);
    const keywordInput = qs('[data-filter-keyword]', panel);
    const regionSelect = qs('[data-filter-region]', panel);
    const typeSelect = qs('[data-filter-type]', panel);
    const yearSelect = qs('[data-filter-year]', panel);
    const count = qs('[data-filter-count]');

    const apply = () => {
      const keyword = normalizeText(keywordInput ? keywordInput.value : '');
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalizeText([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' '));
        const passKeyword = !keyword || haystack.includes(keyword);
        const passRegion = !region || card.dataset.region === region;
        const passType = !type || card.dataset.type === type;
        const passYear = !year || card.dataset.year === year;
        const pass = passKeyword && passRegion && passType && passYear;
        card.classList.toggle('hidden-by-filter', !pass);
        if (pass) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    };

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
}

function preparePlayer(player) {
  if (player.dataset.ready === 'true') {
    return;
  }

  const video = qs('video', player);
  const source = player.dataset.src;
  const message = qs('[data-player-message]', player);
  if (!video || !source) {
    return;
  }

  const showMessage = (text) => {
    if (message) {
      message.textContent = text;
      message.classList.add('is-visible');
    }
  };

  const Hls = window.Hls;
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        showMessage('网络连接异常，正在尝试重新加载播放源。');
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        showMessage('媒体解码异常，正在尝试恢复播放。');
        hls.recoverMediaError();
      } else {
        showMessage('当前浏览器无法播放此视频源。');
        hls.destroy();
      }
    });
    player.dataset.ready = 'true';
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    player.dataset.ready = 'true';
    return;
  }

  showMessage('当前浏览器暂不支持 HLS 播放。');
}

function initPlayers() {
  qsa('[data-player]').forEach((player) => {
    const overlay = qs('[data-player-overlay]', player);
    const video = qs('video', player);
    const startPlayback = () => {
      preparePlayer(player);
      if (overlay) {
        overlay.style.display = 'none';
      }
      if (video) {
        video.controls = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            const message = qs('[data-player-message]', player);
            if (message) {
              message.textContent = '请再次点击播放器开始播放。';
              message.classList.add('is-visible');
            }
          });
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          startPlayback();
        }
      });
    }
  });
}

function movieCardTemplate(movie) {
  const safeTitle = escapeHtml(movie.title);
  const safeRegion = escapeHtml(movie.region);
  const safeType = escapeHtml(movie.type);
  const safeYear = escapeHtml(movie.year);
  const safeGenre = escapeHtml(movie.genre);
  const safeTagsText = escapeHtml(movie.tags.join(' '));
  const safeCategory = escapeHtml(movie.siteCategory);
  const safeOneLine = escapeHtml(movie.oneLine);
  const safeImage = escapeHtml(movie.image);
  const safeUrl = escapeHtml(movie.url);
  const tags = movie.tags
    .slice(0, 3)
    .map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`)
    .join('');

  return `
    <article class="movie-card" data-movie-card data-title="${safeTitle}" data-region="${safeRegion}" data-type="${safeType}" data-year="${safeYear}" data-genre="${safeGenre}" data-tags="${safeTagsText}">
      <a href="${safeUrl}" class="block">
        <div class="relative aspect-[3/4] overflow-hidden poster-frame">
          <img src="${safeImage}" alt="${safeTitle}" loading="lazy" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 badge badge-solid">${safeCategory}</span>
          <span class="absolute bottom-3 right-3 meta-pill">★ ${escapeHtml(movie.rating)}</span>
        </div>
        <div class="p-4">
          <h3 class="text-white font-bold text-base line-clamp-2">${safeTitle}</h3>
          <p class="text-gray-400 text-sm mt-2 line-clamp-2">${safeOneLine}</p>
          <div class="flex flex-wrap gap-2 mt-3">${tags}</div>
        </div>
      </a>
    </article>
  `;
}

function initSearchPage() {
  const root = qs('[data-search-root]');
  if (!root || !window.SEARCH_INDEX) {
    return;
  }

  const input = qs('[data-search-input]', root);
  const results = qs('[data-search-results]', root);
  const count = qs('[data-search-count]', root);
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (input) {
    input.value = initialQuery;
  }

  const render = () => {
    const query = normalizeText(input ? input.value : '');
    const source = window.SEARCH_INDEX;
    const matched = query
      ? source.filter((movie) => normalizeText([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' ')).includes(query))
      : source.slice(0, 80);

    if (count) {
      count.textContent = String(matched.length);
    }

    if (results) {
      results.innerHTML = matched.slice(0, 200).map(movieCardTemplate).join('');
    }
  };

  if (input) {
    input.addEventListener('input', render);
  }

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initGlobalSearchForms();
  initHeroCarousel();
  initCardFilters();
  initPlayers();
  initSearchPage();
});
