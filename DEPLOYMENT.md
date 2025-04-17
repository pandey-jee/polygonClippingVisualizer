# Deployment Guide

This document provides instructions for deploying the Polygon Clipping Visualization Tool.

## Requirements

The project requires Python 3.11+ and the following dependencies:
- Flask (v3.1.0+)
- Flask-SQLAlchemy (v3.1.1+)
- Gunicorn (v23.0.0+)
- Email-validator (v2.2.0+)
- Psycopg2-binary (v2.9.10+)

## Local Deployment

To run this project locally:

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/polygon-clipping-visualization.git
   cd polygon-clipping-visualization
   ```

2. Create a virtual environment and install dependencies
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install flask flask-sqlalchemy gunicorn email-validator psycopg2-binary
   ```

3. Run the application
   ```bash
   python main.py
   ```

4. Access the application at `http://localhost:5000`

## Production Deployment

### Deploying to GitHub Pages (Static Frontend Only)

If you want to deploy just the frontend with static files:

1. Create a branch called `gh-pages`
2. Only include the HTML, CSS, JavaScript files and any other static assets
3. Push to GitHub

### Deploying to Heroku (Full Stack)

1. Create a `Procfile` with the following content:
   ```
   web: gunicorn main:app
   ```

2. Push to Heroku:
   ```bash
   git push heroku main
   ```

## Environment Variables

Set the following environment variables in your production environment:
- `SECRET_KEY` - For Flask session security
- `DATABASE_URL` - For database connection (if used)

## Troubleshooting

- If you encounter CORS issues, ensure you've properly set up CORS headers in your Flask application
- Make sure all JavaScript assets are properly loaded with correct paths
- Check browser console for JavaScript errors
- Verify that the backend server is running and accessible