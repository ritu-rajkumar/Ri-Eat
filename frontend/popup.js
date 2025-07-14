/**
 * Professional Popup Component
 * A modern, customizable popup notification system to replace JavaScript alerts
 */



class Popup {
  constructor() {
    this.createContainer();
    this.overrideNativeFunctions();
  }

  overrideNativeFunctions() {
    window.originalAlert = window.alert;
    window.originalConfirm = window.confirm;
    window.originalPrompt = window.prompt;

    window.alert = (message) => this.alert(message);
    window.confirm = (message) => this.confirm(message);
    window.prompt = (message, defaultValue = '') => this.prompt(message, defaultValue);
  }

  createContainer() {
    // Check if container already exists
    if (document.getElementById('popup-container')) return;
    
    // Create container for popups
    const container = document.createElement('div');
    container.className = 'fixed inset-0 flex items-center justify-center z-50 pointer-events-none';
    container.style.pointerEvents = 'none';
    
    document.body.appendChild(container);
  }

  /**
   * Show a popup message
   * @param {Object} options - Popup options
   * @param {string} options.message - The message to display
   * @param {string} options.type - Type of popup: 'info', 'success', 'error', 'warning'
   * @param {string} options.title - Optional title for the popup
   * @param {number} options.duration - Duration in ms (0 for persistent popup)
   * @param {Function} options.onConfirm - Callback function when confirmed
   * @param {Function} options.onCancel - Callback function when canceled
   * @param {boolean} options.showCancel - Whether to show cancel button
   */
  show(options = {}) {
    const {
      message = '',
      type = 'info',
      title = this.getTitleByType(type),
      duration = 3000,
      onConfirm = null,
      onCancel = null,
      showCancel = false
    } = options;

    popup.className = 'popup-item bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto pointer-events-auto transform transition-all duration-300 scale-95 opacity-0';
    popup.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    popup.style.opacity = '0';
    popup.style.transition = 'all 0.3s ease-in-out';

    let headerClass = '';
    let iconHtml = '';
    let headerColor = '';
    
        iconHtml = '<div class="bg-green-100 dark:bg-green-900 p-3 rounded-full"><svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>';
        headerClass = 'text-green-500';
        iconHtml = '<div style="background-color: #d1fae5; padding: 0.75rem; border-radius: 9999px;"><svg style="width: 1.5rem; height: 1.5rem; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>';
        headerColor = '#10b981';
        iconHtml = '<div class="bg-red-100 dark:bg-red-900 p-3 rounded-full"><svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>';
        headerClass = 'text-red-500';
        iconHtml = '<div style="background-color: #fee2e2; padding: 0.75rem; border-radius: 9999px;"><svg style="width: 1.5rem; height: 1.5rem; color: #ef4444;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>';
        headerColor = '#ef4444';
        iconHtml = '<div class="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full"><svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>';
        headerClass = 'text-yellow-500';
        iconHtml = '<div style="background-color: #fef3c7; padding: 0.75rem; border-radius: 9999px;"><svg style="width: 1.5rem; height: 1.5rem; color: #f59e0b;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>';
        headerColor = '#f59e0b';
        iconHtml = '<div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full"><svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
        headerClass = 'text-blue-500';
        iconHtml = '<div style="background-color: #dbeafe; padding: 0.75rem; border-radius: 9999px;"><svg style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
        headerColor = '#3b82f6';
    }

      <div class="flex items-start">
    popup.innerHTML = `
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-medium ${headerClass} dark:${headerClass}">${title}</h3>
          <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">${message}</div>
          <h3 style="font-size: 1.125rem; font-weight: 500; color: ${headerColor};">${title}</h3>
            <div class="mt-4 flex ${showCancel ? 'justify-between' : 'justify-end'}">
              ${showCancel ? `<button class="popup-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>` : ''}
              <button class="popup-confirm px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">OK</button>
              ${showCancel ? `<button class="popup-cancel" style="padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #4b5563; background-color: #f3f4f6; border-radius: 0.375rem; border: none; cursor: pointer;">Cancel</button>` : ''}
              <button class="popup-confirm" style="padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #3b82f6; border-radius: 0.375rem; border: none; cursor: pointer;">OK</button>
            </div>
          ` : ''
        </div>
      </div>
    `;

    // Add to container
    container.classList.add('bg-black', 'bg-opacity-50');
    container.classList.remove('pointer-events-none');
    container.classList.add('pointer-events-auto');
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    container.style.pointerEvents = 'auto';

