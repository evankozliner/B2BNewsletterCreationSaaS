/**
 * Onboarding App - Main Orchestrator
 * Coordinates all components and manages the onboarding flow
 */

class OnboardingApp {
  constructor() {
    this.stateManager = new StateManager();
    this.voiceHandler = new VoiceInputHandler();
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
        emailListSize: state.emailListSize || '',
        goal: state.goal || '',
        problemsSolved: state.problemsSolved || '',
        contentSources: state.contentSources || {},
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
    this.initializeVoiceInputs();
    this.initializeStep1();
    this.initializeStep2();
    this.initializeStep3();
    this.initializeStep4();
    this.initializeStep5();
    this.initializeStep6();
    this.initializeThankYou();

    // Check for URL parameters and pre-fill email if provided
    this.checkUrlParameters();

    // Restore state from session
    this.stateManager.restoreInputs();

    // Set up window unload handler
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    console.log('Onboarding app initialized');
  }

  /**
   * Check URL parameters and validate email
   */
  checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');

    if (emailParam && this.stateManager.isValidEmail(emailParam)) {
      console.log('Valid email parameter found:', emailParam);
      // Store email in state
      this.stateManager.updateField('email', emailParam);
    } else {
      // Missing or invalid email parameter
      console.error('Missing or invalid email parameter in URL');

      // Disable the Get Started button and show an error
      const startBtn = document.getElementById('btn-start');
      const coverPage = document.getElementById('cover-page');

      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Invalid or Missing Email';
      }

