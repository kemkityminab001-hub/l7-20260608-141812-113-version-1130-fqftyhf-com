(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('.cover-shell img').forEach(function (img) {
    img.addEventListener('error', function () {
      var shell = img.closest('.cover-shell');
      if (shell) {
        shell.classList.add('is-missing');
      }
    });
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    if (!slides.length) {
      return;
    }

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function setupSearch() {
    var input = document.querySelector('.js-site-search');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var activeFilter = 'all';

    if (!cards.length) {
      return;
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var filter = normalize(activeFilter);

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var queryOk = !query || haystack.indexOf(query) !== -1;
        var filterOk = filter === 'all' || haystack.indexOf(filter) !== -1;
        card.classList.toggle('is-hidden', !(queryOk && filterOk));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
  }

  var hlsPromise;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function bindStream(video, url) {
    if (!video || !url || video.dataset.ready === '1') {
      return Promise.resolve();
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }

    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    });
  }

  function setupPlayers() {
    document.querySelectorAll('.js-player').forEach(function (frame) {
      var video = frame.querySelector('video');
      var button = frame.querySelector('.video-start');
      var stream = frame.getAttribute('data-stream');

      function start() {
        bindStream(video, stream).then(function () {
          frame.classList.add('is-playing');
          var playResult = video.play();
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
          }
        }).catch(function () {
          if (video && stream) {
            video.src = stream;
            frame.classList.add('is-playing');
            var retry = video.play();
            if (retry && typeof retry.catch === 'function') {
              retry.catch(function () {});
            }
          }
        });
      }

      if (button) {
        button.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!video.dataset.ready) {
            start();
          }
        });
        video.addEventListener('play', function () {
          frame.classList.add('is-playing');
        });
      }
    });
  }

  setupHero();
  setupSearch();
  setupPlayers();
})();