      popup.classList.remove('scale-95', 'opacity-0');
      popup.classList.add('scale-100', 'opacity-100');
      popup.style.transform = 'scale(1)';
      popup.style.opacity = '1';
    }, 10);

    // Set up event listeners for buttons if provided
    if (onConfirm || showCancel) {
      const confirmBtn = popup.querySelector('.popup-confirm');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          this.close(popup);
          if (typeof onConfirm === 'function') onConfirm();
        });
      }

      const cancelBtn = popup.querySelector('.popup-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.close(popup);
          if (typeof onCancel === 'function') onCancel();
        });
      }
    } else if (duration > 0) {
      // Auto close after duration
      setTimeout(() => this.close(popup), duration);
    }

    return popup;
  }

  /**
   * Close a specific popup
   * @param {HTMLElement} popup - The popup element to close
    popup.classList.remove('scale-100', 'opacity-100');
    popup.classList.add('scale-95', 'opacity-0');
    popup.style.transform = 'scale(0.95)';
    popup.style.opacity = '0';
    
    setTimeout(() => {
      popup.remove();
      
      // If no more popups, hide the container background
        container.classList.remove('bg-black', 'bg-opacity-50');
        container.classList.add('pointer-events-none');
        container.classList.remove('pointer-events-auto');
        container.style.backgroundColor = 'transparent';
        container.style.pointerEvents = 'none';
      }
    }, 300);
  }

  /**
   * Close all popups
   */
  closeAll() {
    const container = document.getElementById('popup-container');
    if (container) {
      Array.from(container.children).forEach(popup => this.close(popup));
    }
  }

  /**
   * Get default title based on popup type
   * @param {string} type - Popup type
   * @returns {string} - Default title
   */
  getTitleByType(type) {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      default: return 'Information';
    }
  }

  /**
   * Shorthand for showing an info popup
   * @param {string} message - The message to display
   * @param {Object} options - Additional options
   */
  info(message, options = {}) {
    return this.show({ ...options, message, type: 'info' });
  }

  /**
   * Shorthand for showing a success popup
   * @param {string} message - The message to display
   * @param {Object} options - Additional options
   */
  success(message, options = {}) {
    return this.show({ ...options, message, type: 'success' });
  }

  /**
   * Shorthand for showing an error popup
   * @param {string} message - The message to display
   * @param {Object} options - Additional options
   */
  error(message, options = {}) {
    return this.show({ ...options, message, type: 'error' });
  }

  /**
   * Custom alert function using the popup
   * @param {string} message - The message to display
   * @param {string} title - Optional title for the alert
   */
  alert(message, title = 'Alert') {
    return new Promise(resolve => {
      this.show({
        message,
        title,
        type: 'info',
        duration: 0, // Persistent until closed by user
        onConfirm: () => resolve(true)
      });
    });
  }

  /**
   * Custom confirm function using the popup
   * @param {string} message - The message to display
   * @param {string} title - Optional title for the confirm dialog
   * @returns {Promise<boolean>} - Resolves with true if confirmed, false if canceled
   */
  confirm(message, title = 'Confirm') {
    return new Promise(resolve => {
      this.show({
        message,
        title,
        type: 'warning',
        duration: 0,
        showCancel: true,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }

  /**
   * Custom prompt function using the popup
   * @param {string} message - The message to display
   * @param {string} defaultValue - Default value for the prompt input
   * @param {string} title - Optional title for the prompt dialog
   * @returns {Promise<string|null>} - Resolves with the input value or null if canceled
   */
  prompt(message, defaultValue = '', title = 'Prompt') {
    return new Promise(resolve => {
      const popupElement = document.createElement('div');
      popupElement.className = 'popup-item bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto pointer-events-auto transform transition-all duration-300 scale-95 opacity-0';
      popupElement.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      popupElement.style.opacity = '0';
      popupElement.style.transition = 'all 0.3s ease-in-out';

      popupElement.innerHTML = `
        <div class="flex items-start">
          <div class="ml-4 flex-1">
            <h3 class="text-lg font-medium text-blue-500 dark:text-blue-400">${title}</h3>
            <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">${message}</div>
            <input type="text" class="popup-prompt-input mt-2 w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white" value="${defaultValue}">
            <div class="mt-4 flex justify-end space-x-2">
              <button class="popup-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
              <button class="popup-confirm px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">OK</button>
            </div>
          </div>
        </div>
      `;

      const container = document.getElementById('popup-container');
      if (!container) {
        console.error('Popup container not found.');
        resolve(null);
        return;
      }

      container.appendChild(popupElement);
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      container.style.pointerEvents = 'auto';

      setTimeout(() => {
        popupElement.style.transform = 'scale(1)';
        popupElement.style.opacity = '1';
      }, 10);

      const confirmBtn = popupElement.querySelector('.popup-confirm');
      const cancelBtn = popupElement.querySelector('.popup-cancel');
      const input = popupElement.querySelector('.popup-prompt-input');

      confirmBtn.addEventListener('click', () => {
        this.close(popupElement);
        resolve(input.value);
      });

      cancelBtn.addEventListener('click', () => {
        this.close(popupElement);
        resolve(null);
      });

      input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          confirmBtn.click();
        }
      });
    });
  }
   * Shorthand for showing a warning popup
   * @param {string} message - The message to display
   * @param {Object} options - Additional options
   */
  warning(message, options = {}) {
    return this.show({ ...options, message, type: 'warning' });
  }

  /**
   * Show a confirmation popup with OK and Cancel buttons
   * @param {string} message - The message to display
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function} onCancel - Callback when canceled
   * @param {Object} options - Additional options
   */
  confirm(message, onConfirm, onCancel, options = {}) {
    return this.show({
      ...options,
      message,
      type: 'info',
      onConfirm,
      onCancel,
      showCancel: true,
      duration: 0 // Don't auto-close confirmation dialogs
    });
  }

  /**
   * Show a prompt popup with input field
   * @param {string} message - The message to display
   * @param {Function} onConfirm - Callback with input value
   * @param {string} defaultValue - Default input value
   * @param {Object} options - Additional options
   */
    popup.className = 'popup-item bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto pointer-events-auto transform transition-all duration-300 scale-95 opacity-0';
    popup.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    popup.style.opacity = '0';
    popup.style.transition = 'all 0.3s ease-in-out';

        <h3 class="text-lg font-medium text-blue-500 dark:text-blue-400">${options.title || 'Prompt'}</h3>
        <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">${message}</div>
        <input type="text" class="mt-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" value="${defaultValue}" />
        <div class="mt-4 flex justify-between">
          <button class="popup-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
          <button class="popup-confirm px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">OK</button>
          <button class="popup-cancel" style="padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #4b5563; background-color: #f3f4f6; border-radius: 0.375rem; border: none; cursor: pointer;">Cancel</button>
          <button class="popup-confirm" style="padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #3b82f6; border-radius: 0.375rem; border: none; cursor: pointer;">OK</button>
        </div>
      </div>
    `;

    // Add to container
    container.classList.add('bg-black', 'bg-opacity-50');
    container.classList.remove('pointer-events-none');
    container.classList.add('pointer-events-auto');
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    container.style.pointerEvents = 'auto';

      popup.classList.remove('scale-95', 'opacity-0');
      popup.classList.add('scale-100', 'opacity-100');
      popup.style.transform = 'scale(1)';
      popup.style.opacity = '1';
      
      // Focus the input field
      const input = popup.querySelector('input');
      if (input) input.focus();
    }, 10);

    // Set up event listeners
    const confirmBtn = popup.querySelector('.popup-confirm');
    const cancelBtn = popup.querySelector('.popup-cancel');
    const input = popup.querySelector('input');

    confirmBtn.addEventListener('click', () => {
      this.close(popup);
      if (typeof onConfirm === 'function') onConfirm(input.value);
    });

    cancelBtn.addEventListener('click', () => {
      this.close(popup);
      if (typeof options.onCancel === 'function') options.onCancel();
    });

    // Handle Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.close(popup);
        if (typeof onConfirm === 'function') onConfirm(input.value);
      }
    });

    return popup;
  }
}

// Instantiate the Popup class to make it available globally
new Popup();

// Replace native alert with popup
window.originalAlert = window.alert;
window.alert = function(message) {
  popup.show({ message, duration: 0, onConfirm: () => {} });
};

// Replace native confirm with popup
window.originalConfirm = window.confirm;
window.confirm = function(message) {
  return new Promise(resolve => {
    popup.confirm(message, () => resolve(true), () => resolve(false));
  });
};

// Replace native prompt with popup
window.originalPrompt = window.prompt;
window.prompt = function(message, defaultValue = '') {
  return new Promise(resolve => {
    popup.prompt(message, value => resolve(value), defaultValue);
  });
};