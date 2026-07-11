/* Potions Post-Signup Flow
 *
 * Simple 2-step flow:
 *   Step 1: Collect email address
 *   Step 2: Welcome + inbox instructions
 *
 * Waits for webhook confirmation before advancing.
 */

(function () {
  'use strict';

  var WEBHOOK_URL = 'https://aimply-webapp-api-499b77f2f271.herokuapp.com/v1/journeys/po_jny_iH7ghJK5ey5RNx4fWT1eJmY8/trigger';

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showStep(n) {
    document.getElementById('signup-step-1').style.display = n === 1 ? 'block' : 'none';
    document.getElementById('signup-step-2').style.display = n === 2 ? 'block' : 'none';

    var fill = document.getElementById('signup-progress-fill');
    var text = document.getElementById('signup-progress-text');
    if (fill) fill.style.width = (n === 1 ? '50%' : '100%');
    if (text) text.textContent = 'Step ' + n + ' of 2';
  }

  function submitEmail(email) {
    var params = new URLSearchParams();
    params.append('email', email);

    return fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: params,
    });
  }

  function init() {
    var input = document.getElementById('email-input');
    var btn = document.getElementById('btn-submit-email');
    var errEl = document.getElementById('email-submit-error');
    if (!input || !btn) return;

    input.addEventListener('input', function () {
      btn.disabled = !isValidEmail(input.value.trim());
      if (errEl) errEl.style.display = 'none';
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !btn.disabled) btn.click();
    });

    btn.addEventListener('click', function () {
      var email = input.value.trim();
      if (!isValidEmail(email)) return;

      btn.disabled = true;
      btn.textContent = 'Setting up your account...';
      if (errEl) errEl.style.display = 'none';

      submitEmail(email)
        .then(function () {
          showStep(2);
        })
        .catch(function (err) {
          console.error('Email submission failed:', err);
          btn.disabled = false;
          btn.textContent = 'Continue \u2192';
          if (errEl) {
            errEl.textContent = 'Something went wrong. Please try again.';
            errEl.style.display = 'block';
          }
        });
    });

    showStep(1);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
