(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileNav() {
    var button = $("[data-nav-toggle]");
    var panel = $("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = $all(".hero-slide");
    var dots = $all(".hero-dots button");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });

    timer = setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupCardFilter() {
    var input = $("[data-filter-input]");
    if (!input) {
      return;
    }
    var cards = $all(".js-filter-card");
    input.addEventListener("input", function () {
      var q = normalizeText(input.value);
      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute("data-filter"));
        card.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
      });
    });
  }

  function setupSearchPage() {
    var container = $("[data-search-results]");
    var form = $("[data-search-form]");
    if (!container || !form || !window.MOVIE_INDEX) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(escapeHtml).join(" ");
      return [
        '<article class="video-card js-filter-card">',
        '<a href="' + escapeHtml(movie.url) + '" class="card-link">',
        '<div class="card-cover">',
        '<img src="./' + escapeHtml(movie.cover) + '.jpg" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy" class="video-card-image">',
        '<span class="card-score">' + escapeHtml(movie.score) + '</span>',
        '</div>',
        '<div class="card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="card-meta">',
        '<span class="badge-region">' + escapeHtml(movie.region) + '</span>',
        '<span class="badge-year">' + escapeHtml(movie.year) + '</span>',
        '<span>' + escapeHtml(movie.type) + '</span>',
        '</div>',
        '<div class="tag-line">' + tags + '</div>',
        '</div>',
        '</a>',
        '</article>'
      ].join("");
    }

    function render() {
      var q = normalizeText(input.value);
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var text = normalizeText([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 160);

      if (!list.length) {
        container.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
        return;
      }
      container.innerHTML = '<div class="video-grid">' + list.map(card).join("") + '</div>';
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var nextUrl = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
      window.history.replaceState(null, "", nextUrl);
      render();
    });
    render();
  }

  window.prepareMoviePlayer = function (videoUrl) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("play-overlay");
    var button = document.getElementById("play-button");
    if (!video || !videoUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
