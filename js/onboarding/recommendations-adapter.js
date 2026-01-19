/**
 * Recommendations Adapter
 * Provides API interface with mock and fetch implementations
 *
 * Toggle between mock and real API by changing USE_MOCK_ADAPTER
 */

// ==================== CONFIG ====================
const USE_MOCK_ADAPTER = false; // Set to false to use real API endpoints

// API Endpoints (configure these for production)
const API_ENDPOINTS = {
  topics: '/api/recommendations/topics',
  sections: '/api/recommendations/sections',
  submit: 'https://hooks.zapier.com/hooks/catch/23601498/uqbb5v6/'
};

// ==================== MOCK DATA ====================

const MOCK_TOPICS = [
  {
    id: 'ai-automation',
    label: 'AI & Automation',
    reason: 'Highly relevant for B2B SaaS audience interested in productivity'
  },
  {
    id: 'product-strategy',
    label: 'Product Strategy',
    reason: 'Helps establish thought leadership in your space'
  },
  {
    id: 'customer-success',
    label: 'Customer Success',
    reason: 'Demonstrates commitment to customer outcomes'
  },
  {
    id: 'data-analytics',
    label: 'Data & Analytics',
    reason: 'Appeals to data-driven decision makers'
  },
  {
    id: 'team-collaboration',
    label: 'Team Collaboration',
    reason: 'Resonates with your target audience'
  },
  {
    id: 'growth-marketing',
    label: 'Growth Marketing',
    reason: 'Relevant for businesses scaling their operations'
  }
];

const CANONICAL_SECTIONS = [
  {
    key: 'repurposed-content',
    title: 'Repurposed Content',
    description: 'Repurpose content from somewhere else online (your existing content, social posts, podcasts, etc.)'
  },
  {
    key: 'original-content',
    title: 'Original Content',
    description: 'Fresh original writing from you/your team'
  },
  {
    key: 'news',
    title: 'News',
    description: 'Relevant industry news highlights'
  },
  {
    key: 'events',
    title: 'Events',
    description: 'Upcoming events, webinars, meetups, conferences'
  },
  {
    key: 'survey',
    title: 'Survey',
    description: 'A quick reader question/poll to learn preferences'
  },
  {
    key: 'curate-and-comment',
    title: 'Curate and Comment',
    description: 'Curated links + your commentary/takeaways'
  },
  {
    key: 'tools',
    title: 'Tools',
    description: 'Highlight tools/resources your audience would value'
  },
  {
    key: 'case-studies',
    title: 'Case Studies / Testimonials',
    description: 'Proof, examples, customer stories'
  },
  {
    key: 'guest-post',
    title: 'Guest Post',
    description: 'Contributions from partners/experts'
  }
];

const MOCK_RECOMMENDED_SECTIONS = [
  {
    key: 'original-content',
    title: 'Original Content',
    description: 'Fresh original writing from you/your team',
    strategyFit: 'Establishes you as a thought leader and builds trust by showcasing your unique perspective and expertise.'
  },
  {
    key: 'case-studies',
    title: 'Case Studies / Testimonials',
    description: 'Proof, examples, customer stories',
    strategyFit: 'Provides social proof and demonstrates real results, making it easier to move prospects toward a sales conversation.'
  },
  {
    key: 'curate-and-comment',
    title: 'Curate and Comment',
    description: 'Curated links + your commentary/takeaways',
    strategyFit: 'Shows you stay current with industry trends while adding your expert analysis, positioning you as a trusted advisor.'
  }
];

// ==================== MOCK ADAPTER ====================

class MockAdapter {
  /**
   * Simulate API delay
   */
  async simulateDelay(ms = 1500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get topic recommendations
   */
  async getTopicRecommendations({ icp, goal }) {
    console.log('MockAdapter: Getting topic recommendations', { icp, goal });

    await this.simulateDelay(1500);

    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Failed to load recommendations. Please try again.');
    }

    return {
      topics: MOCK_TOPICS
    };
  }

  /**
   * Get section recommendations
   */
  async getSectionRecommendations({ icp, goal, topics }) {
    console.log('MockAdapter: Getting section recommendations', { icp, goal, topics });

    await this.simulateDelay(1800);

    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Failed to load section recommendations. Please try again.');
    }

