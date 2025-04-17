/**
 * Main Script File
 * 
 * This file initializes the application and sets up event listeners
 * for UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the canvas manager
  const canvasManager = new CanvasManager('clipCanvas');
  
  // Initialize the polygon clipper
  const clipper = new SutherlandHodgman();
  
  // Initialize the animation controller
  const animationController = new AnimationController(canvasManager, clipper);
  
  // UI Elements
  const drawSubjectBtn = document.getElementById('drawSubject');
  const drawClippingBtn = document.getElementById('drawClipping');
  const runClippingBtn = document.getElementById('runClipping');
  const resetCanvasBtn = document.getElementById('resetCanvas');
  const stepByStepToggle = document.getElementById('stepByStep');
  const nextStepBtn = document.getElementById('nextStep');
  const tabs = document.querySelectorAll('.tab');
  const dataPanels = document.querySelectorAll('.data-panel');
  
  // Set up event listeners for tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and panels
      tabs.forEach(t => t.classList.remove('active'));
      dataPanels.forEach(panel => panel.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding panel
      tab.classList.add('active');
      const panelId = `${tab.dataset.tab}-data`;
      document.getElementById(panelId).classList.add('active');
    });
  });
  
  // Button event listeners
  drawSubjectBtn.addEventListener('click', () => {
    canvasManager.startDrawingPolygon('subject');
    updateButtonState('drawingSubject');
  });
  
  drawClippingBtn.addEventListener('click', () => {
    canvasManager.startDrawingPolygon('clipping');
    updateButtonState('drawingClipping');
  });
  
  runClippingBtn.addEventListener('click', () => {
    animationController.runClippingAnimation();
    updateButtonState('running');
  });
  
  resetCanvasBtn.addEventListener('click', () => {
    canvasManager.reset();
    animationController.reset();
    updateButtonState('default');
  });
  
  stepByStepToggle.addEventListener('change', (e) => {
    animationController.setStepByStepMode(e.target.checked);
  });
  
  nextStepBtn.addEventListener('click', () => {
    animationController.nextStep();
  });
  
  /**
   * Update button states based on application state
   * @param {String} state - The current app state
   */
  function updateButtonState(state) {
    switch(state) {
      case 'default':
        drawSubjectBtn.disabled = false;
        drawClippingBtn.disabled = false;
        runClippingBtn.disabled = true;
        nextStepBtn.disabled = true;
        break;
        
      case 'drawingSubject':
        drawSubjectBtn.disabled = true;
        drawClippingBtn.disabled = true;
        runClippingBtn.disabled = true;
        nextStepBtn.disabled = true;
        break;
        
      case 'drawingClipping':
        drawSubjectBtn.disabled = true;
        drawClippingBtn.disabled = true;
        runClippingBtn.disabled = true;
        nextStepBtn.disabled = true;
        break;
        
      case 'running':
        drawSubjectBtn.disabled = true;
        drawClippingBtn.disabled = true;
        runClippingBtn.disabled = true;
        if (!stepByStepToggle.checked) {
          nextStepBtn.disabled = true;
        }
        break;
        
      case 'ready':
        drawSubjectBtn.disabled = false;
        drawClippingBtn.disabled = false;
        runClippingBtn.disabled = false;
        nextStepBtn.disabled = true;
        break;
    }
  }
  
  // Add GSAP-powered intro animation
  function runIntroAnimation() {
    // Canvas container animation
    gsap.from('.canvas-container', {
      opacity: 0,
      x: -50,
      duration: 1,
      ease: 'power3.out'
    });
    
    // Control panel animation
    gsap.from('.control-section', {
      opacity: 0,
      x: 50,
      duration: 1,
      ease: 'power3.out'
    });
    
    // Header animation
    gsap.from('header h1', {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: 'power2.out'
    });
    
    gsap.from('header .subtitle', {
      opacity: 0,
      y: -10,
      duration: 0.8,
      delay: 0.3,
      ease: 'power2.out'
    });
    
    // Button staggered animation
    gsap.from('.neon-button', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.5,
      ease: 'back.out'
    });
  }
  
  // Run intro animation on page load
  runIntroAnimation();
  
  // Use GSAP for periodic glow animation on the canvas border
  function animateCanvasBorder() {
    gsap.to('canvas', {
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.6)',
      duration: 1.5,
      repeat: -1,
      yoyo: true
    });
  }
  
  animateCanvasBorder();
});
