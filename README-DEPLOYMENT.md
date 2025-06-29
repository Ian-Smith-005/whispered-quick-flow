
# Diacare Deployment Guide

## Project Structure
This project combines React build tools with static HTML pages for optimal deployment.

### File Organization:
- `public/index.html` - Main landing page (static HTML)
- `public/login.html` - Login page (static HTML) 
- `public/register.html` - Registration page (static HTML)
- `public/dashboard.html` - Dashboard page (static HTML)
- `public/assets/` - All CSS, JS, and image assets

### Navigation Flow:
1. Landing page (`/` or `/index.html`) - Welcome page with company info
2. Register (`/register.html`) - User registration form
3. Login (`/login.html`) - User login form  
4. Dashboard (`/dashboard.html`) - Main diabetes management interface

### Key Features:
- Responsive design with Bootstrap 5
- Animated background bubbles
- Preloader animations
- Chart.js integration for health data visualization
- AI chat interface for meal analysis
- Mobile-friendly navigation

### To Deploy:
The project is configured to build and deploy all static assets properly. All HTML pages, CSS, JS, and images will be served correctly.

## Important Note:
**CRITICAL**: You need to add a `build:dev` script to package.json with the value "vite build --mode development" for Lovable deployment to work properly.
