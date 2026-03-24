const annualBtn = document.getElementById('annualBtn');
const quarterlyBtn = document.getElementById('quarterlyBtn');
const monthlyBtn = document.getElementById('monthlyBtn');
const subscriberCount = document.getElementById('subscriber-count');
const growthPrice = document.getElementById('growth-price');
const starterPrice = document.getElementById('starter-price');

// Define pricing map
const pricingMap = {
  monthly: {
    149: 395,
    190: 445,
    330: 496,
    1000: 641
  },
  quarterly: {
    149: 345,
    190: 395,
    330: 446,
    1000: 591
  },
  annual: {
    149: 242,
    190: 277,
    330: 312,
    1000: 414
  }
};

const starterPricing = {
  monthly: 299,
  quarterly: 199,
  annual: 169
};

let billingType = 'annual'; // default

function updatePrices() {
  const subValue = subscriberCount.value;
  const gPrice = pricingMap[billingType][subValue];
  const sPrice = starterPricing[billingType];

  growthPrice.textContent = `$${gPrice}/mo`;
  starterPrice.textContent = `$${sPrice}/mo`;
}

const toggleBtns = [annualBtn, quarterlyBtn, monthlyBtn];

function setActiveToggle(activeBtn, type) {
  billingType = type;
  toggleBtns.forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
  updatePrices();
}

annualBtn.addEventListener('click', () => setActiveToggle(annualBtn, 'annual'));
quarterlyBtn.addEventListener('click', () => setActiveToggle(quarterlyBtn, 'quarterly'));
monthlyBtn.addEventListener('click', () => setActiveToggle(monthlyBtn, 'monthly'));

// Subscriber selector change
subscriberCount.addEventListener('change', updatePrices);

// Initial load
updatePrices();
