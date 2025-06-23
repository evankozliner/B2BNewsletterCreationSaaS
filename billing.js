const yearlyBtn = document.getElementById('yearlyBtn');
const monthlyBtn = document.getElementById('monthlyBtn');
const subscriberCount = document.getElementById('subscriber-count');
const growthPrice = document.getElementById('growth-price');
const starterPrice = document.getElementById('starter-price');

// Define pricing map
const pricingMap = {
  monthly: {
    149: 149,
    190: 180,
    330: 220,
    1000: 500
  },
  annual: {
    149: 119,
    190: 144,
    330: 176,
    1000: 400
  }
};

const starterPricing = {
  monthly: 120,
  annual: 100
};

let billingType = 'annual'; // default

function updatePrices() {
  const subValue = subscriberCount.value;
  const gPrice = pricingMap[billingType][subValue];
  const sPrice = starterPricing[billingType];

  growthPrice.textContent = `$${gPrice}/mo` + (billingType === 'annual' ? '' : '');
  starterPrice.textContent = `$${sPrice}/mo` + (billingType === 'annual' ? '' : '');
}

// Toggle logic
yearlyBtn.addEventListener('click', () => {
  billingType = 'annual';
  yearlyBtn.classList.add('active');
  monthlyBtn.classList.remove('active');
  updatePrices();
});

monthlyBtn.addEventListener('click', () => {
  billingType = 'monthly';
  monthlyBtn.classList.add('active');
  yearlyBtn.classList.remove('active');
  updatePrices();
});

// Subscriber selector change
subscriberCount.addEventListener('change', updatePrices);

// Initial load
updatePrices();