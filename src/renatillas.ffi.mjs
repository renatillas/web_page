// Touch support for clique-based dragging and viewport panning
export function initializeTouchSupport() {
  
  // Add mouse event handling for desktop
  function handleMouseDown(e) {
    // Check if we're clicking a button - don't prevent default to allow clicks
    const isButton = e.target.tagName === 'BUTTON' || 
                     e.target.tagName === 'A' || 
                     e.target.hasAttribute('data-window-button') ||
                     e.target.closest('button') ||
                     e.target.closest('a');
    
    if (isButton) {
      // Stop the event from reaching clique's drag system
      e.stopImmediatePropagation();
      return true; // Allow normal click behavior
    }
    return false;
  }
  
  // Add event listeners for mouse events at capture phase
  document.addEventListener('mousedown', handleMouseDown, { capture: true });
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