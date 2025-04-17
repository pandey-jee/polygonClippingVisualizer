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
    // Vector cross product to determine if point is to the left of the directed edge
    // For the edge vector (edge_x, edge_y) and point vector from start to point (point_x, point_y)
    // The sign of edge_x * point_y - edge_y * point_x determines which side the point is on
    const edge_x = clipEdgeEnd.x - clipEdgeStart.x;
    const edge_y = clipEdgeEnd.y - clipEdgeStart.y;
    const point_x = point.x - clipEdgeStart.x;
    const point_y = point.y - clipEdgeStart.y;
    
    // Cross product: if positive, point is on the inside (left of directed edge)
    return (edge_x * point_y - edge_y * point_x) >= 0;
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
    
    if (Math.abs(det) < 1e-8) {
      // Lines are parallel or coincident
      return null;
    }
    
    // Calculate intersection
    const x = (B1 * C2 - B2 * C1) / det;
    const y = (A2 * C1 - A1 * C2) / det;
    
    // Check if intersection is on both line segments
    if (this.isOnSegment({x, y}, s, e) && this.isOnSegment({x, y}, clipStart, clipEnd)) {
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
    const epsilon = 1e-8; // Small value to account for floating point precision
    
    // Check if point is within the bounding box of the segment
    if (p.x < Math.min(s.x, e.x) - epsilon || p.x > Math.max(s.x, e.x) + epsilon ||
        p.y < Math.min(s.y, e.y) - epsilon || p.y > Math.max(s.y, e.y) + epsilon) {
      return false;
    }
    
    // If the segment is vertical
    if (Math.abs(s.x - e.x) < epsilon) {
      return Math.abs(p.x - s.x) < epsilon;
    }
    
    // If the segment is horizontal
    if (Math.abs(s.y - e.y) < epsilon) {
      return Math.abs(p.y - s.y) < epsilon;
    }
    
    // Check if point lies on the line segment using the line equation
    // Confirm point is on the line by checking the slope
    const slope1 = (p.y - s.y) / (p.x - s.x);
    const slope2 = (e.y - s.y) / (e.x - s.x);
    return Math.abs(slope1 - slope2) < epsilon;
  }
  
  /**
   * Clip a subject polygon against one edge of the clipper polygon
   * @param {Array} subjectPolygon - Array of points in the subject polygon
   * @param {Object} clipEdgeStart - Start point of the clipping edge
   * @param {Object} clipEdgeEnd - End point of the clipping edge
   * @returns {Array} - The clipped polygon
   */
  clipAgainstEdge(subjectPolygon, clipEdgeStart, clipEdgeEnd) {
    // Early return if not enough points
    if (subjectPolygon.length < 3) {
      return [];
    }
    
    const outputList = [];
    
    // Create step details for animation
    const edgeStepDetails = {
      clipEdge: {
        start: {...clipEdgeStart},
        end: {...clipEdgeEnd}
      },
      inputPolygon: JSON.parse(JSON.stringify(subjectPolygon)),
      outputPolygon: [],
      intersections: [],
      actions: []
    };
    
    // For each edge in the subject polygon
    for (let i = 0; i < subjectPolygon.length; i++) {
      // Get the current edge
      const currentPoint = subjectPolygon[i];
      const nextPoint = subjectPolygon[(i + 1) % subjectPolygon.length];
      
      // Determine if the current points are inside the clipping edge
      const currentInside = this.isInside(currentPoint, clipEdgeStart, clipEdgeEnd);
      const nextInside = this.isInside(nextPoint, clipEdgeStart, clipEdgeEnd);
      
      // Case 1: Both points inside - add the second point
      if (currentInside && nextInside) {
        outputList.push({...nextPoint});
        edgeStepDetails.actions.push({
          type: 'ADD_VERTEX',
          vertex: {...nextPoint},
          reason: 'Both endpoints inside'
        });
      } 
      // Case 2: First point inside, second point outside - add the intersection
      else if (currentInside && !nextInside) {
        const intersection = this.computeIntersection(
          currentPoint, nextPoint, clipEdgeStart, clipEdgeEnd
        );
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
      // Case 3: First point outside, second point inside - add the intersection and the second point
      else if (!currentInside && nextInside) {
        const intersection = this.computeIntersection(
          currentPoint, nextPoint, clipEdgeStart, clipEdgeEnd
        );
        if (intersection) {
          outputList.push(intersection);
          edgeStepDetails.intersections.push({...intersection});
          edgeStepDetails.actions.push({
            type: 'ADD_INTERSECTION',
            vertex: {...intersection},
            reason: 'Moving from outside to inside'
          });
        }
        outputList.push({...nextPoint});
        edgeStepDetails.actions.push({
          type: 'ADD_VERTEX',
          vertex: {...nextPoint},
          reason: 'Second endpoint inside'
        });
      }
      // Case 4: Both points outside - add nothing
      else {
        edgeStepDetails.actions.push({
          type: 'SKIP_VERTEX',
          vertex: {...nextPoint},
          reason: 'Both endpoints outside'
        });
      }
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
    // Reset steps for animation
    this.steps = [];
    this.currentStepIndex = -1;
    
    // Validate inputs - both polygons must have at least 3 points
    if (!subjectPolygon || !clipPolygon || 
        subjectPolygon.length < 3 || clipPolygon.length < 3) {
      console.log("Invalid polygons for clipping");
      return [];
    }
    
    // Start with the subject polygon
    let outputList = [...subjectPolygon];
    
    // Debug
    console.log("Initial polygon:", JSON.stringify(outputList));
    
    // Clip against each edge of the clipping polygon
    for (let i = 0; i < clipPolygon.length; i++) {
      const clipEdgeStart = clipPolygon[i];
      const clipEdgeEnd = clipPolygon[(i + 1) % clipPolygon.length];
      
      console.log(`Clipping against edge ${i}: ${JSON.stringify(clipEdgeStart)} to ${JSON.stringify(clipEdgeEnd)}`);
      
      // For each edge, clip the current output list
      outputList = this.clipAgainstEdge(outputList, clipEdgeStart, clipEdgeEnd);
      
      // Debug the interim result
      console.log(`After edge ${i}, result: ${JSON.stringify(outputList)}`);
      
      // If at any point we have no points left, exit early
      if (outputList.length < 3) {
        console.log("No intersection found - exiting early");
        return [];
      }
    }
    
    // Log the final result
    console.log("Final clipped polygon:", JSON.stringify(outputList));
    
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
