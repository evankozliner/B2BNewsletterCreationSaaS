/* Potions Pricing Calculator — App
 *
 * URL params:
 *   ?dev=true                    — skip Stripe, jump straight to step 3 on "Pay Now"
 *   ?billing=quarterly           — monthly | quarterly | annual
 *   ?list_size=starter           — must match a tier id in config.js
 *   ?addons=linkedin,performance — pre-select add-ons (comma-separated ids)
 *   ?disabled_addons=performance — hide add-ons entirely (comma-separated ids)
 *   ?step=3&success=true         — Stripe return URL lands directly on this step
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────
  const state = {
    step: 1,
    billing: 'quarterly',
    listSize: 'starter',
    selectedAddons: new Set(),
    disabledAddons: new Set(),
    devMode: false,
  };

  // ─────────────────────────────────────────────
  // URL parameter parsing
  // ─────────────────────────────────────────────
  function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('dev') === 'true') {
      state.devMode = true;
    }

    const billing = params.get('billing');
    if (billing && ['monthly', 'quarterly', 'annual'].includes(billing)) {
      state.billing = billing;
    }

    const listSize = params.get('list_size');
    if (listSize && PRICING_CONFIG.listSizeTiers.some(t => t.id === listSize)) {
      state.listSize = listSize;
    }

    const addons = params.get('addons');
    if (addons) {
      addons.split(',').forEach(id => {
        const trimmed = id.trim();
        if (trimmed) state.selectedAddons.add(trimmed);
      });
    }

    const disabledAddons = params.get('disabled_addons');
    if (disabledAddons) {
      disabledAddons.split(',').forEach(id => {
        const trimmed = id.trim();
        if (trimmed) state.disabledAddons.add(trimmed);
      });
    }

    // Payment Link success return
    const success = params.get('success') === 'true';
    const onetimeDone = params.get('onetime_done') === 'true';

    if (success) {
      try {
        const saved = JSON.parse(localStorage.getItem('potions_pending_checkout') || 'null');
        if (saved && (Date.now() - saved.ts) < 86400000) {
          state.billing  = saved.billing  || state.billing;
          state.listSize = saved.listSize || state.listSize;
          (saved.selectedAddons || []).forEach(id => state.selectedAddons.add(id));

          if (saved.hasPendingOneTime && !onetimeDone) {
            state.step = 'onetime';
          } else {
            localStorage.removeItem('potions_pending_checkout');
            state.step = 3;
          }
        } else {
          state.step = 3;
        }
      } catch (e) {
        state.step = 3;
      }
    } else {
      const step = parseInt(params.get('step'), 10);
      if (step >= 1 && step <= 4) state.step = step;
    }
  }

  // ─────────────────────────────────────────────
  // Price helpers
  // ─────────────────────────────────────────────
  const PERIOD_MULTIPLIER = { monthly: 1, quarterly: 3, annual: 12 };
  const PERIOD_LABEL       = { monthly: '/mo', quarterly: '/quarter', annual: '/year' };
  const PERIOD_NAME        = { monthly: 'monthly', quarterly: 'quarterly', annual: 'annually' };

  function getCurrentTier() {
    return (
      PRICING_CONFIG.listSizeTiers.find(t => t.id === state.listSize) ||
      PRICING_CONFIG.listSizeTiers[0]
    );
  }

  function coreRatePerMonth() {
    return getCurrentTier().rates[state.billing] || getCurrentTier().rates.quarterly;
  }

  function addonRatePerMonth(addon) {
    if (addon.billingType === 'one_time') return 0;
    if (addon.id === 'linkedin') return addon.salePricePerMonth;
    if (addon.id === 'content-interviews') return addon.pricePerMonth;
    return 0;
  }

  function formatCurrency(n) {
    return '$' + n.toLocaleString('en-US');
  }

  // Returns { recurring: Number (per month), oneTime: Number }
  function calcTotals() {
    let recurringPerMonth = coreRatePerMonth();
    let oneTime = 0;

    state.selectedAddons.forEach(addonId => {
      const addon = PRICING_CONFIG.addons.find(a => a.id === addonId);
      if (!addon || !addon.enabled || state.disabledAddons.has(addonId)) return;

      if (addon.billingType === 'recurring') {
        recurringPerMonth += addonRatePerMonth(addon);
      } else {
        oneTime += addon.flatPrice;
      }
    });

    return { recurringPerMonth, oneTime };
  }

  // Returns the correct recurring Payment Link URL for the current billing + addon selection
  function getRecurringPaymentLink() {
    const parts = ['core'];
    if (state.selectedAddons.has('linkedin')) parts.push('linkedin');
    if (state.selectedAddons.has('content-interviews')) parts.push('content-interviews');
    const key = parts.join('+');
    const links = PRICING_CONFIG.paymentLinks.recurring[state.billing];
    return (links && links[key]) || null;
  }

  // Returns enabled one-time add-ons the user has selected
  function getSelectedOneTimeAddons() {
    return PRICING_CONFIG.addons.filter(a =>
      a.billingType === 'one_time' &&
      a.enabled &&
      state.selectedAddons.has(a.id) &&
      !state.disabledAddons.has(a.id)
    );
  }

  // ─────────────────────────────────────────────
  // Step navigation
  // ─────────────────────────────────────────────
  function showStep(n) {
    if (n === 'onetime') { showStep2b(); return; }

    document.querySelectorAll('.pricing-step').forEach(el => {
      el.style.display = 'none';
    });

    const el = document.getElementById('pricing-step-' + n);
    if (!el) return;
    el.style.display = 'block';

    // Progress bar
    const pct = Math.round((n / 4) * 100);
    const fill = document.getElementById('pricing-progress-fill');
    const text = document.getElementById('pricing-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = 'Step ' + n + ' of 4';

    state.step = n;

    if (n === 1) renderStep1();
    if (n === 2) renderStep2();
    if (n === 3) setupStep3();
    if (n === 4) {
      try { localStorage.removeItem('potions_pending_checkout'); } catch(e) {}
      renderStep4();
    }
  }

  // ─────────────────────────────────────────────
  // Step 1 — Plan configuration
  // ─────────────────────────────────────────────
  function renderStep1() {
    renderBillingToggle();
    renderListSizeSelect();
    renderCoreRow();
    renderAddonsTable();
    renderPriceSummary();
  }

  function renderBillingToggle() {
    const container = document.getElementById('billing-toggle');
    if (!container) return;

    container.querySelectorAll('.billing-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.billing === state.billing);
    });
  }

  function renderListSizeSelect() {
    const select = document.getElementById('list-size-select');
    if (!select) return;

    // Populate options if not already done
    if (!select.dataset.populated) {
      select.innerHTML = PRICING_CONFIG.listSizeTiers.map(tier =>
        `<option value="${tier.id}">${tier.label}</option>`
      ).join('');
      select.dataset.populated = '1';
    }

    select.value = state.listSize;
  }

  function renderCoreRow() {
    const el = document.getElementById('core-price-amount');
    const period = document.getElementById('core-price-period');
    if (!el) return;

    const rate = coreRatePerMonth();
    el.textContent = formatCurrency(rate) + '/mo';
    if (period) {
      period.textContent = 'billed ' + PERIOD_NAME[state.billing];
    }
  }

  function renderAddonsTable() {
    const container = document.getElementById('addons-table');
    if (!container) return;

    const visibleAddons = PRICING_CONFIG.addons.filter(
      a => a.enabled && !state.disabledAddons.has(a.id)
    );

    if (visibleAddons.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = visibleAddons.map(addon => {
      const isSelected = state.selectedAddons.has(addon.id);
      return `
        <div class="addon-row${isSelected ? ' selected' : ''}" data-addon-id="${addon.id}">
          <div class="addon-checkbox-col">
            <input
              type="checkbox"
              class="addon-checkbox"
              id="addon-cb-${addon.id}"
              data-addon-id="${addon.id}"
              ${isSelected ? 'checked' : ''}
            />
          </div>
          <div class="addon-info-col">
            <label for="addon-cb-${addon.id}" class="addon-name">
              ${escapeHtml(addon.name)}
              ${addon.saleLabel ? `<span class="sale-badge">${escapeHtml(addon.saleLabel)}</span>` : ''}
            </label>
            <ul class="addon-description">
              ${(addon.description || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
          </div>
          <div class="addon-price-col">
            ${renderAddonPrice(addon)}
          </div>
        </div>
      `;
    }).join('');

    // Attach events
    container.querySelectorAll('.addon-checkbox').forEach(cb => {
      cb.addEventListener('change', onAddonChange);
    });

    // Clicking the row also toggles
    container.querySelectorAll('.addon-row').forEach(row => {
      row.addEventListener('click', function (e) {
        if (e.target.type === 'checkbox' || e.target.tagName === 'LABEL' || e.target.tagName === 'A') return;
        const cb = row.querySelector('.addon-checkbox');
        if (cb) {
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  function renderAddonPrice(addon) {
    const periodLabel = PERIOD_LABEL[state.billing];
    const multiplier  = PERIOD_MULTIPLIER[state.billing];

    if (addon.billingType === 'one_time') {
      return `
        <span class="addon-price-amount">${escapeHtml(addon.priceLabel)}</span>
        <span class="addon-price-onetime">one-time</span>
      `;
    }

    if (addon.id === 'linkedin') {
      return `
        <span class="original-price">${formatCurrency(addon.originalPricePerMonth)}/mo</span>
        <span class="sale-price">${formatCurrency(addon.salePricePerMonth)}/mo</span>
        <span class="addon-price-period">billed ${PERIOD_NAME[state.billing]}</span>
      `;
    }

    if (addon.id === 'content-interviews') {
      return `
        <span class="addon-price-amount">${formatCurrency(addon.pricePerMonth)}/mo</span>
        <span class="addon-price-period">billed ${PERIOD_NAME[state.billing]}</span>
      `;
    }

    return `<span class="addon-price-amount">${escapeHtml(addon.priceLabel || '')}</span>`;
  }

  function renderPriceSummary() {
    const { recurringPerMonth, oneTime } = calcTotals();
    const periodLabel = PERIOD_LABEL[state.billing];

    const recurringEl = document.getElementById('price-summary-recurring');
    const periodEl    = document.getElementById('price-summary-period');
    const onetimeEl   = document.getElementById('price-summary-onetime');

    if (recurringEl) {
      recurringEl.textContent = formatCurrency(recurringPerMonth) + '/mo';
    }
    if (periodEl) {
      periodEl.textContent = 'billed ' + PERIOD_NAME[state.billing];
    }
    if (onetimeEl) {
      if (oneTime > 0) {
        onetimeEl.textContent = '+ ' + formatCurrency(oneTime) + ' one-time';
        onetimeEl.style.display = 'block';
      } else {
        onetimeEl.style.display = 'none';
      }
    }
  }

  function onAddonChange(e) {
    const addonId = e.target.dataset.addonId;
    if (!addonId) return;

    if (e.target.checked) {
      state.selectedAddons.add(addonId);
    } else {
      state.selectedAddons.delete(addonId);
    }

    // Update row styling
    const row = e.target.closest('.addon-row');
    if (row) row.classList.toggle('selected', e.target.checked);

    renderCoreRow();
    renderAddonPrice(PRICING_CONFIG.addons.find(a => a.id === addonId) || {});
    renderPriceSummary();
  }

  // ─────────────────────────────────────────────
  // Step 2 — Review & Pay
  // ─────────────────────────────────────────────
  function renderStep2() {
    const container = document.getElementById('order-summary');
    if (!container) return;

    const tier = getCurrentTier();
    const rate = coreRatePerMonth();
    const { recurringPerMonth, oneTime } = calcTotals();

    const selectedAddonObjects = PRICING_CONFIG.addons.filter(
      a => state.selectedAddons.has(a.id) && a.enabled && !state.disabledAddons.has(a.id)
    );
    const recurringAddonObjects = selectedAddonObjects.filter(a => a.billingType === 'recurring');
    const oneTimeAddonObjects   = selectedAddonObjects.filter(a => a.billingType === 'one_time');

    // ── Core item ──
    const coreItem = `
      <li class="order-summary-item">
        <div>
          <div class="order-item-name">Potions Newsletter — ${tier.label}</div>
          <div class="order-item-sub">Core newsletter service</div>
        </div>
        <div class="order-item-price">${formatCurrency(rate)}/mo</div>
      </li>
    `;

    function addonItemHtml(addon) {
      let price = '';
      if (addon.billingType === 'one_time') {
        price = formatCurrency(addon.flatPrice) + ' one-time';
      } else if (addon.id === 'linkedin') {
        price = formatCurrency(addon.salePricePerMonth) + '/mo';
      } else if (addon.id === 'content-interviews') {
        price = formatCurrency(addon.pricePerMonth) + '/mo';
      }
      return `
        <li class="order-summary-item">
          <div><div class="order-item-name">${escapeHtml(addon.name)}</div></div>
          <div class="order-item-price">${price}</div>
        </li>
      `;
    }

    let html = '';

    if (oneTimeAddonObjects.length > 0) {
      // ── Two-section layout — each section has its own pay button ──
      const recurringItems = coreItem + recurringAddonObjects.map(addonItemHtml).join('');

      const oneTimeItems = oneTimeAddonObjects.map(addonItemHtml).join('');

      html = `
        <div class="payment-section">
          <div class="payment-section-header">
            <span class="payment-section-number">Payment 1 of 2</span>
            <span class="payment-section-type">Subscription</span>
          </div>
          <ul class="order-summary-list">${recurringItems}</ul>
          <hr class="order-summary-divider" />
          <div class="order-summary-total-row">
            <span class="order-summary-total-label">Recurring total</span>
            <span class="order-summary-total-amount">${formatCurrency(recurringPerMonth)}/mo billed ${PERIOD_NAME[state.billing]}</span>
          </div>
          <button class="btn-pay-now" id="btn-pay-subscription" style="margin-top:1.25rem;width:100%;">
            Pay ${formatCurrency(recurringPerMonth)}/mo &rarr;
          </button>
        </div>
        <div class="payment-section payment-section-onetime">
          <div class="payment-section-header">
            <span class="payment-section-number">Payment 2 of 2</span>
            <span class="payment-section-type">One-time add-ons</span>
          </div>
          <ul class="order-summary-list">${oneTimeItems}</ul>
          <hr class="order-summary-divider" />
          <div class="order-summary-total-row">
            <span class="order-summary-total-label">One-time total</span>
            <span class="order-summary-total-amount">${formatCurrency(oneTime)}</span>
          </div>
          <button class="btn-pay-now btn-pay-locked" disabled style="margin-top:1.25rem;width:100%;">
            Pay ${formatCurrency(oneTime)} &rarr;
          </button>
          <p class="payment-section-note">Available after you complete payment 1</p>
        </div>
      `;

      // Hide the global pay-now button (we rendered one inside the section)
      const globalBtn = document.getElementById('btn-pay-now');
      if (globalBtn) globalBtn.style.display = 'none';
    } else {
      // ── Single-section layout (no one-time add-ons) ──
      const addonItems = recurringAddonObjects.map(addonItemHtml).join('');
      html = `
        <p class="order-summary-title">Your Order</p>
        <ul class="order-summary-list">
          ${coreItem}
          ${addonItems}
        </ul>
        <hr class="order-summary-divider" />
        <div class="order-summary-total-row">
          <span class="order-summary-total-label">Recurring total</span>
          <span class="order-summary-total-amount">${formatCurrency(recurringPerMonth)}/mo billed ${PERIOD_NAME[state.billing]}</span>
        </div>
      `;
    }

    container.innerHTML = html;

    if (oneTimeAddonObjects.length > 0) {
      // Attach click handler to the inline subscription pay button
      const subBtn = document.getElementById('btn-pay-subscription');
      if (subBtn) subBtn.addEventListener('click', initiateCheckout);
    } else {
      // Restore the global pay-now button (may have been hidden by a previous render)
      const globalBtn = document.getElementById('btn-pay-now');
      if (globalBtn) globalBtn.style.display = '';
    }

    // Dev note on pay button
    const devNote = document.getElementById('dev-skip-note');
    if (devNote) devNote.style.display = state.devMode ? 'block' : 'none';
  }

  // ─────────────────────────────────────────────
  // Step 2b — One-time add-on payment interstitial
  // ─────────────────────────────────────────────
  function showStep2b() {
    document.querySelectorAll('.pricing-step').forEach(el => { el.style.display = 'none'; });
    const el = document.getElementById('pricing-step-2b');
    if (!el) { showStep(3); return; }
    el.style.display = 'block';

    const fill = document.getElementById('pricing-progress-fill');
    const text = document.getElementById('pricing-progress-text');
    if (fill) fill.style.width = '50%';
    if (text) text.textContent = 'Almost done!';

    renderStep2b();
  }

  function renderStep2b() {
    const container = document.getElementById('onetime-payment-items');
    if (!container) return;

    const oneTimeAddons = getSelectedOneTimeAddons();

    container.innerHTML = oneTimeAddons.map(function(addon) {
      const link = PRICING_CONFIG.paymentLinks.oneTime[addon.id];
      const isPlaceholder = !link || link.includes('PLACEHOLDER');
      const buttonHtml = isPlaceholder
        ? '<span class="onetime-link-unavailable">Link coming soon</span>'
        : '<a href="' + link + '" target="_blank" rel="noopener" class="btn-pay-now onetime-pay-btn">Pay ' + escapeHtml(addon.priceLabel) + ' &rarr;</a>';

      return '<div class="onetime-addon-row">' +
        '<div>' +
          '<div class="order-item-name">' + escapeHtml(addon.name) + '</div>' +
          '<div class="order-item-sub">' + escapeHtml(addon.priceLabel) + ' one-time</div>' +
        '</div>' +
        buttonHtml +
        '</div>';
    }).join('');

    const skipBtn = document.getElementById('btn-skip-onetime');
    if (skipBtn) {
      const newSkip = skipBtn.cloneNode(true);
      skipBtn.parentNode.replaceChild(newSkip, skipBtn);
      newSkip.addEventListener('click', function() {
        try { localStorage.removeItem('potions_pending_checkout'); } catch(e) {}
        showStep(3);
      });
    }
  }

  // ─────────────────────────────────────────────
  // Step 3 — Email capture
  // ─────────────────────────────────────────────
  function setupStep3() {
    const errEl = document.getElementById('email-submit-error');
    if (errEl) errEl.style.display = 'none';

    // Clone both elements to clear any stale event listeners from previous visits
    const oldInput = document.getElementById('email-input');
    const oldBtn   = document.getElementById('btn-finish-setup');
    if (!oldInput || !oldBtn) return;

    const savedValue = oldInput.value;

    const input = oldInput.cloneNode(true);
    input.value = savedValue;
    oldInput.parentNode.replaceChild(input, oldInput);

    const btn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(btn, oldBtn);

    // Sync disabled state with whatever is already in the input
    btn.disabled = !isValidEmail(input.value.trim());

    input.addEventListener('input', function () {
      btn.disabled = !isValidEmail(input.value.trim());
    });

    btn.addEventListener('click', function () {
      const email = input.value.trim();
      if (!isValidEmail(email)) return;

      btn.disabled = true;
      btn.textContent = 'Setting up your account...';
      if (errEl) errEl.style.display = 'none';

      // Fire webhook non-blocking — don't let a failed webhook stop the user
      submitEmail(email).catch(function (err) {
        console.warn('Email webhook failed (non-blocking):', err);
      });

      showStep(4);
    });
  }

  async function submitEmail(email) {
    const { recurringPerMonth, oneTime } = calcTotals();
    const payload = {
      email,
      billing: state.billing,
      listSize: state.listSize,
      selectedAddons: Array.from(state.selectedAddons),
      recurringPerMonth,
      oneTimeCost: oneTime,
      timestamp: new Date().toISOString(),
      dev: state.devMode,
    };

    await fetch(PRICING_CONFIG.webhooks.emailCapture, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  // ─────────────────────────────────────────────
  // Step 4 — Welcome
  // ─────────────────────────────────────────────
  function renderStep4() {
    // Static HTML — nothing dynamic needed
  }

  // ─────────────────────────────────────────────
  // Payment Link checkout
  // ─────────────────────────────────────────────
  function initiateCheckout() {
    const link = getRecurringPaymentLink();
    const isPlaceholder = !link || link.includes('PLACEHOLDER');

    if (state.devMode || isPlaceholder) {
      showStep(3);
      return;
    }

    // Persist selections so we can restore them after the Stripe redirect
    const oneTimeAddons = getSelectedOneTimeAddons();
    try {
      localStorage.setItem('potions_pending_checkout', JSON.stringify({
        billing: state.billing,
        listSize: state.listSize,
        selectedAddons: Array.from(state.selectedAddons),
        hasPendingOneTime: oneTimeAddons.length > 0,
        ts: Date.now(),
      }));
    } catch (e) {
      // localStorage unavailable — continue anyway
    }

    window.open(link, '_blank');

    // Advance to next step immediately — don't block on payment completion
    if (oneTimeAddons.length > 0) {
      showStep('onetime');
    } else {
      showStep(3);
    }
  }

  // ─────────────────────────────────────────────
  // Event listeners
  // ─────────────────────────────────────────────
  function attachEventListeners() {
    // Billing toggle
    const toggle = document.getElementById('billing-toggle');
    if (toggle) {
      toggle.addEventListener('click', function (e) {
        const btn = e.target.closest('.billing-btn');
        if (!btn) return;
        state.billing = btn.dataset.billing;
        renderBillingToggle();
        renderCoreRow();
        renderAddonsTable();
        renderPriceSummary();
      });
    }

    // List size select
    const listSizeEl = document.getElementById('list-size-select');
    if (listSizeEl) {
      listSizeEl.addEventListener('change', function () {
        state.listSize = this.value;
        renderCoreRow();
        renderPriceSummary();
      });
    }

    // Step 1 → 2
    const btnStep1Next = document.getElementById('btn-step1-next');
    if (btnStep1Next) {
      btnStep1Next.addEventListener('click', function () {
        renderStep2();
        showStep(2);
      });
    }

    // Step 2 back → 1
    const btnStep2Back = document.getElementById('btn-step2-back');
    if (btnStep2Back) {
      btnStep2Back.addEventListener('click', function () {
        showStep(1);
      });
    }

    // Pay Now
    const btnPayNow = document.getElementById('btn-pay-now');
    if (btnPayNow) {
      btnPayNow.addEventListener('click', initiateCheckout);
    }

    // Step 3 back → 2
    const btnStep3Back = document.getElementById('btn-step3-back');
    if (btnStep3Back) {
      btnStep3Back.addEventListener('click', function () {
        showStep(2);
      });
    }
  }

  // ─────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ─────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────
  function init() {
    parseUrlParams();

    // Dev mode banner
    if (state.devMode) {
      const banner = document.getElementById('dev-banner');
      if (banner) banner.style.display = 'block';
      document.body.classList.add('dev-mode-active');
    }

    attachEventListeners();
    if (state.step === 'onetime') {
      showStep2b();
    } else {
      showStep(state.step);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
