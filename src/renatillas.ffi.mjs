// View Transitions API support
export function startViewTransition(callback) {
  if (document.startViewTransition) {
    return document.startViewTransition(() => {
      callback();
    });
  } else {
    // Fallback for browsers that don't support View Transitions
    callback();
    return null;
  }
}

// Check if View Transitions API is supported
export function supportsViewTransitions() {
  return !!document.startViewTransition;
}

// Initialize view transition support with Lustre
export function initializeViewTransitions() {
  if (!document.startViewTransition) {
    console.log('View Transitions API not supported, using fallback animations');
    return;
  }

  // Observe DOM changes for view transition triggers
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Handle added/removed nodes (windows appearing/disappearing)
      if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
        // The CSS view-transition-name properties handle the animations
      }
    }
  });

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const root = document.querySelector('[data-clique-root]');
      if (root) {
        observer.observe(root, { childList: true, subtree: true });
      }
    });
  } else {
    const root = document.querySelector('[data-clique-root]');
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  console.log('View Transitions API initialized');
}

// Touch support for clique-based dragging and viewport panning
export function initializeTouchSupport() {
  
  // Fix button clicks inside clique nodes
  function handleButtonClicks(e) {
    // If clicking on a clique-node, check if we're actually clicking a button inside it
    if (e.target.tagName === 'CLIQUE-NODE') {
      const buttons = e.target.querySelectorAll('button, a');
      
      // Get mouse position relative to the clique-node
      const nodeRect = e.target.getBoundingClientRect();
      const mouseX = e.clientX - nodeRect.left;
      const mouseY = e.clientY - nodeRect.top;
      
      // Check if mouse click is within any button's bounds
      for (const button of buttons) {
        const buttonRect = button.getBoundingClientRect();
        const buttonX = buttonRect.left - nodeRect.left;
        const buttonY = buttonRect.top - nodeRect.top;
        
        if (mouseX >= buttonX && mouseX <= buttonX + buttonRect.width &&
            mouseY >= buttonY && mouseY <= buttonY + buttonRect.height) {
          // Stop clique from handling this event and trigger the button click
          e.stopPropagation();
          e.preventDefault();
          button.click();
          return;
        }
      }
    }
    
    // Fallback: if directly clicking a button, stop propagation
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
      e.stopPropagation();
    }
  }
  
  // Add event listeners for both mouse and touch events in capture phase
  document.addEventListener('mousedown', handleButtonClicks, { capture: true });
  document.addEventListener('touchstart', handleButtonClicks, { capture: true, passive: false });
  let isDragging = false;
  let dragTarget = null;
  let canvasPanning = false;
  let initialTouchPos = { x: 0, y: 0 };
  
  function createMouseEvent(type, touch, target = null) {
    const mouseEvent = new MouseEvent(type, {
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY,
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: type === 'mousedown' || type === 'mousemove' ? 1 : 0
    });
    
    // Add touch identifier for proper tracking
    if (target) {
      Object.defineProperty(mouseEvent, 'target', { value: target });
    }
    
    return mouseEvent;
  }

  function findDragHandle(element) {
    // Check if the element itself or any parent up to touch-draggable has drag-handle class
    let current = element;
    while (current && !current.classList.contains('touch-draggable')) {
      if (current.classList.contains('drag-handle')) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function handleTouchStart(e) {
    const touch = e.touches[0];
    initialTouchPos = { x: touch.clientX, y: touch.clientY };
    
    // Check if we're touching a button - don't prevent default to allow clicks
    const isButton = e.target.tagName === 'BUTTON' || 
                     e.target.tagName === 'A' || 
                     e.target.hasAttribute('data-window-button') ||
                     e.target.closest('button') ||
                     e.target.closest('a');
    
    if (isButton) {
      // Allow normal click behavior for buttons/links
      return;
    }
    
    // Check for draggable windows first
    const draggableElement = e.target.closest('.touch-draggable');
    const dragHandle = findDragHandle(e.target);
    
    if (draggableElement && dragHandle) {
      e.preventDefault();
      e.stopPropagation();
      
      isDragging = true;
      dragTarget = draggableElement;
      
      // Dispatch mousedown on the drag handle to trigger clique's drag system
      const mouseEvent = createMouseEvent('mousedown', touch, dragHandle);
      dragHandle.dispatchEvent(mouseEvent);
      return;
    }
    
    // Check for canvas/viewport panning
    // Look for clique-viewport or clique-background elements
    const cliqueViewport = e.target.closest('clique-viewport') || 
                          document.querySelector('clique-viewport');
    const cliqueBackground = e.target.closest('clique-background') ||
                            e.target.matches('clique-background') ||
                            (e.target.tagName === 'svg' && e.target.closest('clique-background')) ||
                            (e.target.tagName === 'rect' && e.target.closest('clique-background'));
    
    // Check if we're touching viewport area but not a draggable element
    if ((cliqueViewport || cliqueBackground) && !draggableElement) {
      e.preventDefault();
      canvasPanning = true;
      
      // For clique panning, we need to dispatch the event to the #container element
      // which is inside the clique-viewport's shadow DOM
      let panTarget = cliqueViewport;
      
      // Try to access the shadow DOM container
      if (cliqueViewport && cliqueViewport.shadowRoot) {
        const container = cliqueViewport.shadowRoot.querySelector('#container');
        if (container) {
          panTarget = container;
        }
      }
      
      // Fallback to the viewport element itself
      if (!panTarget) {
        panTarget = document.querySelector('clique-viewport') || document.body;
      }
      
      // Dispatch mousedown to start panning
      const mouseEvent = createMouseEvent('mousedown', touch, panTarget);
      panTarget.dispatchEvent(mouseEvent);
      return;
    }
  }

  function handleTouchMove(e) {
    // Check if we're touching a button during move - don't prevent default
    const isButton = e.target.tagName === 'BUTTON' || 
                     e.target.tagName === 'A' || 
                     e.target.hasAttribute('data-window-button') ||
                     e.target.closest('button') ||
                     e.target.closest('a');
    
    if (isButton && !isDragging && !canvasPanning) return;
    
    if (!isDragging && !canvasPanning) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    
    if (isDragging && dragTarget) {
      // Dispatch mousemove globally for dragging
      const mouseEvent = createMouseEvent('mousemove', touch);
      document.dispatchEvent(mouseEvent);
    } else if (canvasPanning) {
      // Dispatch mousemove globally for canvas panning
      const mouseEvent = createMouseEvent('mousemove', touch);
      document.dispatchEvent(mouseEvent);
    }
  }

  function handleTouchEnd(e) {
    if (!isDragging && !canvasPanning) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Dispatch mouseup globally
    const mouseEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      buttons: 0
    });
    document.dispatchEvent(mouseEvent);
    
    // Reset state
    isDragging = false;
    dragTarget = null;
    canvasPanning = false;
  }

  function addTouchListeners() {
    // Use capture phase to handle touch events before other handlers
    document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false, capture: true });
    
    // Prevent context menu on long press for draggable elements
    document.addEventListener('contextmenu', function(e) {
      if (e.target.closest('.touch-draggable') || e.target.closest('[data-clique-root]')) {
        e.preventDefault();
      }
    });
  }

  // Initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTouchListeners);
  } else {
    addTouchListeners();
  }
}

