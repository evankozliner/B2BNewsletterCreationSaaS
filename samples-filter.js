// Tag filtering + pagination for the samples page.
// Multiple tags combine as a union (a card shows if it has ANY selected tag).
// The filtered set is paginated PAGE_SIZE cards at a time, and both the tag
// selection and page are mirrored to the URL (?tags=a,b&page=2) so filtered
// views are shareable.
document.addEventListener('DOMContentLoaded', function () {
    var PAGE_SIZE = 4;

    var filterBar = document.getElementById('samples-filter');
    var pagination = document.getElementById('samples-pagination');
    if (!filterBar || !pagination) return;

    var tagButtons = Array.prototype.slice.call(filterBar.querySelectorAll('.filter-tag[data-tag]:not([data-tag="all"])'));
    var allButton = filterBar.querySelector('.filter-tag[data-tag="all"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.sample-card-link[data-tags]'));
    var validTags = tagButtons.map(function (btn) { return btn.dataset.tag; });
    var currentPage = 1;

    function selectedTags() {
        return tagButtons
            .filter(function (btn) { return btn.classList.contains('active'); })
            .map(function (btn) { return btn.dataset.tag; });
    }

    // Rank of a card for the current selection, from data-featured="tag:1,tag:2".
    // Lower ranks come first when their tag is selected; unranked cards keep DOM order.
    function featuredRank(card, selected) {
        if (!card.dataset.featured) return Infinity;
        var rank = Infinity;
        card.dataset.featured.split(',').forEach(function (entry) {
            var parts = entry.split(':');
            if (selected.indexOf(parts[0].trim()) !== -1) {
                rank = Math.min(rank, parseInt(parts[1], 10) || Infinity);
            }
        });
        return rank;
    }

    function matchingCards() {
        var selected = selectedTags();
        var matching = cards.filter(function (card) {
            var cardTags = card.dataset.tags.split(/\s+/);
            return selected.length === 0 || selected.some(function (tag) {
                return cardTags.indexOf(tag) !== -1;
            });
        });
        return matching
            .map(function (card, i) { return { card: card, rank: featuredRank(card, selected), i: i }; })
            .sort(function (a, b) { return (a.rank - b.rank) || (a.i - b.i); })
            .map(function (entry) { return entry.card; });
    }

    function render() {
        var selected = selectedTags();
        allButton.classList.toggle('active', selected.length === 0);

        var matching = matchingCards();
        var totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
        currentPage = Math.min(Math.max(currentPage, 1), totalPages);

        var start = (currentPage - 1) * PAGE_SIZE;
        var pageCards = matching.slice(start, start + PAGE_SIZE);
        cards.forEach(function (card) {
            card.classList.toggle('sample-card-hidden', pageCards.indexOf(card) === -1);
        });
        // Featured ranks can promote a card past its DOM position, so place the
        // visible cards in their computed order.
        pageCards.forEach(function (card) {
            pagination.parentNode.insertBefore(card, pagination);
        });

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        pagination.innerHTML = '';
        if (totalPages <= 1) return;

        function addButton(label, page, opts) {
            opts = opts || {};
            var btn = document.createElement('button');
            btn.className = 'page-btn' + (opts.current ? ' active' : '');
            btn.textContent = label;
            btn.disabled = !!opts.disabled;
            if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
            if (opts.current) btn.setAttribute('aria-current', 'page');
            btn.addEventListener('click', function () { goToPage(page); });
            pagination.appendChild(btn);
        }

        addButton('←', currentPage - 1, { disabled: currentPage === 1, ariaLabel: 'Previous page' });
        for (var p = 1; p <= totalPages; p++) {
            addButton(String(p), p, { current: p === currentPage, ariaLabel: 'Page ' + p });
        }
        addButton('→', currentPage + 1, { disabled: currentPage === totalPages, ariaLabel: 'Next page' });
    }

    function goToPage(page) {
        currentPage = page;
        render();
        syncUrl();
        var container = document.querySelector('.samples-container');
        if (container) container.scrollIntoView({ behavior: 'smooth' });
    }

    function syncUrl() {
        var selected = selectedTags();
        var params = new URLSearchParams(window.location.search);
        if (selected.length === 0) {
            params.delete('tags');
        } else {
            params.set('tags', selected.join(','));
        }
        if (currentPage <= 1) {
            params.delete('page');
        } else {
            params.set('page', String(currentPage));
        }
        var query = params.toString();
        var url = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
        history.replaceState(null, '', url);
    }

    filterBar.addEventListener('click', function (event) {
        var button = event.target.closest('.filter-tag');
        if (!button) return;

        if (button.dataset.tag === 'all') {
            tagButtons.forEach(function (btn) { btn.classList.remove('active'); });
        } else {
            button.classList.toggle('active');
        }
        currentPage = 1; // changing the filter always restarts at the first page
        render();
        syncUrl();
    });

    // Apply any tags and page passed in via the URL on load.
    var params = new URLSearchParams(window.location.search);
    var initialTags = (params.get('tags') || '')
        .split(',')
        .map(function (tag) { return tag.trim().toLowerCase(); })
        .filter(function (tag) { return validTags.indexOf(tag) !== -1; });
    tagButtons.forEach(function (btn) {
        btn.classList.toggle('active', initialTags.indexOf(btn.dataset.tag) !== -1);
    });
    currentPage = parseInt(params.get('page'), 10) || 1;
    render();
});
