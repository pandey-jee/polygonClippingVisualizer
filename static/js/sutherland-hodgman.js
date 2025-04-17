/**
 * Sutherland-Hodgman Polygon Clipping Algorithm Implementation
 * 
 * This file contains the implementation of the Sutherland-Hodgman algorithm
 * for clipping a subject polygon against a clipper polygon.
 */

class SutherlandHodgman {
  constructor() {
    this.steps = [];
    this.currentStepIndex = -1;
  }
  
  /**
   * Determine if a point is inside a clipping edge
   * @param {Object} point - The point to check
   * @param {Object} clipEdgeStart - Start point of clipping edge
   * @param {Object} clipEdgeEnd - End point of clipping edge
   * @returns {Boolean} - True if inside, false if outside
   */
  isInside(point, clipEdgeStart, clipEdgeEnd) {
    return (clipEdgeEnd.x - clipEdgeStart.x) * (point.y - clipEdgeStart.y) - 
           (clipEdgeEnd.y - clipEdgeStart.y) * (point.x - clipEdgeStart.x) <= 0;
  }
  
  /**
   * Calculate the intersection point of a polygon edge and a clipping edge
   * @param {Object} s - Start point of subject edge
   * @param {Object} e - End point of subject edge
   * @param {Object} clipStart - Start point of clipping edge
   * @param {Object} clipEnd - End point of clipping edge
   * @returns {Object} - The intersection point
   */
  computeIntersection(s, e, clipStart, clipEnd) {
    // Line equations: A1x + B1y + C1 = 0 and A2x + B2y + C2 = 0
    const A1 = e.y - s.y;
    const B1 = s.x - e.x;
    const C1 = e.x * s.y - s.x * e.y;
    
    const A2 = clipEnd.y - clipStart.y;
    const B2 = clipStart.x - clipEnd.x;
    const C2 = clipEnd.x * clipStart.y - clipStart.x * clipEnd.y;
    
    // Calculate determinant
    const det = A1 * B2 - A2 * B1;
    
    if (det === 0) {
      // Lines are parallel
      return null;
    }
    
    // Calculate intersection
    const x = (B1 * C2 - B2 * C1) / det;
    const y = (A2 * C1 - A1 * C2) / det;
    
    // Check if intersection is on both line segments
    const onSegment1 = this.isOnSegment({x, y}, s, e);
    const onSegment2 = this.isOnSegment({x, y}, clipStart, clipEnd);
    
    if (onSegment1 && onSegment2) {
      return {x, y};
    }
    
    return null;
  }
  
  /**
   * Check if a point is on a line segment
   * @param {Object} p - The point to check
   * @param {Object} s - Start point of segment
   * @param {Object} e - End point of segment
   * @returns {Boolean} - True if point is on the segment
   */
  isOnSegment(p, s, e) {
    return (p.x >= Math.min(s.x, e.x) && p.x <= Math.max(s.x, e.x)) &&
           (p.y >= Math.min(s.y, e.y) && p.y <= Math.max(s.y, e.y));
  }
  
