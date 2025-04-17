/**
 * Canvas Handling
 * 
 * This file manages the canvas drawing and user interactions like
 * drawing polygons, highlighting edges, and rendering the results.
 */

class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.subjectPolygon = []; // Cyan polygon to be clipped
    this.clippingPolygon = []; // Yellow clipping boundary
    this.resultPolygon = []; // Green result after clipping
    
    this.selectedPolygon = null; // Which polygon we're currently drawing
    this.isDrawing = false;
    this.hoverPoint = null;
    this.snapDistance = 15; // Pixel distance for vertex snapping
    this.snapToFirstDistance = 20; // Distance to snap to first point to close the polygon
    
    this.colors = {
      subject: 'rgba(0, 128, 255, 0.7)',      // Blue for subject polygon
      clipping: 'rgba(255, 128, 0, 0.7)',     // Orange for clipping window
      result: 'rgba(0, 204, 0, 0.9)',         // Green for result
      resultStroke: 'rgba(0, 204, 0, 1)',     // Solid green for result stroke
      resultGlow: 'rgba(0, 204, 0, 1)',       // Green glow
      background: 'rgba(16, 24, 32, 1)',      // Dark background
      grid: 'rgba(50, 60, 70, 0.2)',          // Subtle grid lines
      pointHighlight: 'rgba(255, 255, 255, 0.9)',
      edgeHighlight: 'rgba(255, 255, 0, 0.9)' // Yellow for edge highlight
    };
    
    this.resize();
    this.setupEventListeners();
    this.initializeCanvas();
  }
  
  /**
   * Set up the canvas size according to container
   */
  resize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.render(); // Re-render after resize
  }
  
  /**
   * Initialize canvas with background and grid
   */
  initializeCanvas() {
    this.clear();
    this.drawGrid();
  }
  
  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Draw a grid on the canvas
   */
  drawGrid() {
    const gridSize = 30;
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  /**
   * Start drawing a specific polygon
   * @param {String} polygonType - "subject" or "clipping"
   */
  startDrawingPolygon(polygonType) {
    console.log(`Starting to draw ${polygonType} polygon`);
    this.selectedPolygon = polygonType;
    this.isDrawing = true;
    
    if (polygonType === 'subject') {
      console.log('Resetting subject polygon array');
      this.subjectPolygon = [];
    } else if (polygonType === 'clipping') {
      console.log('Resetting clipping polygon array');
      this.clippingPolygon = [];
    }
    
    this.resultPolygon = []; // Clear result when starting a new drawing
    
    document.getElementById('runClipping').disabled = true;
    this.updateCoordinateDisplay();
    this.render();
    
    console.log(`Drawing mode active: ${this.isDrawing}, selected polygon: ${this.selectedPolygon}`);
  }
  
  /**
   * Complete the current polygon being drawn
   */
  finishPolygon() {
    if (!this.isDrawing || (this.selectedPolygon === 'subject' && this.subjectPolygon.length < 3) || 
        (this.selectedPolygon === 'clipping' && this.clippingPolygon.length < 3)) {
      return;
    }
    
    const completedPolygonType = this.selectedPolygon; // Store which polygon we just completed
    this.isDrawing = false;
    this.selectedPolygon = null;
    
    // Enable the run clipping button if both polygons are complete
    if (this.subjectPolygon.length >= 3 && this.clippingPolygon.length >= 3) {
      document.getElementById('runClipping').disabled = false;
    }
    
    // Update button state back to ready state
    // Dispatch a custom event that script.js can listen for
    const event = new CustomEvent('polygonCompleted', { 
      detail: { 
        polygonType: completedPolygonType,
        subjectComplete: this.subjectPolygon.length >= 3,
        clippingComplete: this.clippingPolygon.length >= 3
      } 
    });
    document.dispatchEvent(event);
    
    this.updateCoordinateDisplay();
    this.render();
  }
  
  /**
   * Reset the canvas and all polygons
   */
  reset() {
    this.subjectPolygon = [];
    this.clippingPolygon = [];
    this.resultPolygon = [];
    this.selectedPolygon = null;
    this.isDrawing = false;
    
    document.getElementById('runClipping').disabled = true;
    document.getElementById('nextStep').disabled = true;
    
    this.updateCoordinateDisplay();
    this.initializeCanvas();
  }
  
  /**
   * Add a point to the currently selected polygon
   * @param {Number} x - X coordinate
   * @param {Number} y - Y coordinate
   */
  addPoint(x, y) {
    if (!this.isDrawing || !this.selectedPolygon) {
      return;
    }
    
    const point = { x, y };
    
    // Check if we're near the first point to close the polygon
    if (this.selectedPolygon === 'subject' && this.subjectPolygon.length > 2) {
      const firstPoint = this.subjectPolygon[0];
      if (this.getDistance(point, firstPoint) < this.snapToFirstDistance) {
        this.finishPolygon();
        return;
      }
    } else if (this.selectedPolygon === 'clipping' && this.clippingPolygon.length > 2) {
      const firstPoint = this.clippingPolygon[0];
      if (this.getDistance(point, firstPoint) < this.snapToFirstDistance) {
        this.finishPolygon();
        return;
      }
    }
    
    // Add point to the selected polygon
    if (this.selectedPolygon === 'subject') {
      this.subjectPolygon.push(point);
    } else if (this.selectedPolygon === 'clipping') {
      this.clippingPolygon.push(point);
    }
    
    this.updateCoordinateDisplay();
    this.render();
  }
  
  /**
   * Calculate distance between two points
   * @param {Object} p1 - First point
   * @param {Object} p2 - Second point
   * @returns {Number} - Distance between the points
   */
  getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  
  /**
   * Set up mouse and touch event listeners
   */
  setupEventListeners() {
    console.log('Setting up canvas event listeners');
    
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      console.log('Canvas mousedown event triggered');
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      console.log(`Adding point at (${x}, ${y})`);
      this.addPoint(x, y);
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update hover point for snapping indication
      this.hoverPoint = { x, y };
      this.render();
    });
    
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      console.log('Canvas touchstart event triggered');
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      console.log(`Adding touch point at (${x}, ${y})`);
      this.addPoint(x, y);
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      this.resize();
    });
    
    console.log('Canvas event listeners setup complete');
  }
  
  /**
   * Draw a polygon on the canvas
   * @param {Array} points - Array of points to draw
   * @param {String} color - Color to use for the polygon
   * @param {Boolean} filled - Whether to fill the polygon
   * @param {Number} lineWidth - Width of the polygon lines
   */
  drawPolygon(points, color, filled = true, lineWidth = 2) {
    if (points.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    if (points.length > 2) {
      this.ctx.closePath();
    }
    
    if (filled) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }
  
  /**
   * Draw a point on the canvas
   * @param {Object} point - The point to draw
   * @param {String} color - Color to use for the point
   * @param {Number} radius - Radius of the point
   */
  drawPoint(point, color, radius = 5) {
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
  
  /**
   * Render the canvas with all polygons and current state
   */
  render() {
    this.clear();
    this.drawGrid();
    
    // Draw the result polygon if available
    if (this.resultPolygon.length > 2) {
      // Draw with thicker line and glow effect
      this.ctx.save();
      this.ctx.shadowColor = this.colors.resultGlow;
      this.ctx.shadowBlur = 10;
      this.drawPolygon(this.resultPolygon, this.colors.result, true, 3);
      this.ctx.restore();
      
      // Draw points for the result
      this.resultPolygon.forEach(point => {
        this.drawPoint(point, this.colors.resultStroke, 6);
      });
    }
    
    // Draw the subject polygon
    if (this.subjectPolygon.length > 0) {
      this.drawPolygon(this.subjectPolygon, this.colors.subject, 
        this.subjectPolygon.length > 2);
      
      // Draw points
      this.subjectPolygon.forEach(point => {
        this.drawPoint(point, this.colors.subject);
      });
    }
    
    // Draw the clipping polygon
    if (this.clippingPolygon.length > 0) {
      this.drawPolygon(this.clippingPolygon, this.colors.clipping, 
        this.clippingPolygon.length > 2);
      
      // Draw points
      this.clippingPolygon.forEach(point => {
        this.drawPoint(point, this.colors.clipping);
      });
    }
    
    // Draw the hover point indicator during drawing
    if (this.isDrawing && this.hoverPoint) {
      let shouldDrawSnap = false;
      let snapPoint = null;
      
      // Check for snapping to first point to close polygon
      if (this.selectedPolygon === 'subject' && this.subjectPolygon.length > 2) {
        const firstPoint = this.subjectPolygon[0];
        if (this.getDistance(this.hoverPoint, firstPoint) < this.snapToFirstDistance) {
          shouldDrawSnap = true;
          snapPoint = firstPoint;
        }
      } else if (this.selectedPolygon === 'clipping' && this.clippingPolygon.length > 2) {
        const firstPoint = this.clippingPolygon[0];
        if (this.getDistance(this.hoverPoint, firstPoint) < this.snapToFirstDistance) {
          shouldDrawSnap = true;
          snapPoint = firstPoint;
        }
      }
      
      if (shouldDrawSnap && snapPoint) {
        // Draw snap indication
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 5]);
        this.ctx.moveTo(this.hoverPoint.x, this.hoverPoint.y);
        this.ctx.lineTo(snapPoint.x, snapPoint.y);
        this.ctx.strokeStyle = this.colors.pointHighlight;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Highlight first point
        this.drawPoint(snapPoint, this.colors.pointHighlight, 7);
      } else {
        // Draw normal hover point
        this.drawPoint(this.hoverPoint, 
          this.selectedPolygon === 'subject' ? this.colors.subject : this.colors.clipping, 
          3);
      }
      
      // Draw line from last point to current mouse position
      if (this.selectedPolygon === 'subject' && this.subjectPolygon.length > 0) {
        const lastPoint = this.subjectPolygon[this.subjectPolygon.length - 1];
        this.ctx.beginPath();
        this.ctx.moveTo(lastPoint.x, lastPoint.y);
        this.ctx.lineTo(this.hoverPoint.x, this.hoverPoint.y);
        this.ctx.strokeStyle = this.colors.subject;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      } else if (this.selectedPolygon === 'clipping' && this.clippingPolygon.length > 0) {
        const lastPoint = this.clippingPolygon[this.clippingPolygon.length - 1];
        this.ctx.beginPath();
        this.ctx.moveTo(lastPoint.x, lastPoint.y);
        this.ctx.lineTo(this.hoverPoint.x, this.hoverPoint.y);
        this.ctx.strokeStyle = this.colors.clipping;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    }
  }
  
  /**
   * Highlight a clipping edge during animation
   * @param {Object} start - Start point of the edge
   * @param {Object} end - End point of the edge
   */
  highlightClippingEdge(start, end) {
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.strokeStyle = this.colors.edgeHighlight;
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    
    // Highlight the edge's points
    this.drawPoint(start, this.colors.edgeHighlight, 7);
    this.drawPoint(end, this.colors.edgeHighlight, 7);
  }
  
  /**
   * Highlight intersection points during animation
   * @param {Array} points - Array of intersection points
   */
  highlightIntersectionPoints(points) {
    points.forEach(point => {
      this.drawPoint(point, 'rgba(255, 255, 255, 0.9)', 7);
      
      // Draw a pulsing circle around the intersection
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.setLineDash([2, 2]);
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    });
  }
  
  /**
   * Update the coordinate displays in the sidebar
   */
  updateCoordinateDisplay() {
    // Update subject polygon coordinates
    const subjectCoordinatesEl = document.getElementById('subject-coordinates');
    if (this.subjectPolygon.length > 0) {
      let html = '';
      this.subjectPolygon.forEach((point, index) => {
        html += `<div class="coordinate-item">
          <span>Point ${index + 1}</span>
          <span>(${Math.round(point.x)}, ${Math.round(point.y)})</span>
        </div>`;
      });
      subjectCoordinatesEl.innerHTML = html;
    } else {
      subjectCoordinatesEl.innerHTML = '<p class="empty-state">Draw a subject polygon to see coordinates</p>';
    }
    
    // Update clipping polygon coordinates
    const clippingCoordinatesEl = document.getElementById('clipping-coordinates');
    if (this.clippingPolygon.length > 0) {
      let html = '';
      this.clippingPolygon.forEach((point, index) => {
        html += `<div class="coordinate-item">
          <span>Point ${index + 1}</span>
          <span>(${Math.round(point.x)}, ${Math.round(point.y)})</span>
        </div>`;
      });
      clippingCoordinatesEl.innerHTML = html;
    } else {
      clippingCoordinatesEl.innerHTML = '<p class="empty-state">Draw a clipping polygon to see coordinates</p>';
    }
    
    // Update result polygon coordinates
    const resultCoordinatesEl = document.getElementById('result-coordinates');
    if (this.resultPolygon.length > 0) {
      let html = '';
      this.resultPolygon.forEach((point, index) => {
        html += `<div class="coordinate-item">
          <span>Point ${index + 1}</span>
          <span>(${Math.round(point.x)}, ${Math.round(point.y)})</span>
        </div>`;
      });
      resultCoordinatesEl.innerHTML = html;
    } else {
      resultCoordinatesEl.innerHTML = '<p class="empty-state">Run clipping to see result coordinates</p>';
    }
  }
  
  /**
   * Set the result polygon after clipping
   * @param {Array} resultPolygon - The clipped polygon result
   */
  setResultPolygon(resultPolygon) {
    this.resultPolygon = resultPolygon;
    this.updateCoordinateDisplay();
    
    // Create a highlight animation for the result
    this.drawHighlightedResult();
    
    // Manually show the result tab content
    // First, hide all tabs and remove active class
    const tabs = document.querySelectorAll('.tab');
    const dataPanels = document.querySelectorAll('.data-panel');
    
    tabs.forEach(t => t.classList.remove('active'));
    dataPanels.forEach(panel => panel.classList.remove('active'));
    
    // Then activate the result tab and its panel
    const resultTab = document.querySelector('[data-tab="result"]');
    const resultPanel = document.getElementById('result-data');
    
    if (resultTab) {
      resultTab.classList.add('active');
    }
    
    if (resultPanel) {
      resultPanel.classList.add('active');
    }
    
    // Make sure the result coordinates are properly filled
    this.updateCoordinateDisplay();
    
    // Log for debugging
    console.log('Result polygon set:', this.resultPolygon.length, 'points');
  }
  
  /**
   * Draw a highlighted animation for the result polygon
   */
  drawHighlightedResult() {
    // Clear the canvas
    this.clear();
    this.drawGrid();
    
    // Ensure we have a result to highlight
    if (!this.resultPolygon || this.resultPolygon.length < 3) return;
    
    // Draw original polygons with reduced opacity
    this.ctx.globalAlpha = 0.3;
    if (this.subjectPolygon.length > 2) {
      this.drawPolygon(this.subjectPolygon, this.colors.subject, true, 1);
    }
    if (this.clippingPolygon.length > 2) {
      this.drawPolygon(this.clippingPolygon, this.colors.clipping, true, 1);
    }
    this.ctx.globalAlpha = 1.0;
    
    // Draw the result with enhanced appearance
    this.ctx.save();
    // Create a strong glow effect
    this.ctx.shadowColor = this.colors.resultGlow;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Draw a filled result polygon with thick border
    this.drawPolygon(this.resultPolygon, this.colors.result, true, 4);
    
    // Draw result points with larger radius for emphasis
    this.resultPolygon.forEach(point => {
      this.drawPoint(point, this.colors.resultStroke, 8);
    });
    this.ctx.restore();
    
    // Add a prominent "FINAL RESULT" text label
    if (this.resultPolygon.length > 0) {
      // Calculate center of result polygon
      let centerX = 0, centerY = 0;
      this.resultPolygon.forEach(point => {
        centerX += point.x;
        centerY += point.y;
      });
      centerX /= this.resultPolygon.length;
      centerY /= this.resultPolygon.length;
      
      // Draw text shadow for better visibility
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Draw shadow first
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillText('FINAL RESULT', centerX + 2, centerY + 2);
      
      // Draw main text
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText('FINAL RESULT', centerX, centerY);
    }
  }
}
