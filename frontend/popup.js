/**
 * Professional Popup Component
 * A modern, customizable popup notification system to replace JavaScript alerts
 */

class Popup {
  constructor() {
    this.createContainer();
  }

  createContainer() {
    // Check if container already exists
    if (document.getElementById('popup-container')) return;
    
    // Create container for popups
    const container = document.createElement('div');
    container.id = 'popup-container';
    container.className = 'fixed inset-0 flex items-center justify-center z-50 pointer-events-none';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.zIndex = '9999';
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

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'popup-item bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto pointer-events-auto transform transition-all duration-300 scale-95 opacity-0';
    popup.style.maxWidth = '90vw';

    // Set popup content based on type
    let iconHtml = '';
    let headerClass = '';
    
    switch (type) {
      case 'success':
        iconHtml = '<div class="bg-green-100 dark:bg-green-900 p-3 rounded-full"><svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>';
        headerClass = 'text-green-500';
        break;
      case 'error':
        iconHtml = '<div class="bg-red-100 dark:bg-red-900 p-3 rounded-full"><svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>';
        headerClass = 'text-red-500';
        break;
      case 'warning':
        iconHtml = '<div class="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full"><svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>';
        headerClass = 'text-yellow-500';
        break;
      default: // info
        iconHtml = '<div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full"><svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
        headerClass = 'text-blue-500';
    }

    // Construct popup HTML
    popup.innerHTML = `
      <div class="flex items-start">
        ${iconHtml}
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-medium ${headerClass} dark:${headerClass}">${title}</h3>
          <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">${message}</div>
          ${(onConfirm || showCancel) ? `
            <div class="mt-4 flex ${showCancel ? 'justify-between' : 'justify-end'}">
              ${showCancel ? `<button class="popup-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>` : ''}
              <button class="popup-confirm px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">OK</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add to container
    const container = document.getElementById('popup-container');
    container.appendChild(popup);
    container.classList.add('bg-black', 'bg-opacity-50');
    container.classList.remove('pointer-events-none');
    container.classList.add('pointer-events-auto');

    // Animate in
    setTimeout(() => {
      popup.classList.remove('scale-95', 'opacity-0');
      popup.classList.add('scale-100', 'opacity-100');
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
   */
  close(popup) {
    popup.classList.remove('scale-100', 'opacity-100');
    popup.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
      popup.remove();
      
      // If no more popups, hide the container background
      const container = document.getElementById('popup-container');
      if (container && container.children.length === 0) {
        container.classList.remove('bg-black', 'bg-opacity-50');
        container.classList.add('pointer-events-none');
        container.classList.remove('pointer-events-auto');
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
  prompt(message, onConfirm, defaultValue = '', options = {}) {
    const popup = document.createElement('div');
    popup.className = 'popup-item bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-auto pointer-events-auto transform transition-all duration-300 scale-95 opacity-0';
    popup.style.maxWidth = '90vw';

    popup.innerHTML = `
      <div>
        <h3 class="text-lg font-medium text-blue-500 dark:text-blue-400">${options.title || 'Prompt'}</h3>
        <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">${message}</div>
        <input type="text" class="mt-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" value="${defaultValue}" />
        <div class="mt-4 flex justify-between">
          <button class="popup-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
          <button class="popup-confirm px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">OK</button>
        </div>
      </div>
    `;

    // Add to container
    const container = document.getElementById('popup-container');
    container.appendChild(popup);
    container.classList.add('bg-black', 'bg-opacity-50');
    container.classList.remove('pointer-events-none');
    container.classList.add('pointer-events-auto');

    // Animate in
    setTimeout(() => {
      popup.classList.remove('scale-95', 'opacity-0');
      popup.classList.add('scale-100', 'opacity-100');
      
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

// Create a global popup instance
const popup = new Popup();

// Replace native alert with popup
window.originalAlert = window.alert;
window.alert = function(message) {
  return new Promise(resolve => {
    popup.show({ message, duration: 0, onConfirm: () => resolve() });
  });
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