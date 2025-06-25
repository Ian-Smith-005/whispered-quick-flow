
import React, { useEffect } from 'react';
import '../styles/landing.css';

const LandingPage = () => {
  useEffect(() => {
    // Load the landing animation script
    const script = document.createElement('script');
    script.src = '/assets/js/landing.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container">
      <nav>
        <div className="nav__logo">Diacare</div>
        <ul className="nav__links">
          <li className="link">
            <a href="#features">Features</a>
          </li>
          <li className="link">
            <a href="#about">About</a>
          </li>
          <li className="link">
            <a href="#contact">Contact</a>
          </li>
        </ul>
        <div>
          <a href="/login.html">
            <button className="btn">Get Started</button>
          </a>
        </div>
      </nav>
      <header className="header">
        <div className="content">
          <h1>
            <span>Your Diabetes Care</span><br />
            Companion
          </h1>
          <p>
            Take control of your diabetes with AI-powered meal planning, glucose tracking,
            and personalized health insights. Join thousands of users managing their
            diabetes effectively with Diacare.
          </p>
          <a href="/login.html">
            <button className="btn">Start Your Journey</button>
          </a>
        </div>
        <div className="image">
          <div className="image__bg"></div>
          <img src="/assets/img/header-bg.png" alt="Diacare Dashboard" />
          <div className="image__content image__content__1">
            <span>📊</span>
            <div>
              <h4 id="diacare-count">1520+</h4>
              <p>Active Users</p>
            </div>
          </div>
          <div className="image__content image__content__2">
            <ul>
              <li>
                <span>✓</span>
                AI-Powered Meal Analysis
              </li>
              <li>
                <span>✓</span>
                Real-time Glucose Tracking
              </li>
              <li>
                <span>✓</span>
                Personalized Recommendations
              </li>
            </ul>
          </div>
        </div>
      </header>
    </div>
  );
};

export default LandingPage;