      // Show error message on cover page
      if (coverPage) {
        const errorMsg = document.createElement('p');
        errorMsg.style.color = '#ff4444';
        errorMsg.style.marginTop = '20px';
        errorMsg.style.textAlign = 'center';
        errorMsg.textContent = 'Error: This page requires a valid email parameter in the URL (e.g., ?email=you@example.com)';

        const coverContent = coverPage.querySelector('.step-content');
        if (coverContent) {
          coverContent.appendChild(errorMsg);
        }
      }
    }
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

        // Go to step 1
        this.stateManager.goToStep(1);
      });
    }
  }

  /**
   * Initialize voice inputs for steps 1, 3, and 4
   */
  initializeVoiceInputs() {
    // Step 1: ICP
    const icpMic = document.getElementById('icp-mic');
    const icpTextarea = document.getElementById('icp-input');
    const icpStatus = document.getElementById('icp-status');

    if (icpMic && icpTextarea && icpStatus) {
      this.voiceHandler.initialize(icpMic, icpTextarea, icpStatus);
    }

    // Step 3: Problems Solved
    const problemsMic = document.getElementById('problems-mic');
    const problemsTextarea = document.getElementById('problems-input');
    const problemsStatus = document.getElementById('problems-status');

    if (problemsMic && problemsTextarea && problemsStatus) {
      const problemsVoiceHandler = new VoiceInputHandler();
      problemsVoiceHandler.initialize(problemsMic, problemsTextarea, problemsStatus);
    }

    // Step 4: Goal
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
   * Initialize Step 2: Email List Size
   */
  initializeStep2() {
    const backBtn = document.getElementById('step2-back');
    const nextBtn = document.getElementById('step2-next');
    const radios = document.querySelectorAll('input[name="email-list-size"]');

    if (!nextBtn) return;

    // Handle radio selection
    const handleSelectionChange = () => {
      const selected = document.querySelector('input[name="email-list-size"]:checked');
      if (selected) {
        this.stateManager.updateField('emailListSize', selected.value);
        nextBtn.disabled = false;
      } else {
        nextBtn.disabled = true;
      }
    };

    radios.forEach(radio => {
      radio.addEventListener('change', handleSelectionChange);
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
          await this.sendToZapier('step_2_email_list_size');
          this.stateManager.nextStep();
        }
      });
    }

    // Initial validation
    handleSelectionChange();
  }

  /**
   * Initialize Step 3: Problems Solved
   */
  initializeStep3() {
    const backBtn = document.getElementById('step3-back');
    const nextBtn = document.getElementById('step3-next');
    const textarea = document.getElementById('problems-input');

    if (!nextBtn || !textarea) return;

    // Validate and enable/disable next button
    const validateStep3 = () => {
      const value = textarea.value.trim();
      nextBtn.disabled = value.length === 0;
    };

    textarea.addEventListener('input', () => {
      this.stateManager.updateField('problemsSolved', textarea.value);
      validateStep3();
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.stateManager.previousStep();
      });
    }

    nextBtn.addEventListener('click', async () => {
      if (this.stateManager.validateCurrentStep()) {
        await this.sendToZapier('step_3_problems_solved');
        this.stateManager.nextStep();
      }
    });

    // Initial validation
    validateStep3();
  }

  /**
   * Initialize Step 4: Newsletter Goal
   */
  initializeStep4() {
    const backBtn = document.getElementById('step4-back');
    const nextBtn = document.getElementById('step4-next');
    const textarea = document.getElementById('goal-input');

    if (!nextBtn || !textarea) return;

    // Validate and enable/disable next button
    const validateStep4 = () => {
      const value = textarea.value.trim();
      nextBtn.disabled = value.length === 0;
    };

    textarea.addEventListener('input', () => {
      this.stateManager.updateField('goal', textarea.value);
      validateStep4();
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.stateManager.previousStep();
      });
    }

    nextBtn.addEventListener('click', async () => {
      if (this.stateManager.validateCurrentStep()) {
        await this.sendToZapier('step_4_goal');
        this.stateManager.nextStep();
      }
    });

    // Initial validation
    validateStep4();
  }

  /**
   * Initialize Step 5: Content Sources
   */
  initializeStep5() {
    const backBtn = document.getElementById('step5-back');
    const nextBtn = document.getElementById('step5-next');
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

    // Handle checkbox changes
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const source = checkbox.value;

        // If "none" is selected, uncheck all others
        if (source === 'none' && checkbox.checked) {
          checkboxes.forEach(cb => {
            if (cb.value !== 'none') {
              cb.checked = false;
              // Clear "other" input if it exists
              if (cb.value === 'other') {
                const otherInput = document.querySelector('.source-url-input[data-source="other"]');
                if (otherInput) {
                  otherInput.disabled = true;
                  otherInput.value = '';
                }
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

        // Enable/disable "other" text input
        if (source === 'other') {
          const otherInput = document.querySelector('.source-url-input[data-source="other"]');
          if (otherInput) {
            otherInput.disabled = !checkbox.checked;
            if (!checkbox.checked) {
              otherInput.value = '';
            }
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

        if (checkbox) {
          checkbox.checked = true;

          // Handle "other" with text input
          if (source === 'other' && savedSources[source] !== 'true') {
            const otherInput = document.querySelector('.source-url-input[data-source="other"]');
            if (otherInput) {
              otherInput.disabled = false;
              otherInput.value = savedSources[source];
            }
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
        await this.sendToZapier('step_5_content_sources');
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

      // Handle "none" option - no additional input needed
      if (source === 'none') {
        contentSources[source] = 'true';
      }
      // Handle "other" - requires text input
      else if (source === 'other') {
        const urlInput = document.querySelector(`.source-url-input[data-source="${source}"]`);
        if (urlInput && urlInput.value.trim()) {
          contentSources[source] = urlInput.value.trim();
        } else {
          // Store as true even if no description provided
          contentSources[source] = 'true';
        }
      }
      // Handle standard platforms (linkedin, blog, podcast) - just store true
      else {
        contentSources[source] = 'true';
      }
    });

    this.stateManager.updateField('contentSources', contentSources);
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
    // Note: TopicChipsManager emits 'topicsChanged' event (reused for channels)
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
        if (this.stateManager.validateCurrentStep()) {
          await this.sendToZapier('step_6_acquisition_channels');
          await this.handleFinalSubmit();
        }
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
        problemsSolved: state.problemsSolved
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
   * Handle final submission from Step 6
   */
  async handleFinalSubmit() {
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

    // Email List Size
    if (data.emailListSize) {
      const sizeLabel = data.emailListSize.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      this.addSummaryItem(summaryGrid, 'Email List Size', sizeLabel);
    }

    // Goal
    this.addSummaryItem(summaryGrid, 'Newsletter Goal', data.goal);

    // Problems Solved
    if (data.problemsSolved && data.problemsSolved.trim().length > 0) {
      this.addSummaryItem(summaryGrid, 'Problems Your Business Solves', data.problemsSolved);
    }

    // Content Sources
    if (data.contentSources && Object.keys(data.contentSources).length > 0) {
      const sourcesList = Object.entries(data.contentSources).map(([platform, value]) => {
        const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

        // For "other" with a description, show the description
        if (platform === 'other' && value !== 'true') {
          return `Other: ${value}`;
        }
        // For all other platforms, just show the platform name
        else {
          return platformLabel;
        }
      });
      this.addSummaryList(summaryGrid, 'Content Sources', sourcesList);
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
    if (this.channelChipsManager) {
      this.channelChipsManager.clearSelections();
    }

    // Clear all form inputs
    const icpInput = document.getElementById('icp-input');
    const goalInput = document.getElementById('goal-input');
    const problemsInput = document.getElementById('problems-input');
    const notesInput = document.getElementById('acquisition-notes');

    if (icpInput) icpInput.value = '';
    if (goalInput) goalInput.value = '';
    if (problemsInput) problemsInput.value = '';
    if (notesInput) notesInput.value = '';

    // Clear content sources
    const sourceCheckboxes = document.querySelectorAll('input[name="content-source"]');
    const sourceInputs = document.querySelectorAll('.source-url-input');

    sourceCheckboxes.forEach(cb => cb.checked = false);
    sourceInputs.forEach(input => {
      input.value = '';
      input.disabled = true;
    });

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
