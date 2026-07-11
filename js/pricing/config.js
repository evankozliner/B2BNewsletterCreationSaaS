/* Potions Pricing Calculator — Configuration
 *
 * How to update:
 *  - Add/edit listSizeTiers to change pricing by subscriber count
 *  - Set addon.enabled = false to globally hide an add-on
 *  - Fill in stripePriceIds after creating Stripe Products + Prices
 *  - Update checkout.apiEndpoint when the Rails endpoint is deployed
 *  - Update webhooks.emailCapture with the Zapier/API endpoint for drip sequence
 */

const PRICING_CONFIG = {

  // ──────────────────────────────────────────────
  // List size tiers — drives core newsletter price
  // ──────────────────────────────────────────────
  listSizeTiers: [
    {
      id: 'starter',
      label: 'Under 5,000 subscribers',
      // Per-month rates (customer sees these); actual billed amount = rate × period multiplier
      rates: { monthly: 299, quarterly: 199, annual: 169 },
    },
    // Add more tiers as needed, e.g.:
    // { id: '5k-10k', label: '5,000 – 10,000 subscribers', rates: { monthly: 395, quarterly: 345, annual: 242 } },
  ],

  // ──────────────────────────────────────────────
  // Add-ons
  // ──────────────────────────────────────────────
  addons: [
    {
      id: 'linkedin',
      name: 'LinkedIn Add-on',
      billingType: 'recurring', // billed at same interval as core
      originalPricePerMonth: 99,  // shown crossed out
      salePricePerMonth: 49,      // active price
      saleLabel: '7-day sign-on deal',
      description: [
        'LinkedIn content repurposed directly from your newsletter each week',
        'Consistent posting schedule to build your professional presence',
        'Strategic formatting optimized for LinkedIn reach and engagement',
      ],
      enabled: true,
    },
    {
      id: 'welcome-sequence',
      name: 'Done-for-You Welcome Sequence',
      billingType: 'one_time',
      flatPrice: 249,
      priceLabel: '$249',
      description: [
        'A professionally written 3-email welcome sequence for new subscribers',
        'Sets the right expectations and builds trust from day one',
        'Delivered within your first 30 days',
      ],
      enabled: true,
    },
    {
      id: 'content-interviews',
      name: 'Content Interviews',
      billingType: 'recurring', // billed at same interval as core
      pricePerMonth: 199,
      description: [
        'Monthly recorded interview to extract your expertise and voice',
        'We turn your insights into ready-to-publish newsletter content',
        'Keeps your newsletter authentic without extra writing effort on your end',
      ],
      enabled: true,
    },
    {
      id: 'performance',
      name: 'Performance Marketing Pilot',
      billingType: 'one_time',
      flatPrice: 3000,
      priceLabel: 'Starting at $3,000',
      description: [
        'Targeted paid campaigns designed to grow your subscriber list',
        'We handle creative, targeting, and ongoing optimization',
        'Minimum 30-day pilot with full performance reporting',
      ],
      enabled: true,
    },
  ],

  // ──────────────────────────────────────────────
  // Stripe Payment Links
  // Recurring links keyed by billing period + addon combo.
  // Key format: 'core' | 'core+linkedin' | 'core+content-interviews' | 'core+linkedin+content-interviews'
  // One-time links: fill in when Stripe payment links are created for those add-ons.
  // ──────────────────────────────────────────────
  paymentLinks: {
    recurring: {
      monthly: {
        'core':                             'https://buy.stripe.com/dRmfZi7YT02EgsmeBGcEw1C',
        'core+linkedin':                    'https://buy.stripe.com/7sY4gAgvpg1C2BwbpucEw1D',
        'core+content-interviews':          'https://buy.stripe.com/4gM3cwbb53eQ0to79ecEw1E',
        'core+linkedin+content-interviews': 'https://buy.stripe.com/14A14ocf9bLm7VQdxCcEw1F',
      },
      quarterly: {
        'core':                             'https://buy.stripe.com/00w4gA3ID5mY2Bw0KQcEw1n',
        'core+linkedin':                    'https://buy.stripe.com/14AeVebb5bLm3FAalqcEw1z',
        'core+content-interviews':          'https://buy.stripe.com/fZu28s2Ez7v65NI79ecEw1B',
        'core+linkedin+content-interviews': 'https://buy.stripe.com/cNieVea71dTua3Y3X2cEw1A',
      },
      annual: {
        'core':                             'https://buy.stripe.com/aFaeVe7YT5mYeke9hmcEw1G',
        'core+linkedin':                    'https://buy.stripe.com/aFafZi4MH5mY4JEalqcEw1H',
        'core+content-interviews':          'https://buy.stripe.com/eVq5kE2EzeXy4JE65acEw1I',
        'core+linkedin+content-interviews': 'https://buy.stripe.com/3cI6oI0wr16Ifoi8dicEw1J',
      },
    },
    // One-time add-on links — fill these in once created in Stripe.
    // Set each link's Stripe "Confirmation page" redirect to checkout.onetimeDoneUrl below.
    oneTime: {
      'welcome-sequence': 'PLACEHOLDER_welcome_sequence_payment_link',
      'performance':      'PLACEHOLDER_performance_payment_link',
    },
  },

  // ──────────────────────────────────────────────
  // Post-payment redirect URLs
  // Configure these as the "Confirmation page" URL in each Stripe Payment Link.
  // ──────────────────────────────────────────────
  checkout: {
    successUrl:     'https://withpotions.com/pricing-calculator.html?step=3&success=true',
    onetimeDoneUrl: 'https://withpotions.com/pricing-calculator.html?step=3&onetime_done=true&success=true',
    cancelUrl:      'https://withpotions.com/pricing-calculator.html?step=2',
  },

  // ──────────────────────────────────────────────
  // Webhooks — POST after email capture
  // Swap for your Rails API endpoint when ready.
  // ──────────────────────────────────────────────
  webhooks: {
    emailCapture: 'https://hooks.zapier.com/hooks/catch/PLACEHOLDER',
  },
};