  /**
   * Clip a subject polygon against one edge of the clipper polygon
   * @param {Array} subjectPolygon - Array of points in the subject polygon
   * @param {Object} clipEdgeStart - Start point of the clipping edge
   * @param {Object} clipEdgeEnd - End point of the clipping edge
   * @returns {Array} - The clipped polygon
   */
  clipAgainstEdge(subjectPolygon, clipEdgeStart, clipEdgeEnd) {
    const outputList = [];
    const edgeStepDetails = {
      clipEdge: {start: {...clipEdgeStart}, end: {...clipEdgeEnd}},
      inputPolygon: JSON.parse(JSON.stringify(subjectPolygon)),
      intersections: [],
      outputPolygon: [],
      actions: []
    };
    
    // No points to clip
    if (subjectPolygon.length === 0) {
      edgeStepDetails.outputPolygon = [];
      this.steps.push(edgeStepDetails);
      return [];
    }
    
    // Start with the last point of the subject polygon
    let s = subjectPolygon[subjectPolygon.length - 1];
    
    // Get inside/outside status of the last point
    let s_isInside = this.isInside(s, clipEdgeStart, clipEdgeEnd);
    
    // For each edge in the subject polygon
    for (let i = 0; i < subjectPolygon.length; i++) {
      let e = subjectPolygon[i];
      let e_isInside = this.isInside(e, clipEdgeStart, clipEdgeEnd);
      
      // Case 1: Both endpoints inside - add the second endpoint
      if (s_isInside && e_isInside) {
        outputList.push(e);
        edgeStepDetails.actions.push({
          type: 'ADD_VERTEX',
          vertex: {...e},
          reason: 'Both endpoints inside'
        });
      }
      // Case 2: Moving from outside to inside - add intersection point and the second endpoint
      else if (!s_isInside && e_isInside) {
        let intersection = this.computeIntersection(s, e, clipEdgeStart, clipEdgeEnd);
        if (intersection) {
          outputList.push(intersection);
          edgeStepDetails.intersections.push({...intersection});
          edgeStepDetails.actions.push({
            type: 'ADD_INTERSECTION',
            vertex: {...intersection},
            reason: 'Moving from outside to inside'
          });
        }
        outputList.push(e);
        edgeStepDetails.actions.push({
          type: 'ADD_VERTEX',
          vertex: {...e},
          reason: 'Second endpoint inside'
        });
      }
      // Case 3: Moving from inside to outside - add only the intersection point
      else if (s_isInside && !e_isInside) {
        let intersection = this.computeIntersection(s, e, clipEdgeStart, clipEdgeEnd);
        if (intersection) {
          outputList.push(intersection);
          edgeStepDetails.intersections.push({...intersection});
          edgeStepDetails.actions.push({
            type: 'ADD_INTERSECTION',
            vertex: {...intersection},
            reason: 'Moving from inside to outside'
          });
        }
      }
      // Case 4: Both endpoints outside - add nothing
      else {
        edgeStepDetails.actions.push({
          type: 'SKIP_VERTEX',
          vertex: {...e},
          reason: 'Both endpoints outside'
        });
      }
      
      // The current endpoint becomes the starting point for the next edge
      s = e;
      s_isInside = e_isInside;
    }
    
    edgeStepDetails.outputPolygon = JSON.parse(JSON.stringify(outputList));
    this.steps.push(edgeStepDetails);
    return outputList;
  }
  
  /**
   * Clip a subject polygon against all edges of a clipper polygon
   * @param {Array} subjectPolygon - Array of points in the subject polygon
   * @param {Array} clipPolygon - Array of points in the clipper polygon
   * @returns {Array} - The clipped polygon
   */
  clip(subjectPolygon, clipPolygon) {
    this.steps = [];
    this.currentStepIndex = -1;
    
    // Handle edge cases
    if (subjectPolygon.length < 3 || clipPolygon.length < 3) {
      return [];
    }
    
    let outputList = [...subjectPolygon];
    
    // For each edge in the clipper polygon
    for (let i = 0; i < clipPolygon.length; i++) {
      const start = clipPolygon[i];
      const end = clipPolygon[(i + 1) % clipPolygon.length];
      
      outputList = this.clipAgainstEdge(outputList, start, end);
    }
    
    return outputList;
  }
  
  /**
   * Get the total number of steps in the clipping process
   * @returns {Number} - The number of steps
   */
  getTotalSteps() {
    return this.steps.length;
  }
  
  /**
   * Get a specific step in the clipping process
   * @param {Number} index - The step index
   * @returns {Object} - The step details
   */
  getStep(index) {
    if (index < 0 || index >= this.steps.length) {
      return null;
    }
    return this.steps[index];
  }
  
  /**
   * Get the next step in the clipping process
   * @returns {Object} - The next step details
   */
  getNextStep() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      return this.steps[this.currentStepIndex];
    }
    return null;
  }
  
  /**
   * Reset the current step index
   */
  resetSteps() {
    this.currentStepIndex = -1;
  }
  
  /**
   * Get the current step in the clipping process
   * @returns {Object} - The current step details
   */
  getCurrentStep() {
    if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
      return this.steps[this.currentStepIndex];
    }
    return null;
  }
}
