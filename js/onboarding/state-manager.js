/**
 * State Manager
 * Handles multi-step navigation and state persistence
 */

class StateManager {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 9;
    this.state = {
      email: '',
      icp: '',
      emailListSize: '',
      goal: '',
      topics: [],
      contentSources: {}, // { linkedin: 'url', twitter: 'url', etc. }
      designDirection: '',
      acquisitionChannels: [],
      acquisitionNotes: '',
      annualRevenue: ''
    };

    this.loadState();
  }

  /**
   * Load state from sessionStorage
   */
  loadState() {
    try {
      const savedState = sessionStorage.getItem('onboarding_state');
      const savedStep = sessionStorage.getItem('onboarding_current_step');

      if (savedState) {
        this.state = { ...this.state, ...JSON.parse(savedState) };
      }

      if (savedStep) {
        this.currentStep = parseInt(savedStep, 10);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  /**
   * Save state to sessionStorage
   */
  saveState() {
    try {
      sessionStorage.setItem('onboarding_state', JSON.stringify(this.state));
      sessionStorage.setItem('onboarding_current_step', this.currentStep.toString());
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  /**
   * Update a specific field in the state
   */
  updateField(field, value) {
    this.state[field] = value;
    this.saveState();
  }

  /**
   * Get a specific field from the state
   */
  getField(field) {
    return this.state[field];
  }

  /**
   * Get the entire state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Clear all state
   */
  clearState() {
    this.state = {
      email: '',
      icp: '',
      emailListSize: '',
      goal: '',
      topics: [],
      contentSources: {},
      designDirection: '',
      acquisitionChannels: [],
      acquisitionNotes: '',
      annualRevenue: ''
    };
    this.currentStep = 0;
    sessionStorage.removeItem('onboarding_state');
    sessionStorage.removeItem('onboarding_current_step');
  }

  /**
   * Navigate to a specific step
   */
  goToStep(stepNumber) {
    if (stepNumber < 0 || stepNumber > this.totalSteps) {
      console.error('Invalid step number:', stepNumber);
      return false;
    }

    // Hide ALL steps first
    for (let i = 0; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      if (stepEl) {
        stepEl.style.display = 'none';
      }
    }

    // Show new step
    const newStepEl = document.getElementById(`step-${stepNumber}`);
    if (newStepEl) {
      newStepEl.style.display = 'block';
      newStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this.currentStep = stepNumber;
    this.saveState();
    this.updateProgressBar();

    return true;
  }

  /**
   * Go to the next step
   */
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      return this.goToStep(this.currentStep + 1);
    }
    return false;
  }

  /**
   * Go to the previous step
   */
  previousStep() {
    if (this.currentStep > 0) {
      return this.goToStep(this.currentStep - 1);
    }
    return false;
  }

  /**
   * Show thank you page
   */
  showThankYou() {
    // Hide current step
    const currentStepEl = document.getElementById(`step-${this.currentStep}`);
    if (currentStepEl) {
      currentStepEl.style.display = 'none';
    }

    // Show thank you page
    const thankYouEl = document.getElementById('thank-you');
    if (thankYouEl) {
      thankYouEl.style.display = 'block';
      thankYouEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Hide progress bar on thank you page
    const progressBarContainer = document.querySelector('.progress-bar-container');
    if (progressBarContainer) {
      progressBarContainer.style.display = 'none';
    }
  }

  /**
   * Update the progress bar
   */
  updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressFill) {
      const percentage = (this.currentStep / this.totalSteps) * 100;
      progressFill.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
    }
  }

  /**
   * Restore form inputs from state
   */
  restoreInputs() {
    // Restore email
    const emailInput = document.getElementById('email-input');
    if (emailInput && this.state.email) {
      emailInput.value = this.state.email;
    }

    // Restore text inputs
    const icpInput = document.getElementById('icp-input');
    if (icpInput && this.state.icp) {
      icpInput.value = this.state.icp;
    }

    const goalInput = document.getElementById('goal-input');
    if (goalInput && this.state.goal) {
      goalInput.value = this.state.goal;
    }

    const notesInput = document.getElementById('acquisition-notes');
    if (notesInput && this.state.acquisitionNotes) {
      notesInput.value = this.state.acquisitionNotes;
    }

    // Restore design direction
    if (this.state.designDirection) {
      const designRadio = document.querySelector(`input[name="design"][value="${this.state.designDirection}"]`);
      if (designRadio) {
        designRadio.checked = true;
      }
    }

    // Restore acquisition channels
    if (this.state.acquisitionChannels && this.state.acquisitionChannels.length > 0) {
      this.state.acquisitionChannels.forEach(channel => {
        const checkbox = document.querySelector(`input[name="acquisition"][value="${channel}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }

    // Navigate to saved step if user has started the form
    if (this.currentStep > 0) {
      // Hide cover page and show progress bar
      const coverPage = document.getElementById('cover-page');
      const progressBar = document.querySelector('.progress-bar-container');

      if (coverPage) {
        coverPage.style.display = 'none';
      }
      if (progressBar) {
        progressBar.style.display = 'block';
      }

      this.goToStep(this.currentStep);
    } else {
      this.updateProgressBar();
    }
  }

  /**
   * Validate current step
   */
  validateCurrentStep() {
    switch (this.currentStep) {
      case 0:
        // Email validation
        return this.state.email && this.isValidEmail(this.state.email);
      case 1:
        return this.state.icp && this.state.icp.trim().length > 0;
      case 2:
        return this.state.emailListSize && this.state.emailListSize.length > 0;
      case 3:
        return this.state.goal && this.state.goal.trim().length > 0;
      case 4:
        return this.state.topics && this.state.topics.length >= 1 && this.state.topics.length <= 3;
      case 5:
        // Require at least one content source selection (including "none")
        return this.state.contentSources && Object.keys(this.state.contentSources).length >= 1;
      case 6:
        return this.state.designDirection && this.state.designDirection.length > 0;
      case 7:
        // Require at least one acquisition channel
        return this.state.acquisitionChannels && this.state.acquisitionChannels.length >= 1;
      case 8:
        return this.state.annualRevenue && this.state.annualRevenue.length > 0;
      default:
        return false;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export for use in other modules
window.StateManager = StateManager;
