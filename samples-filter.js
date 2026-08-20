// Tag filtering for the samples page.
// Multiple tags combine as a union (a card shows if it has ANY selected tag),
// and the selection is mirrored to the URL (?tags=a,b) so filtered views are shareable.
document.addEventListener('DOMContentLoaded', function () {
    var filterBar = document.getElementById('samples-filter');
    if (!filterBar) return;

    var tagButtons = Array.prototype.slice.call(filterBar.querySelectorAll('.filter-tag[data-tag]:not([data-tag="all"])'));
    var allButton = filterBar.querySelector('.filter-tag[data-tag="all"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.sample-card-link[data-tags]'));
    var validTags = tagButtons.map(function (btn) { return btn.dataset.tag; });

    function selectedTags() {
        return tagButtons
            .filter(function (btn) { return btn.classList.contains('active'); })
            .map(function (btn) { return btn.dataset.tag; });
    }

    function applyFilter() {
        var selected = selectedTags();
        allButton.classList.toggle('active', selected.length === 0);

        cards.forEach(function (card) {
            var cardTags = card.dataset.tags.split(/\s+/);
            var visible = selected.length === 0 || selected.some(function (tag) {
                return cardTags.indexOf(tag) !== -1;
            });
            card.classList.toggle('sample-card-hidden', !visible);
        });
    }

    function syncUrl() {
        var selected = selectedTags();
        var params = new URLSearchParams(window.location.search);
        if (selected.length === 0) {
            params.delete('tags');
        } else {
            params.set('tags', selected.join(','));
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
        applyFilter();
        syncUrl();
    });

    // Apply any tags passed in via the URL on load.
    var initial = (new URLSearchParams(window.location.search).get('tags') || '')
        .split(',')
        .map(function (tag) { return tag.trim().toLowerCase(); })
        .filter(function (tag) { return validTags.indexOf(tag) !== -1; });

    tagButtons.forEach(function (btn) {
        btn.classList.toggle('active', initial.indexOf(btn.dataset.tag) !== -1);
    });
    applyFilter();
});
