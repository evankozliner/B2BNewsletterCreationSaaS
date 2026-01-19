/**
 * Section Selection Component
 * Manages newsletter section selection with cards
 */

class SectionSelectionManager {
  constructor(containerSelector, maxSections = 3) {
    this.container = document.querySelector(containerSelector);
    this.maxSections = maxSections;
    this.selectedSections = [];
    this.allSections = [];
    this.recommendedSections = [];
  }

  /**
   * Initialize sections from API response
   */
  setSections(apiResponse) {
    this.allSections = apiResponse.all || [];
    this.recommendedSections = apiResponse.recommended || [];

    this.render();

    // Auto-select top 3 recommended sections
    this.preselectRecommended();
  }

  /**
   * Preselect the top recommended sections
   */
  preselectRecommended() {
    const topRecommended = this.recommendedSections.slice(0, this.maxSections);

    topRecommended.forEach(section => {
      if (this.selectedSections.length < this.maxSections) {
        this.selectedSections.push(section.key);

        // UPDATE THE DOM: Find the card and checkbox for this section
        const card = this.container.querySelector(`[data-section-key="${section.key}"]`);
        if (card) {
          card.classList.add('selected');
          const checkbox = card.querySelector('.section-checkbox');
          if (checkbox) {
            checkbox.checked = true;
          }
        }
      }
    });

    this.updateCardsState();
    this.updateSelectionCount();
    this.dispatchSelectionChange();
  }

  /**
   * Render all section cards
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';

    // Render recommended sections first
    const recommendedKeys = this.recommendedSections.map(s => s.key);

    this.allSections.forEach(section => {
      const isRecommended = recommendedKeys.includes(section.key);
      const recommendedData = isRecommended
        ? this.recommendedSections.find(s => s.key === section.key)
        : null;

      const card = this.createCard(section, isRecommended, recommendedData);
      this.container.appendChild(card);
    });

    this.updateSelectionCount();
  }

  /**
   * Create a section card element
   */
  createCard(section, isRecommended, recommendedData) {
    const card = document.createElement('div');
    card.className = 'section-card';
    card.dataset.sectionKey = section.key;

    if (isRecommended) {
      card.classList.add('recommended');
    }

    // Check if selected
    if (this.selectedSections.includes(section.key)) {
      card.classList.add('selected');
    }

    // Check if should be disabled
    if (this.selectedSections.length >= this.maxSections && !this.selectedSections.includes(section.key)) {
      card.classList.add('disabled');
    }

    // Create header with checkbox and title
    const header = document.createElement('div');
    header.className = 'section-card-header';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'section-checkbox';
    checkbox.checked = this.selectedSections.includes(section.key);
    checkbox.disabled = card.classList.contains('disabled');

    const title = document.createElement('h3');
    title.textContent = section.title || this.formatTitle(section.key);

    header.appendChild(checkbox);
    header.appendChild(title);
    card.appendChild(header);

    // Add description
    const description = document.createElement('p');
    description.textContent = section.description || '';
    card.appendChild(description);

    // Add strategy fit for recommended sections
    if (isRecommended && recommendedData && recommendedData.strategyFit) {
      const strategyFit = document.createElement('div');
      strategyFit.className = 'section-strategy-fit';

      const fitTitle = document.createElement('strong');
      fitTitle.textContent = 'Why this fits:';
      strategyFit.appendChild(fitTitle);

      const fitText = document.createElement('p');
      fitText.textContent = recommendedData.strategyFit;
      strategyFit.appendChild(fitText);

      card.appendChild(strategyFit);
    }

    // Add click handler to card (except when clicking checkbox or disabled)
    card.addEventListener('click', (e) => {
      if (e.target === checkbox || card.classList.contains('disabled')) {
        return;
      }
      // Toggle the checkbox - this will trigger the change event
      checkbox.click();
    });

    // Handle checkbox changes
    checkbox.addEventListener('change', () => {
      if (!card.classList.contains('disabled')) {
        this.toggleSection(section.key, card, checkbox);
      }
    });

    return card;
  }

  /**
   * Format section key to title
   */
  formatTitle(key) {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Toggle section selection
   */
  toggleSection(sectionKey, cardElement, checkbox) {
    const isCurrentlySelected = this.selectedSections.indexOf(sectionKey) > -1;
    const wantsToSelect = checkbox.checked;

    if (wantsToSelect && !isCurrentlySelected) {
      // Want to select
      if (this.selectedSections.length < this.maxSections) {
        this.selectedSections.push(sectionKey);
        cardElement.classList.add('selected');
      } else {
        // Already at max, prevent selection
        checkbox.checked = false;
        return;
      }
    } else if (!wantsToSelect && isCurrentlySelected) {
      // Want to deselect
      const index = this.selectedSections.indexOf(sectionKey);
      this.selectedSections.splice(index, 1);
      cardElement.classList.remove('selected');
    }

    // Update all cards' disabled state
    this.updateCardsState();
    this.updateSelectionCount();
    this.dispatchSelectionChange();
  }

  /**
   * Update disabled state of all cards
   */
  updateCardsState() {
    const cards = this.container.querySelectorAll('.section-card');

    cards.forEach(card => {
      const isSelected = card.classList.contains('selected');
      const checkbox = card.querySelector('.section-checkbox');

      if (this.selectedSections.length >= this.maxSections && !isSelected) {
        card.classList.add('disabled');
        if (checkbox) checkbox.disabled = true;
      } else {
        card.classList.remove('disabled');
        if (checkbox) checkbox.disabled = false;
      }
    });
  }

  /**
   * Update selection count display
   */
  updateSelectionCount() {
    const summary = document.getElementById('selected-sections-summary');
    if (!summary) return;

    const countSpan = summary.querySelector('.sections-count');
    if (countSpan) {
      countSpan.textContent = `${this.selectedSections.length} of ${this.maxSections} selected`;
    }
  }

  /**
   * Dispatch selection change event
   */
  dispatchSelectionChange() {
    const event = new CustomEvent('sectionsChanged', {
      detail: { sections: this.getSelectedSections() }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get selected sections
   */
  getSelectedSections() {
    return [...this.selectedSections];
  }

  /**
   * Set selected sections (for restoring state)
   */
  setSelectedSections(sections) {
    this.selectedSections = sections || [];
    this.updateCardsState();
    this.updateSelectionCount();
  }

  /**
   * Clear all selections
   */
  clearSelections() {
    this.selectedSections = [];
    this.updateCardsState();
    this.updateSelectionCount();
    this.dispatchSelectionChange();
  }

  /**
   * Get section details by key
   */
  getSectionDetails(sectionKey) {
    return this.allSections.find(s => s.key === sectionKey);
  }

  /**
   * Get all selected section details
   */
  getSelectedSectionDetails() {
    return this.selectedSections.map(key => this.getSectionDetails(key)).filter(Boolean);
  }
}

// Export for use in other modules
window.SectionSelectionManager = SectionSelectionManager;
