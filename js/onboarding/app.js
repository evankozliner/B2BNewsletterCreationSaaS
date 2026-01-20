/**
 * Onboarding App - Main Orchestrator
 * Coordinates all components and manages the onboarding flow
 */

class OnboardingApp {
  constructor() {
    this.stateManager = new StateManager();
    this.voiceHandler = new VoiceInputHandler();
    this.topicChipsManager = null;
    this.channelChipsManager = null;
    this.apiAdapter = new RecommendationsAdapter();
    this.zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/23601498/uqofiji/';

    this.init();
  }

  /**
   * Send current state to Zapier webhook
   */
  async sendToZapier(stepCompleted) {
    try {
      const state = this.stateManager.getState();

      const payload = {
        timestamp: new Date().toISOString(),
        stepCompleted: stepCompleted,
        email: state.email || '',
        icp: state.icp || '',
        goal: state.goal || '',
        topics: state.topics || [],
        contentSources: state.contentSources || {},
        designDirection: state.designDirection || '',
        acquisitionChannels: state.acquisitionChannels || [],
        acquisitionNotes: state.acquisitionNotes || ''
      };

      console.log('Sending to Zapier:', payload);

      const response = await fetch(this.zapierWebhookUrl, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Successfully sent to Zapier');
      } else {
        console.warn('Zapier webhook returned non-OK status:', response.status);
      }
    } catch (error) {
      console.error('Failed to send to Zapier:', error);
      // Don't block the user flow if webhook fails
    }
  }

  /**
   * Initialize the app
   */
  init() {
    console.log('Initializing onboarding app...');

    // Initialize components
    this.initializeCoverPage();
    this.initializeStep0();
    this.initializeVoiceInputs();
    this.initializeStep1();
    this.initializeStep2();
    this.initializeStep3();
    this.initializeStep4();
    this.initializeStep5();
    this.initializeStep6();
    this.initializeThankYou();

    // Restore state from session
    this.stateManager.restoreInputs();

    // Set up window unload handler
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    console.log('Onboarding app initialized');
  }

