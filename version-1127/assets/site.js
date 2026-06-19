(function () {
    var state = {
        hlsInstances: []
    };

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('[data-menu-button]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initImages() {
        qsa('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
            }, { once: true });
        });
    }

    function initFilters() {
        var input = qs('[data-search-input]');
        var cards = qsa('[data-search]');
        var buttons = qsa('[data-filter-value]');
        var currentFilter = 'all';

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilter = currentFilter === 'all' || haystack.indexOf(currentFilter.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedFilter));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentFilter = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
    }

    function initVideoPlayer(videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = qs('[data-player-overlay]');
        if (!video || !sourceUrl) {
            return;
        }
        var isAttached = false;
        var hls = null;

        function attach() {
            if (isAttached) {
                return;
            }
            isAttached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                state.hlsInstances.push(hls);
                return;
            }
            video.src = sourceUrl;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.hidden = true;
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });
        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.hidden = false;
            }
        });
    }

    window.MovieSite = {
        init: function () {
            initMenu();
            initHero();
            initImages();
            initFilters();
        },
        initVideoPlayer: initVideoPlayer
    };
}());
