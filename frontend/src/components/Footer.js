import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaPhone } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>RTI Connect</h3>
            <p className="footer-description">
              A digital platform for filing and tracking RTI applications online. 
              Making governance transparent and accessible to all citizens.
            </p>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About RTI</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>For Citizens</h4>
            <ul>
              <li><Link to="/submit-rti">Submit RTI</Link></li>
              <li><Link to="/track">Track Application</Link></li>
              <li><Link to="/templates">RTI Templates</Link></li>
              <li><Link to="/departments">Departments</Link></li>
              <li><Link to="/appeal">File Appeal</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul className="contact-info">
              <li>
                <FaEnvelope />
                <a href="mailto:support@rticonnect.gov.in">support@rticonnect.gov.in</a>
              </li>
              <li>
                <FaPhone />
                <a href="tel:+18001234567">Toll Free: 1800-123-4567</a>
              </li>
            </ul>
            <div className="office-hours">
              <p>Office Hours:</p>
              <p>Mon-Fri: 10:00 AM - 6:00 PM</p>
              <p>Sat: 10:00 AM - 2:00 PM</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/disclaimer">Disclaimer</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
          <p className="copyright">
            &copy; {new Date().getFullYear()} RTI Connect. All rights reserved.
          </p>
          <p className="version">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;