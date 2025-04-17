/**
 * Animation Controller for Polygon Clipping Visualization
 * 
 * This file manages the GSAP animations for the step-by-step clipping process.
 */

class AnimationController {
  constructor(canvasManager, clipper) {
    this.canvasManager = canvasManager;
    this.clipper = clipper;
    this.stepByStepMode = false;
    this.timeline = null;
    this.currentStep = null;
    this.stepIndicator = document.getElementById('step-indicator');
    this.currentStepElement = document.getElementById('current-step');
  }
  
  /**
   * Toggle step-by-step mode
   * @param {Boolean} enabled - Whether step-by-step mode is enabled
   */
  setStepByStepMode(enabled) {
    this.stepByStepMode = enabled;
    
    if (enabled) {
      document.getElementById('nextStep').disabled = false;
    } else {
      document.getElementById('nextStep').disabled = true;
    }
  }
  
  /**
   * Update the step indicator with current progress
   * @param {String} message - The message to display
   */
  updateStepIndicator(message) {
    this.currentStepElement.textContent = message;
    
    // Pulse animation for step indicator
    gsap.fromTo(this.stepIndicator, 
      { opacity: 0.7, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }
  
  /**
   * Run the complete clipping animation
   */
  runClippingAnimation() {
    const subjectPolygon = this.canvasManager.subjectPolygon;
    const clippingPolygon = this.canvasManager.clippingPolygon;
    
    if (subjectPolygon.length < 3 || clippingPolygon.length < 3) {
      this.updateStepIndicator('Need both polygons to run clipping');
      return;
    }
    
    // Run the clipping algorithm to generate steps
    const resultPolygon = this.clipper.clip(subjectPolygon, clippingPolygon);
    
    // If in step-by-step mode, prepare for stepping through
    if (this.stepByStepMode) {
      this.clipper.resetSteps();
      this.updateStepIndicator('Step 1: Ready to start clipping');
      document.getElementById('nextStep').disabled = false;
      return;
    }
    
    // Otherwise, run the full animation
    this.runFullAnimation();
  }
  
  /**
   * Run the complete animation without step-by-step pauses
   */
  runFullAnimation() {
    const totalSteps = this.clipper.getTotalSteps();
    
    // Create a new timeline
    this.timeline = gsap.timeline({
      onComplete: () => {
        // Get the final result from the clipper
        console.log('Animation complete, getting final result');
        
        // Check if we have steps
        if (totalSteps === 0) {
          console.error('No clipping steps generated, something went wrong');
          this.updateStepIndicator('Error: No clipping result available');
          return;
        }
        
        // Access the last step's output
        const lastStep = this.clipper.getStep(totalSteps - 1);
        console.log('Last step:', lastStep);
        
        if (!lastStep || !lastStep.outputPolygon) {
          console.error('Invalid last step or missing output polygon');
          this.updateStepIndicator('Error: Invalid clipping result');
          return;
        }
        
        // Get the result polygon from the last step
        const resultPolygon = lastStep.outputPolygon;
        console.log('Final result polygon:', resultPolygon);
        
        // Check if we have a valid result
        if (!resultPolygon || resultPolygon.length < 3) {
          console.log('Result polygon is empty or invalid (less than 3 points)');
          this.updateStepIndicator('No intersection between polygons');
          return;
        }
        
        // Set the result polygon on the canvas
        this.canvasManager.setResultPolygon(resultPolygon);
        this.updateStepIndicator('Clipping complete! Final result polygon displayed');
        
        // Add a small delay and then highlight the result again
        setTimeout(() => {
          console.log('Highlighting final result');
          // Show a more dramatic final result
          this.canvasManager.drawHighlightedResult();
          
          // Create a flash effect to draw attention to the result
          const flashEffect = () => {
            // Flash outline
            this.canvasManager.ctx.save();
            this.canvasManager.ctx.lineWidth = 8;
            this.canvasManager.ctx.strokeStyle = 'white';
            this.canvasManager.ctx.beginPath();
            this.canvasManager.ctx.moveTo(resultPolygon[0].x, resultPolygon[0].y);
            for (let i = 1; i < resultPolygon.length; i++) {
              this.canvasManager.ctx.lineTo(resultPolygon[i].x, resultPolygon[i].y);
            }
            this.canvasManager.ctx.closePath();
            this.canvasManager.ctx.stroke();
            this.canvasManager.ctx.restore();
          };
          
          // Flash twice
          flashEffect();
          setTimeout(() => {
            this.canvasManager.drawHighlightedResult();
          }, 300);
        }, 500);
      }
    });
    
    // Starting animation
    this.updateStepIndicator('Starting Sutherland-Hodgman clipping...');
    
    // Process each step in the clipping algorithm
    for (let i = 0; i < totalSteps; i++) {
      const step = this.clipper.getStep(i);
      
      this.timeline.add(() => {
        this.canvasManager.render();
        
        // Highlight current clipping edge
        this.canvasManager.highlightClippingEdge(
          step.clipEdge.start, 
          step.clipEdge.end
        );
        
        this.updateStepIndicator(`Clipping against edge ${i + 1} of ${totalSteps}`);
      });
      
      // Pause for edge visualization
      this.timeline.to({}, { duration: 1 });
      
      // Show intersections if there are any
      if (step.intersections.length > 0) {
        this.timeline.add(() => {
          this.canvasManager.highlightIntersectionPoints(step.intersections);
          this.updateStepIndicator(`Found ${step.intersections.length} intersection(s)`);
        });
        
        // Pause for intersection points visualization
        this.timeline.to({}, { duration: 1 });
      }
      
      // Show intermediate result after this edge
      this.timeline.add(() => {
        const intermediateResult = step.outputPolygon;
        if (intermediateResult.length > 0) {
          this.canvasManager.setResultPolygon(intermediateResult);
          this.updateStepIndicator(`Intermediate result after edge ${i + 1}`);
        } else {
          this.canvasManager.setResultPolygon([]);
          this.updateStepIndicator(`No polygon remains after edge ${i + 1}`);
        }
      });
      
      // Pause before next step
      this.timeline.to({}, { duration: 1 });
    }
  }
  
  /**
   * Advance to the next step in step-by-step mode
   */
  nextStep() {
    if (!this.stepByStepMode) return;
    
    const step = this.clipper.getNextStep();
    if (!step) {
      // End of steps reached
      console.log('Step-by-step mode: End of steps reached');
      
      const totalSteps = this.clipper.getTotalSteps();
      
      // Check if we have steps
      if (totalSteps === 0) {
        console.error('No clipping steps available in step-by-step mode');
        this.updateStepIndicator('Error: No clipping result available');
        document.getElementById('nextStep').disabled = true;
        return;
      }
      
      // Access the last step
      const lastStep = this.clipper.getStep(totalSteps - 1);
      console.log('Last step in step-by-step mode:', lastStep);
      
      if (!lastStep || !lastStep.outputPolygon) {
        console.error('Invalid last step or missing output polygon in step-by-step mode');
        this.updateStepIndicator('Error: Invalid clipping result');
        document.getElementById('nextStep').disabled = true;
        return;
      }
      
      // Set the result polygon
      const resultPolygon = lastStep.outputPolygon;
      console.log('Final result polygon in step-by-step mode:', resultPolygon);
      
      // Check if we have a valid result
      if (!resultPolygon || resultPolygon.length < 3) {
        console.log('Result polygon is empty or invalid in step-by-step mode');
        this.updateStepIndicator('No intersection between polygons');
        document.getElementById('nextStep').disabled = true;
        return;
      }
      
      this.canvasManager.setResultPolygon(resultPolygon);
      this.updateStepIndicator('Clipping complete! Final result polygon displayed');
      document.getElementById('nextStep').disabled = true;
      
      // Highlight the result with a small delay
      setTimeout(() => {
        // Show a more dramatic final result
        this.canvasManager.drawHighlightedResult();
        
        // Create a flash effect to draw attention to the result
        const flashEffect = () => {
          // Flash outline
          this.canvasManager.ctx.save();
          this.canvasManager.ctx.lineWidth = 8;
          this.canvasManager.ctx.strokeStyle = 'white';
          this.canvasManager.ctx.beginPath();
          this.canvasManager.ctx.moveTo(resultPolygon[0].x, resultPolygon[0].y);
          for (let i = 1; i < resultPolygon.length; i++) {
            this.canvasManager.ctx.lineTo(resultPolygon[i].x, resultPolygon[i].y);
          }
          this.canvasManager.ctx.closePath();
          this.canvasManager.ctx.stroke();
          this.canvasManager.ctx.restore();
        };
        
        // Flash twice
        flashEffect();
        setTimeout(() => {
          this.canvasManager.drawHighlightedResult();
        }, 300);
      }, 500);
      return;
    }
    
    this.currentStep = step;
    const currentStepIndex = this.clipper.currentStepIndex;
    const totalSteps = this.clipper.getTotalSteps();
    
    // Clear canvas and redraw polygons
    this.canvasManager.render();
    
    // Step 1: Highlight the current clipping edge
    this.canvasManager.highlightClippingEdge(
      step.clipEdge.start, 
      step.clipEdge.end
    );
    
    this.updateStepIndicator(`Edge ${currentStepIndex + 1} of ${totalSteps}: Processing`);
    
    // Step 2: Highlight intersections after a delay
    setTimeout(() => {
      if (step.intersections.length > 0) {
        this.canvasManager.highlightIntersectionPoints(step.intersections);
        this.updateStepIndicator(`Edge ${currentStepIndex + 1}: Found ${step.intersections.length} intersection(s)`);
      }
      
      // Step 3: Show the output polygon for this edge after another delay
      setTimeout(() => {
        const intermediateResult = step.outputPolygon;
        if (intermediateResult.length > 0) {
          this.canvasManager.setResultPolygon(intermediateResult);
          this.updateStepIndicator(`Edge ${currentStepIndex + 1} complete (${intermediateResult.length} vertices)`);
        } else {
          this.canvasManager.setResultPolygon([]);
          this.updateStepIndicator(`Edge ${currentStepIndex + 1}: No polygon remains`);
        }
      }, 1000);
    }, 1000);
  }
  
  /**
   * Reset the animation controller
   */
  reset() {
    if (this.timeline) {
      this.timeline.kill();
    }
    
    this.clipper.resetSteps();
    this.currentStep = null;
    this.updateStepIndicator('Ready');
    document.getElementById('nextStep').disabled = true;
  }
}
