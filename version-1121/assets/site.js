(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.classList.toggle('is-visible', window.scrollY > 420);
        }, { passive: true });

        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = () => {
            timer = window.setInterval(() => showSlide(current + 1), 5200);
        };

        const restart = () => {
            window.clearInterval(timer);
            start();
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                showSlide(current + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            start();
        }
    }

    const filterScope = document.querySelector('[data-filter-scope]');

    if (filterScope) {
        const keywordInput = filterScope.querySelector('[data-filter-keyword]');
        const categorySelect = filterScope.querySelector('[data-filter-category]');
        const yearSelect = filterScope.querySelector('[data-filter-year]');
        const typeSelect = filterScope.querySelector('[data-filter-type]');
        const countNode = filterScope.querySelector('[data-filter-count]');
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        const emptyState = document.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';

        const setOptions = (select, values) => {
            if (!select) {
                return;
            }
            const current = select.value;
            values.forEach((value) => {
                if (!value) {
                    return;
                }
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
            select.value = current;
        };

        const years = Array.from(new Set(cards.map((card) => card.dataset.year).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
        const types = Array.from(new Set(cards.map((card) => card.dataset.type).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'));

        setOptions(yearSelect, years);
        setOptions(typeSelect, types);

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        const applyFilters = () => {
            const keyword = (keywordInput?.value || '').trim().toLowerCase();
            const category = categorySelect?.value || '';
            const year = yearSelect?.value || '';
            const type = typeSelect?.value || '';
            let visible = 0;

            cards.forEach((card) => {
                const text = (card.dataset.search || '').toLowerCase();
                const matchedKeyword = !keyword || text.includes(keyword);
                const matchedCategory = !category || card.dataset.category === category;
                const matchedYear = !year || card.dataset.year === year;
                const matchedType = !type || card.dataset.type === type;
                const matched = matchedKeyword && matchedCategory && matchedYear && matchedType;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        };

        [keywordInput, categorySelect, yearSelect, typeSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
})();
