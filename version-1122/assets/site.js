(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
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
    show(0);
    restart();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('.filter-list'));
    if (!lists.length) {
      return;
    }
    var input = document.querySelector('.filter-input');
    var year = document.querySelector('.filter-year');
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    function matchesYear(card, selected) {
      if (!selected) {
        return true;
      }
      var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
      if (selected === '2020') {
        return cardYear <= 2020;
      }
      return String(cardYear) === selected;
    }
    function apply() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;
      lists.forEach(function (list) {
        Array.prototype.slice.call(list.querySelectorAll('.searchable-card')).forEach(function (card) {
          var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var ok = (!term || text.indexOf(term) !== -1) && matchesYear(card, selectedYear);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  }

  function initPlayer() {
    var shell = document.querySelector('.movie-player');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var message = shell.querySelector('.player-message');
    var source = video ? video.querySelector('source') : null;
    var url = source ? source.getAttribute('src') : '';
    var hls = null;
    if (!video || !url) {
      return;
    }
    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }
    function prepare() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('暂时无法播放，请稍后重试');
          }
        });
        return;
      }
      video.src = url;
    }
    function begin() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setMessage('');
      var play = video.play();
      if (play && play.catch) {
        play.catch(function () {
          setMessage('点击播放器继续观看');
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }
    prepare();
    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime > 0 && !video.ended && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      setMessage('暂时无法播放，请稍后重试');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
