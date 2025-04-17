# Polygon Clipping Visualization Tool

An interactive visualization tool that demonstrates the Sutherland-Hodgman polygon clipping algorithm with dynamic animations and step-by-step visualization.

## Features

- Interactive drawing of subject and clipping polygons
- Real-time visualization of the Sutherland-Hodgman clipping algorithm
- Step-by-step mode to understand each stage of the clipping process
- Detailed coordinate display for all polygons
- Responsive design that works on various screen sizes

## Technologies Used

- JavaScript for core polygon manipulation
- HTML5 Canvas for rendering
- GSAP for smooth animations
- Flask backend for serving the application
- Responsive web design principles

## How to Use

1. Click "Draw Subject Polygon" to create the blue polygon (the one to be clipped)
2. Draw your subject polygon by clicking points on the canvas
3. Finish the polygon by clicking near the first point
4. Click "Draw Clipping Polygon" to create the orange boundary polygon
5. Draw your clipping polygon (the boundary)
6. Click "Run Clipping" to see the algorithm in action
7. Toggle "Step-by-Step" to watch the algorithm proceed one edge at a time
8. Use the tabs to view coordinates for all polygons
9. Click "Reset Canvas" to start over

## Algorithm Details

This visualization implements the Sutherland-Hodgman polygon clipping algorithm, which works by:

1. Taking a subject polygon (what you want to clip) and a clipping polygon (the boundary)
2. For each edge of the clipping polygon, it clips the subject polygon against that edge
3. This process continues until all edges have been processed
4. The result is the intersection of the two polygons

## Local Development

To run this project locally:

```bash
# Clone the repository
git clone https://github.com/your-username/polygon-clipping-visualization.git

# Navigate to the project directory
cd polygon-clipping-visualization

# Install dependencies
pip install -r requirements.txt

# Run the Flask application
python main.py
```

The application will be available at `http://localhost:5000`.

## License

MIT License

## Credits

- Sutherland-Hodgman algorithm implementation based on the classic computer graphics algorithm developed by Ivan Sutherland and Gary Hodgman in 1974.
- Created as an educational tool for teaching computational geometry concepts.