(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var keyword = input ? input.value.trim() : '';
            var target = form.getAttribute('data-search-url') || 'search.html';
            if (keyword) {
                window.location.href = target + '?q=' + encodeURIComponent(keyword);
            } else {
                window.location.href = target;
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    if (slides.length) {
        setHero(0);
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                setHero(dotIndex);
            });
        });
        window.setInterval(function () {
            setHero(activeIndex + 1);
        }, 5800);
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var region = root.querySelector('[data-filter-region]');
        var type = root.querySelector('[data-filter-type]');
        var year = root.querySelector('[data-filter-year]');
        var empty = root.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-search]'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (input && initial) {
            input.value = initial;
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value.trim() : '');
            var regionValue = normalize(region ? region.value : '');
            var typeValue = normalize(type ? type.value : '');
            var yearValue = normalize(year ? year.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    matched = false;
                }
                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });
})();
