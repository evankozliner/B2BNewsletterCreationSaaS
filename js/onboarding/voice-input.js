/**
 * Voice Input Handler
 * Manages Web Speech API integration for voice-to-text input
 */

class VoiceInputHandler {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = this.checkSupport();
  }

  /**
   * Check if Web Speech API is supported
   */
  checkSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  /**
   * Initialize voice recognition for a specific input
   */
  initialize(micButton, textarea, statusElement) {
    if (!this.isSupported) {
      this.showUnsupportedMessage(micButton, statusElement);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    let finalTranscript = '';
    let interimTranscript = '';

    // Handle results
    this.recognition.onresult = (event) => {
      interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update textarea with transcript
      const cursorPosition = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPosition);
      const textAfter = textarea.value.substring(cursorPosition);

      textarea.value = textBefore + finalTranscript + interimTranscript + textAfter;

      // Show interim results in status
      if (interimTranscript) {
        this.updateStatus(statusElement, `"${interimTranscript}"`, 'listening');
      }

      // Trigger input event for validation
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    };

    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.handleError(event.error, micButton, statusElement);
      this.stopListening(micButton, statusElement);
    };

    // Handle end
    this.recognition.onend = () => {
      if (this.isListening) {
        // Automatically restart if still in listening mode
        try {
          this.recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
          this.stopListening(micButton, statusElement);
        }
      }
    };

    // Handle start
    this.recognition.onstart = () => {
      finalTranscript = '';
      interimTranscript = '';
      this.updateStatus(statusElement, 'Listening... Speak now', 'listening');
    };

    // Set up click handler
    micButton.addEventListener('click', () => {
      if (this.isListening) {
        this.stopListening(micButton, statusElement);
      } else {
        this.startListening(micButton, statusElement);
      }
    });
  }

  /**
   * Start listening
   */
  startListening(micButton, statusElement) {
    if (!this.recognition) {
      this.updateStatus(statusElement, 'Voice input not initialized', 'error');
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      micButton.classList.add('listening');
      const micText = micButton.querySelector('.mic-text');
      if (micText) {
        micText.textContent = 'Listening...';
      }
    } catch (error) {
      console.error('Error starting recognition:', error);
      this.updateStatus(statusElement, 'Could not start voice input. Please try again.', 'error');
    }
  }

  /**
   * Stop listening
   */
  stopListening(micButton, statusElement) {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      micButton.classList.remove('listening');
      const micText = micButton.querySelector('.mic-text');
      if (micText) {
        micText.textContent = 'Tap to speak';
      }
      this.updateStatus(statusElement, '', '');
    }
  }

  /**
   * Handle errors
   */
  handleError(errorType, micButton, statusElement) {
    let message = '';

    switch (errorType) {
      case 'no-speech':
        message = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        message = 'No microphone found. Please check your device.';
        break;
      case 'not-allowed':
        message = 'Microphone permission denied. Please enable it in your browser settings.';
        break;
      case 'network':
        message = 'Network error. Please check your connection.';
        break;
      case 'aborted':
        message = 'Voice input was stopped.';
        break;
      default:
        message = 'An error occurred. Please try again.';
    }

    this.updateStatus(statusElement, message, 'error');

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      if (statusElement && statusElement.textContent === message) {
        this.updateStatus(statusElement, '', '');
      }
    }, 5000);
  }

  /**
   * Show unsupported browser message
   */
  showUnsupportedMessage(micButton, statusElement) {
    micButton.disabled = true;
    micButton.style.opacity = '0.5';
    micButton.style.cursor = 'not-allowed';
    this.updateStatus(
      statusElement,
      'Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.',
      'error'
    );
  }

  /**
   * Update status message
   */
  updateStatus(statusElement, message, className) {
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = 'voice-status';

    if (className) {
      statusElement.classList.add(className);
    }
  }

  /**
   * Clean up and stop all recognition
   */
  cleanup() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

// Export for use in other modules
window.VoiceInputHandler = VoiceInputHandler;
