import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');
    const currentYear = new Date().getFullYear();

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            toast.success('Feature coming soon! Thank you for your interest.');
            setEmail('');
        } else {
            toast.error('Please enter your email address');
        }
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Logo and Tagline */}
                <div className="footer-section">
                    <div className="footer-logo">
                        <span className="material-symbols-outlined">work</span>
                        <span className="footer-logo-text">Smart<span className="footer-logo-highlight">Hire</span></span>
                    </div>
                    <p className="footer-tagline">
                        Building the future of work through intelligent matching and editorial precision.
                    </p>
                    <p className="footer-tagline">Find the talent you deserve.</p>
                </div>

                {/* Platform Links */}
                <div className="footer-section">
                    <h3 className="footer-section-title">PLATFORM</h3>
                    <ul className="footer-links">
                        <li><a href="#" className="footer-link">Find Jobs</a></li>
                        <li><a href="#" className="footer-link">Browse Companies</a></li>
                        <li><a href="#" className="footer-link">Salaries</a></li>
                        <li><a href="#" className="footer-link">Career Advice</a></li>
                    </ul>
                </div>

                {/* For Employers Links */}
                <div className="footer-section">
                    <h3 className="footer-section-title">FOR EMPLOYERS</h3>
                    <ul className="footer-links">
                        <li><a href="#" className="footer-link">Post a Job</a></li>
                        <li><a href="#" className="footer-link">Hiring Solutions</a></li>
                        <li><a href="#" className="footer-link">Pricing</a></li>
                        <li><a href="#" className="footer-link">Resources</a></li>
                    </ul>
                </div>

                {/* Support Links */}
                <div className="footer-section">
                    <h3 className="footer-section-title">SUPPORT</h3>
                    <ul className="footer-links">
                        <li><a href="#" className="footer-link">Help Center</a></li>
                        <li><a href="#" className="footer-link">Privacy Policy</a></li>
                        <li><a href="#" className="footer-link">Terms of Service</a></li>
                        <li><a href="#" className="footer-link">Cookie Policy</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar with Newsletter, Social, Copyright */}
            <div className="footer-bottom">
                <div className="footer-bottom-container">
                    {/* Newsletter */}
                    <div className="footer-newsletter">
                        <h3 className="newsletter-title">Subscribe to our newsletter</h3>
                        <form onSubmit={handleSubscribe} className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="newsletter-input"
                                required
                            />
                            <button type="submit" className="newsletter-btn">Subscribe</button>
                        </form>
                    </div>

                    {/* Social Icons */}
                    <div className="footer-social">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57 4.765-1.587 8.205-6.085 8.205-11.387 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                            </svg>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                            </svg>
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="footer-copyright">
                        <p>© {currentYear} SMARTHIRE. ALL RIGHTS RESERVED.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;