  /**
   * Initialize Cover Page
   */
  initializeCoverPage() {
    const startBtn = document.getElementById('btn-start');
    const coverPage = document.getElementById('cover-page');
    const progressBar = document.querySelector('.progress-bar-container');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        // Hide cover page
        if (coverPage) {
          coverPage.style.display = 'none';
        }

        // Show progress bar
        if (progressBar) {
          progressBar.style.display = 'block';
        }

        // Go to step 0
        this.stateManager.goToStep(0);
      });
    }
  }

  /**
   * Initialize Step 0: Email
   */
  initializeStep0() {
    const nextBtn = document.getElementById('step0-next');
    const backBtn = document.getElementById('step0-back');
    const emailInput = document.getElementById('email-input');

    if (!nextBtn || !emailInput) return;

    // Validate and enable/disable next button
    const validateStep0 = () => {
      const value = emailInput.value.trim();
      const isValid = this.stateManager.isValidEmail(value);
      nextBtn.disabled = !isValid;
    };

    emailInput.addEventListener('input', () => {
      this.stateManager.updateField('email', emailInput.value.trim());
      validateStep0();
    });

    // Back button - return to cover page
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Hide current step
        const step0 = document.getElementById('step-0');
        if (step0) {
          step0.style.display = 'none';
        }

        // Hide progress bar
        const progressBar = document.querySelector('.progress-bar-container');
        if (progressBar) {
          progressBar.style.display = 'none';
        }

        // Show cover page
        const coverPage = document.getElementById('cover-page');
        if (coverPage) {
          coverPage.style.display = 'block';
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    nextBtn.addEventListener('click', async () => {
      if (this.stateManager.validateCurrentStep()) {
        await this.sendToZapier('step_0_email');
        this.stateManager.nextStep();
      }
    });

    // Initial validation
    validateStep0();
  }

  /**
   * Initialize voice inputs for steps 1 and 2
   */
  initializeVoiceInputs() {
    // Step 1: ICP
    const icpMic = document.getElementById('icp-mic');
    const icpTextarea = document.getElementById('icp-input');
    const icpStatus = document.getElementById('icp-status');

    if (icpMic && icpTextarea && icpStatus) {
      this.voiceHandler.initialize(icpMic, icpTextarea, icpStatus);
    }

    // Step 2: Goal
    const goalMic = document.getElementById('goal-mic');
    const goalTextarea = document.getElementById('goal-input');
    const goalStatus = document.getElementById('goal-status');

    if (goalMic && goalTextarea && goalStatus) {
      const goalVoiceHandler = new VoiceInputHandler();
      goalVoiceHandler.initialize(goalMic, goalTextarea, goalStatus);
    }
  }

  /**
   * Initialize Step 1: ICP
   */
  initializeStep1() {
    const nextBtn = document.getElementById('step1-next');
    const textarea = document.getElementById('icp-input');

    if (!nextBtn || !textarea) return;

    // Validate and enable/disable next button
    const validateStep1 = () => {
      const value = textarea.value.trim();
      nextBtn.disabled = value.length === 0;
    };

    textarea.addEventListener('input', () => {
      this.stateManager.updateField('icp', textarea.value);
      validateStep1();
    });

    nextBtn.addEventListener('click', async () => {
      if (this.stateManager.validateCurrentStep()) {
        await this.sendToZapier('step_1_icp');
        this.stateManager.nextStep();
      }
    });

    // Initial validation
    validateStep1();
  }

  /**
   * Initialize Step 2: Goal
   */
  initializeStep2() {
    const backBtn = document.getElementById('step2-back');
    const nextBtn = document.getElementById('step2-next');
    const textarea = document.getElementById('goal-input');

    if (!nextBtn || !textarea) return;

    // Validate and enable/disable next button
    const validateStep2 = () => {
      const value = textarea.value.trim();
      nextBtn.disabled = value.length === 0;
    };

    textarea.addEventListener('input', () => {
      this.stateManager.updateField('goal', textarea.value);
      validateStep2();
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.stateManager.previousStep();
      });
    }

    nextBtn.addEventListener('click', async () => {
      if (this.stateManager.validateCurrentStep()) {
        await this.sendToZapier('step_2_goal');
        this.stateManager.nextStep();
      }
    });

    // Initial validation
    validateStep2();
  }

  /**
   * Initialize Step 3: Topics
   */
  initializeStep3() {
    const backBtn = document.getElementById('step3-back');
    const nextBtn = document.getElementById('step3-next');
    const addTopicBtn = document.getElementById('add-topic-btn');
    const customTopicInput = document.getElementById('custom-topic-input');

    // Initialize topic chips manager
    this.topicChipsManager = new TopicChipsManager('#topic-cloud', 3);

    // Set common topics (no API call needed)
    const commonTopics = [
      // Agency owners
      { id: 'marketing-strategies', label: 'Marketing Strategies' },
      { id: 'client-acquisition', label: 'Client Acquisition' },
      { id: 'agency-growth', label: 'Agency Growth' },
      { id: 'real-estate-trends', label: 'Real Estate Trends' },
      { id: 'property-marketing', label: 'Property Marketing' },

      // Tech startups
      { id: 'product-updates', label: 'Product Updates' },
      { id: 'community-updates', label: 'Community Updates' },
      { id: 'startup-growth', label: 'Startup Growth' },
      { id: 'tech-trends', label: 'Tech Trends' },

      // Political/General
      { id: 'political-news', label: 'Political News' },
      { id: 'industry-news', label: 'Industry News' },
      { id: 'thought-leadership', label: 'Thought Leadership' }
    ];

    this.topicChipsManager.setSuggestedTopics(commonTopics);

    // Restore selected topics if any
    const savedTopics = this.stateManager.getField('topics');
    if (savedTopics && savedTopics.length > 0) {
      this.topicChipsManager.setSelectedTopics(savedTopics);
    }

    // Listen for topic selection changes
    document.addEventListener('topicsChanged', (e) => {
      // Only handle if we're on Step 3
      if (this.stateManager.currentStep === 3) {
        const topics = e.detail.topics;
        this.stateManager.updateField('topics', topics);

        if (nextBtn) {
          nextBtn.disabled = topics.length === 0;
        }
      }
    });

    // Add custom topic
    if (addTopicBtn && customTopicInput) {
      const addCustomTopic = () => {
        const value = customTopicInput.value.trim();
        if (value) {
          const result = this.topicChipsManager.addCustomTopic(value);
          if (result.success) {
            customTopicInput.value = '';
          } else {
            alert(result.error);
          }
        }
      };

      addTopicBtn.addEventListener('click', addCustomTopic);

      customTopicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomTopic();
        }
      });

      // Enable/disable add button based on input
      customTopicInput.addEventListener('input', () => {
        addTopicBtn.disabled = customTopicInput.value.trim().length === 0;
      });
    }

    // Navigation
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.stateManager.previousStep();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        if (this.stateManager.validateCurrentStep()) {
          await this.sendToZapier('step_3_topics');
          this.stateManager.nextStep();
        }
      });
    }
  }

  /**
   * Initialize Step 4: Content Sources
   */
  initializeStep4() {
    const backBtn = document.getElementById('step4-back');
    const nextBtn = document.getElementById('step4-next');
    const checkboxes = document.querySelectorAll('input[name="content-source"]');
    const urlInputs = document.querySelectorAll('.source-url-input');
    const noneCheckbox = document.querySelector('input[name="content-source"][value="none"]');

    // Update button state based on selections
    const updateButtonState = () => {
      const hasSelection = Array.from(checkboxes).some(cb => cb.checked);
      if (nextBtn) {
        nextBtn.disabled = !hasSelection;
      }
    };

    // Handle checkbox changes - enable/disable URL input
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const source = checkbox.value;
        const urlInput = document.querySelector(`.source-url-input[data-source="${source}"]`);

        // If "none" is selected, uncheck all others
        if (source === 'none' && checkbox.checked) {
          checkboxes.forEach(cb => {
            if (cb.value !== 'none') {
              cb.checked = false;
              const otherUrlInput = document.querySelector(`.source-url-input[data-source="${cb.value}"]`);
              if (otherUrlInput) {
                otherUrlInput.disabled = true;
                otherUrlInput.value = '';
              }
            }
          });
        }
        // If any other checkbox is selected, uncheck "none"
        else if (source !== 'none' && checkbox.checked) {
          if (noneCheckbox) {
            noneCheckbox.checked = false;
          }
        }

        if (urlInput) {
          urlInput.disabled = !checkbox.checked;

          if (!checkbox.checked) {
            urlInput.value = '';
          }
        }

        this.updateContentSources();
        updateButtonState();
      });
    });

    // Handle URL input changes
    urlInputs.forEach(input => {
      input.addEventListener('input', () => {
        this.updateContentSources();
      });
    });

    // Restore saved content sources
    const savedSources = this.stateManager.getField('contentSources');
    if (savedSources && Object.keys(savedSources).length > 0) {
      Object.keys(savedSources).forEach(source => {
        const checkbox = document.querySelector(`input[name="content-source"][value="${source}"]`);

        if (source === 'none') {
          // Special handling for "none" - just check it
          if (checkbox) {
            checkbox.checked = true;
          }
        } else {
          const urlInput = document.querySelector(`.source-url-input[data-source="${source}"]`);
          if (checkbox && urlInput && savedSources[source]) {
            checkbox.checked = true;
            urlInput.disabled = false;
            urlInput.value = savedSources[source];
          }
        }
      });
    }

    // Initial button state
    updateButtonState();

    // Navigation
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.stateManager.previousStep();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        await this.sendToZapier('step_4_content_sources');
        this.stateManager.nextStep();
      });
    }
  }

  /**
   * Update content sources in state
   */
  updateContentSources() {
    const contentSources = {};
    const checkboxes = document.querySelectorAll('input[name="content-source"]:checked');

    checkboxes.forEach(checkbox => {
      const source = checkbox.value;

      // Handle "none" option specially - no URL needed
      if (source === 'none') {
        contentSources[source] = 'true';
      } else {
        const urlInput = document.querySelector(`.source-url-input[data-source="${source}"]`);
        if (urlInput && urlInput.value.trim()) {
          contentSources[source] = urlInput.value.trim();
        }
      }
    });

    this.stateManager.updateField('contentSources', contentSources);
  }

  /**
   * Initialize Step 5: Design Direction
   */
  initializeStep5() {
    const backBtn = document.getElementById('step5-back');
    const nextBtn = document.getElementById('step5-next');
    const designRadios = document.querySelectorAll('input[name="design"]');

    if (!nextBtn) return;

    // Handle design selection
    const handleDesignChange = () => {
      const selected = document.querySelector('input[name="design"]:checked');
      if (selected) {
        this.stateManager.updateField('designDirection', selected.value);
        nextBtn.disabled = false;
      } else {
        nextBtn.disabled = true;
      }
    };

    designRadios.forEach(radio => {
      radio.addEventListener('change', handleDesignChange);
    });

    // Navigation
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.stateManager.previousStep();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        if (this.stateManager.validateCurrentStep()) {
          await this.sendToZapier('step_5_design_direction');
          this.stateManager.nextStep();
        }
      });
    }

    // Initial validation
    handleDesignChange();
  }

  /**
   * Initialize Step 6: Acquisition Channels
   */
  initializeStep6() {
    const backBtn = document.getElementById('step6-back');
    const submitBtn = document.getElementById('step6-submit');
    const addChannelBtn = document.getElementById('add-channel-btn');
    const customChannelInput = document.getElementById('custom-channel-input');
    const notesTextarea = document.getElementById('acquisition-notes');

    // Initialize channel chips manager (no max limit for channels)
    this.channelChipsManager = new TopicChipsManager('#channel-cloud', 999, 'selected-channels-summary');

    // Set common acquisition channels
    const commonChannels = [
      { id: 'meta-ads', label: 'Meta ads' },
      { id: 'google-ads', label: 'Google ads' },
      { id: 'cold-email', label: 'Cold email' },
      { id: 'referrals', label: 'Referrals' },
      { id: 'seo', label: 'SEO' },
      { id: 'content-marketing', label: 'Content marketing' },
      { id: 'linkedin-outreach', label: 'LinkedIn outreach' },
      { id: 'events', label: 'Events' },
      { id: 'partnerships', label: 'Partnerships' },
      { id: 'webinars', label: 'Webinars' },
      { id: 'cold-calling', label: 'Cold calling' },
      { id: 'direct-mail', label: 'Direct mail' }
    ];

    this.channelChipsManager.setSuggestedTopics(commonChannels);

    // Restore selected channels if any and set initial button state
    const savedChannels = this.stateManager.getField('acquisitionChannels');
    if (savedChannels && savedChannels.length > 0) {
      this.channelChipsManager.setSelectedTopics(savedChannels);
    }

    // Initial validation - disable submit if no channels selected
    if (submitBtn) {
      submitBtn.disabled = !savedChannels || savedChannels.length === 0;
    }

    // Listen for channel selection changes
    // Note: TopicChipsManager emits 'topicsChanged' event
    // This will be called for both Step 3 (topics) and Step 6 (channels) changes
    // We only update acquisitionChannels when on Step 6
    const channelChangeHandler = (e) => {
      // Only handle if we're on Step 6
      if (this.stateManager.currentStep === 6) {
        const channels = e.detail.topics;
        this.stateManager.updateField('acquisitionChannels', channels);

        // Enable/disable submit button based on selection
        if (submitBtn) {
          submitBtn.disabled = channels.length === 0;
        }
      }
    };

    document.addEventListener('topicsChanged', channelChangeHandler);

    // Add custom channel
    if (addChannelBtn && customChannelInput) {
      const addCustomChannel = () => {
        const value = customChannelInput.value.trim();
        if (value) {
          const result = this.channelChipsManager.addCustomTopic(value);
          if (result.success) {
            customChannelInput.value = '';
          } else {
            alert(result.error);
          }
        }
      };

      addChannelBtn.addEventListener('click', addCustomChannel);

      customChannelInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomChannel();
        }
      });

      // Enable/disable add button based on input
      customChannelInput.addEventListener('input', () => {
        addChannelBtn.disabled = customChannelInput.value.trim().length === 0;
      });
    }

    // Handle notes
    if (notesTextarea) {
      notesTextarea.addEventListener('input', () => {
        this.stateManager.updateField('acquisitionNotes', notesTextarea.value);
      });
    }

    // Navigation
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.stateManager.previousStep();
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        await this.sendToZapier('step_6_acquisition_channels');
        await this.submitOnboarding();
      });
    }
  }

  /**
   * Load section recommendations from API
   */
  async loadSectionRecommendations() {
    const loadingEl = document.getElementById('sections-loading');
    const errorEl = document.getElementById('sections-error');
    const containerEl = document.getElementById('sections-container');
    const navEl = document.getElementById('step4-nav');
    const retryBtn = document.getElementById('sections-retry');

    // Show loading, hide others
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (containerEl) containerEl.style.display = 'none';
    if (navEl) navEl.style.display = 'none';

    try {
      const state = this.stateManager.getState();
      const response = await this.apiAdapter.getSectionRecommendations({
        icp: state.icp,
        goal: state.goal,
        topics: state.topics
      });

      // Set sections
      if (this.sectionSelectionManager && response) {
        this.sectionSelectionManager.setSections(response);
      }

      // Show container, hide loading
      if (loadingEl) loadingEl.style.display = 'none';
      if (containerEl) containerEl.style.display = 'block';
      if (navEl) navEl.style.display = 'flex';

    } catch (error) {
      console.error('Failed to load section recommendations:', error);

      // Show error
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'block';
        const errorMsg = errorEl.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.textContent = error.message || 'Failed to load section recommendations. Please try again.';
        }
      }

      // Set up retry
      if (retryBtn) {
        retryBtn.onclick = () => this.loadSectionRecommendations();
      }
    }
  }

  /**
   * Submit onboarding data
   */
  async submitOnboarding() {
    const submitBtn = document.getElementById('step6-submit');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      const payload = this.stateManager.getState();
      const response = await this.apiAdapter.submitOnboarding(payload);

      if (response.ok) {
        // Show thank you page
        this.stateManager.showThankYou();
        this.renderThankYouSummary(payload);

        // Clear state after successful submission
        // this.stateManager.clearState();
      } else {
        throw new Error('Submission failed');
      }

    } catch (error) {
      console.error('Failed to submit onboarding:', error);

      alert('Failed to submit. Please try again.');

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    }
  }

  /**
   * Render thank you summary
   */
  renderThankYouSummary(data) {
    const summaryGrid = document.getElementById('summary-grid');
    if (!summaryGrid) return;

    summaryGrid.innerHTML = '';

    // Email
    this.addSummaryItem(summaryGrid, 'Email', data.email);

    // ICP
    this.addSummaryItem(summaryGrid, 'Ideal Customer Profile', data.icp);

    // Goal
    this.addSummaryItem(summaryGrid, 'Newsletter Goal', data.goal);

    // Topics
    if (data.topics && data.topics.length > 0) {
      this.addSummaryList(summaryGrid, 'Selected Topics', data.topics);
    }

    // Content Sources
    if (data.contentSources && Object.keys(data.contentSources).length > 0) {
      const sourcesList = Object.entries(data.contentSources).map(([platform, url]) => {
        const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
        return `${platformLabel}: ${url}`;
      });
      this.addSummaryList(summaryGrid, 'Content Sources', sourcesList);
    }

    // Design Direction
    if (data.designDirection) {
      const designLabel = data.designDirection.charAt(0).toUpperCase() + data.designDirection.slice(1);
      this.addSummaryItem(summaryGrid, 'Design Direction', designLabel);
    }

    // Acquisition Channels
    if (data.acquisitionChannels && data.acquisitionChannels.length > 0) {
      const channelLabels = data.acquisitionChannels.map(ch =>
        ch.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      );
      this.addSummaryList(summaryGrid, 'Lead Generation Channels', channelLabels);
    }

    // Notes
    if (data.acquisitionNotes && data.acquisitionNotes.trim().length > 0) {
      this.addSummaryItem(summaryGrid, 'Additional Notes', data.acquisitionNotes);
    }
  }

  /**
   * Add summary item (text)
   */
  addSummaryItem(container, label, value) {
    const item = document.createElement('div');
    item.className = 'summary-item';

    const title = document.createElement('h3');
    title.textContent = label;
    item.appendChild(title);

    const text = document.createElement('p');
    text.textContent = value;
    item.appendChild(text);

    container.appendChild(item);
  }

  /**
   * Add summary item (list)
   */
  addSummaryList(container, label, items) {
    const item = document.createElement('div');
    item.className = 'summary-item';

    const title = document.createElement('h3');
    title.textContent = label;
    item.appendChild(title);

    const list = document.createElement('ul');
    items.forEach(itemText => {
      const li = document.createElement('li');
      li.textContent = itemText;
      list.appendChild(li);
    });
    item.appendChild(list);

    container.appendChild(item);
  }

  /**
   * Initialize Thank You page
   */
  initializeThankYou() {
    const startOverBtn = document.getElementById('btn-start-over');

    if (startOverBtn) {
      startOverBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start over? This will clear all your responses.')) {
          this.startOver();
        }
      });
    }
  }

  /**
   * Start over - clear state and go back to cover page
   */
  startOver() {
    // Clear all state
    this.stateManager.clearState();

    // Reset managers
    if (this.topicChipsManager) {
      this.topicChipsManager.clearSelections();
    }
    if (this.channelChipsManager) {
      this.channelChipsManager.clearSelections();
    }

    // Clear all form inputs
    const emailInput = document.getElementById('email-input');
    const icpInput = document.getElementById('icp-input');
    const goalInput = document.getElementById('goal-input');
    const notesInput = document.getElementById('acquisition-notes');

    if (emailInput) emailInput.value = '';
    if (icpInput) icpInput.value = '';
    if (goalInput) goalInput.value = '';
    if (notesInput) notesInput.value = '';

    // Clear content sources
    const sourceCheckboxes = document.querySelectorAll('input[name="content-source"]');
    const sourceInputs = document.querySelectorAll('.source-url-input');

    sourceCheckboxes.forEach(cb => cb.checked = false);
    sourceInputs.forEach(input => {
      input.value = '';
      input.disabled = true;
    });

    // Clear design selection
    const designRadios = document.querySelectorAll('input[name="design"]');
    designRadios.forEach(radio => radio.checked = false);

    // Hide all steps and thank you page
    const allSteps = document.querySelectorAll('.onboarding-step');
    allSteps.forEach(step => {
      step.style.display = 'none';
    });

    // Show cover page
    const coverPage = document.getElementById('cover-page');
    if (coverPage) {
      coverPage.style.display = 'block';
    }

    // Hide progress bar
    const progressBarContainer = document.querySelector('.progress-bar-container');
    if (progressBarContainer) {
      progressBarContainer.style.display = 'none';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Cleanup on app close
   */
  cleanup() {
    if (this.voiceHandler) {
      this.voiceHandler.cleanup();
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.onboardingApp = new OnboardingApp();
  });
} else {
  window.onboardingApp = new OnboardingApp();
}