    return {
      recommended: MOCK_RECOMMENDED_SECTIONS,
      all: CANONICAL_SECTIONS
    };
  }

  /**
   * Submit onboarding data
   */
  async submitOnboarding(payload) {
    console.log('MockAdapter: Submitting onboarding', payload);

    await this.simulateDelay(1000);

    // Simulate occasional errors (3% chance)
    if (Math.random() < 0.03) {
      throw new Error('Failed to submit. Please try again.');
    }

    return {
      ok: true,
      message: 'Onboarding submitted successfully'
    };
  }
}

// ==================== FETCH ADAPTER ====================

class FetchAdapter {
  /**
   * Make API request
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Get topic recommendations
   */
  async getTopicRecommendations({ icp, goal }) {
    console.log('FetchAdapter: Getting topic recommendations', { icp, goal });

    return await this.makeRequest(API_ENDPOINTS.topics, {
      method: 'POST',
      body: JSON.stringify({ icp, goal })
    });
  }

  /**
   * Get section recommendations
   */
  async getSectionRecommendations({ icp, goal, topics }) {
    console.log('FetchAdapter: Getting section recommendations', { icp, goal, topics });

    return await this.makeRequest(API_ENDPOINTS.sections, {
      method: 'POST',
      body: JSON.stringify({ icp, goal, topics })
    });
  }

  /**
   * Submit onboarding data to Zapier webhook
   */
  async submitOnboarding(payload) {
    console.log('FetchAdapter: Submitting onboarding to Zapier', payload);

    try {
      const response = await fetch(API_ENDPOINTS.submit, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Zapier webhooks typically return status 200 on success
      if (response.ok) {
        return {
          ok: true,
          message: 'Onboarding submitted successfully'
        };
      } else {
        throw new Error(`Zapier webhook error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to submit to Zapier:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }
}

// ==================== ADAPTER FACTORY ====================

class RecommendationsAdapter {
  constructor() {
    if (USE_MOCK_ADAPTER) {
      console.log('Using MockAdapter for API calls');
      this.adapter = new MockAdapter();
    } else {
      console.log('Using FetchAdapter for API calls');
      this.adapter = new FetchAdapter();
    }
  }

  /**
   * Get topic recommendations based on ICP and goal
   *
   * @param {Object} params
   * @param {string} params.icp - Ideal customer profile description
   * @param {string} params.goal - Newsletter goal description
   * @returns {Promise<Object>} Response with topics array
   *
   * Expected response shape:
   * {
   *   topics: [
   *     { id: string, label: string, reason?: string }
   *   ]
   * }
   */
  async getTopicRecommendations({ icp, goal }) {
    return await this.adapter.getTopicRecommendations({ icp, goal });
  }

  /**
   * Get section recommendations based on ICP, goal, and selected topics
   *
   * @param {Object} params
   * @param {string} params.icp - Ideal customer profile description
   * @param {string} params.goal - Newsletter goal description
   * @param {Array<string>} params.topics - Selected topic labels
   * @returns {Promise<Object>} Response with recommended and all sections
   *
   * Expected response shape:
   * {
   *   recommended: [
   *     { key: string, title: string, description: string, strategyFit: string }
   *   ],
   *   all: [
   *     { key: string, title: string, description: string }
   *   ]
   * }
   */
  async getSectionRecommendations({ icp, goal, topics }) {
    return await this.adapter.getSectionRecommendations({ icp, goal, topics });
  }

  /**
   * Submit complete onboarding data
   *
   * @param {Object} payload - Complete onboarding data
   * @param {string} payload.email
   * @param {string} payload.icp
   * @param {string} payload.goal
   * @param {Array<string>} payload.topics
   * @param {Object} payload.contentSources - { platform: url } e.g. { linkedin: 'https://...', twitter: 'https://...' }
   * @param {string} payload.designDirection - "editorial" | "playful" | "minimal"
   * @param {Array<string>} payload.acquisitionChannels
   * @param {string} [payload.acquisitionNotes]
   * @returns {Promise<Object>} Response with ok status
   *
   * Expected response shape:
   * {
   *   ok: boolean,
   *   message?: string
   * }
   */
  async submitOnboarding(payload) {
    return await this.adapter.submitOnboarding(payload);
  }
}

// ==================== EXPORTS ====================

// Export the adapter instance
window.RecommendationsAdapter = RecommendationsAdapter;

// Export configuration for easy access
window.ONBOARDING_CONFIG = {
  USE_MOCK_ADAPTER,
  API_ENDPOINTS
};
