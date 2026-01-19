/**
 * Topic Chips Component
 * Manages topic selection UI with chips/tags
 */

class TopicChipsManager {
  constructor(containerSelector, maxTopics = 3) {
    this.container = document.querySelector(containerSelector);
    this.maxTopics = maxTopics;
    this.selectedTopics = [];
    this.suggestedTopics = [];
    this.customTopics = [];
  }

  /**
   * Initialize suggested topics from API response
   */
  setSuggestedTopics(topics) {
    this.suggestedTopics = topics.map(topic => ({
      id: topic.id || this.generateId(topic.label),
      label: topic.label,
      reason: topic.reason || null,
      isCustom: false
    }));

    this.render();
  }

  /**
   * Generate a simple ID from label
   */
  generateId(label) {
    return label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Render all topics
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = '';

    // Render suggested topics
    this.suggestedTopics.forEach(topic => {
      const chip = this.createChip(topic);
      this.container.appendChild(chip);
    });

    // Render custom topics
    this.customTopics.forEach(topic => {
      const chip = this.createChip(topic);
      this.container.appendChild(chip);
    });

    this.updateSelectionCount();
  }

  /**
   * Create a chip element
   */
  createChip(topic) {
    const chip = document.createElement('div');
    chip.className = 'topic-chip';
    chip.dataset.topicId = topic.id;

    if (topic.isCustom) {
      chip.classList.add('custom');
    }

    // Check if already selected
    if (this.selectedTopics.includes(topic.label)) {
      chip.classList.add('selected');
    }

    // Check if should be disabled (max reached and not selected)
    if (this.selectedTopics.length >= this.maxTopics && !this.selectedTopics.includes(topic.label)) {
      chip.classList.add('disabled');
    }

    // Create label
    const label = document.createElement('span');
    label.textContent = topic.label;
    chip.appendChild(label);

    // Add remove button for custom topics
    if (topic.isCustom) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '×';
      removeBtn.setAttribute('aria-label', `Remove ${topic.label}`);

      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCustomTopic(topic.id);
      });

      chip.appendChild(removeBtn);
    }

    // Add click handler
    chip.addEventListener('click', () => {
      if (!chip.classList.contains('disabled')) {
        this.toggleTopic(topic.label, chip);
      }
    });

    return chip;
  }

  /**
   * Toggle topic selection
   */
  toggleTopic(topicLabel, chipElement) {
    const index = this.selectedTopics.indexOf(topicLabel);

    if (index > -1) {
      // Deselect
      this.selectedTopics.splice(index, 1);
      chipElement.classList.remove('selected');
    } else {
      // Select (if under max)
      if (this.selectedTopics.length < this.maxTopics) {
        this.selectedTopics.push(topicLabel);
        chipElement.classList.add('selected');
      }
    }

    // Update all chips' disabled state
    this.updateChipsState();
    this.updateSelectionCount();

    // Dispatch event for state update
    this.dispatchSelectionChange();
  }

  /**
   * Update disabled state of all chips
   */
  updateChipsState() {
    const chips = this.container.querySelectorAll('.topic-chip');

    chips.forEach(chip => {
      const isSelected = chip.classList.contains('selected');

      if (this.selectedTopics.length >= this.maxTopics && !isSelected) {
        chip.classList.add('disabled');
      } else {
        chip.classList.remove('disabled');
      }
    });
  }

  /**
   * Add a custom topic
   */
  addCustomTopic(topicLabel) {
    if (!topicLabel || topicLabel.trim().length === 0) {
      return { success: false, error: 'Topic name cannot be empty' };
    }

    const trimmedLabel = topicLabel.trim();

    // Check if topic already exists (case-insensitive)
    const existsInSuggested = this.suggestedTopics.some(
      t => t.label.toLowerCase() === trimmedLabel.toLowerCase()
    );
    const existsInCustom = this.customTopics.some(
      t => t.label.toLowerCase() === trimmedLabel.toLowerCase()
    );

    if (existsInSuggested || existsInCustom) {
      return { success: false, error: 'This topic already exists' };
    }

    // Check if we've reached the max
    if (this.selectedTopics.length >= this.maxTopics) {
      return { success: false, error: `You can only select up to ${this.maxTopics} topics` };
    }

    // Add custom topic
    const customTopic = {
      id: this.generateId(trimmedLabel) + '-custom-' + Date.now(),
      label: trimmedLabel,
      reason: null,
      isCustom: true
    };

    this.customTopics.push(customTopic);

    // Automatically select it
    this.selectedTopics.push(trimmedLabel);

    this.render();

    return { success: true };
  }

  /**
   * Remove a custom topic
   */
  removeCustomTopic(topicId) {
    const topic = this.customTopics.find(t => t.id === topicId);

    if (!topic) return;

    // Remove from custom topics
    this.customTopics = this.customTopics.filter(t => t.id !== topicId);

    // Remove from selected if selected
    this.selectedTopics = this.selectedTopics.filter(t => t !== topic.label);

    this.render();
    this.dispatchSelectionChange();
  }

  /**
   * Update selection count display
   */
  updateSelectionCount() {
    const summary = document.getElementById('selected-topics-summary');
    if (!summary) return;

    const countSpan = summary.querySelector('.topics-count');
    if (countSpan) {
      countSpan.textContent = `${this.selectedTopics.length} of ${this.maxTopics} selected`;
    }
  }

  /**
   * Dispatch selection change event
   */
  dispatchSelectionChange() {
    const event = new CustomEvent('topicsChanged', {
      detail: { topics: this.getSelectedTopics() }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get selected topics
   */
  getSelectedTopics() {
    return [...this.selectedTopics];
  }

  /**
   * Set selected topics (for restoring state)
   */
  setSelectedTopics(topics) {
    this.selectedTopics = topics || [];
    this.render();
  }

  /**
   * Clear all selections
   */
  clearSelections() {
    this.selectedTopics = [];
    this.render();
    this.dispatchSelectionChange();
  }
}

// Export for use in other modules
window.TopicChipsManager = TopicChipsManager;
