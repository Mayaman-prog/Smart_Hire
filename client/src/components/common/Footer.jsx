import { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setEmail('');
    }
  };

  return (
    <>
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in">
              Feature coming soon! 🚀
            </div>
          )}

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Column 1 - Brand Section */}
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">SmartHire</h3>
              <p className="text-gray-300 text-sm mb-4">
                Building the future of work through intelligent matching and editorial precision. 
                Find the talent you deserve.
              </p>
              <div className="flex space-x-4">
                <span className="text-2xl">🔍</span>
                <span className="text-2xl">📄</span>
              </div>
            </div>

            {/* Column 2 - Platform Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-100">PLATFORM</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/jobs" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/companies" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Browse Companies
                  </Link>
                </li>
                <li>
                  <Link to="/salaries" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Salaries
                  </Link>
                </li>
                <li>
                  <Link to="/career-advice" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Career Advice
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - For Employers */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-100">FOR EMPLOYERS</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/post-job" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link to="/hiring-solutions" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Hiring Solutions
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Support & Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-100">SUPPORT</h4>
              <ul className="space-y-2 mb-4">
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    Cookie Policy
                  </Link>
                </li>
              </ul>

              {/* Newsletter Signup */}
              <div className="mt-4">
                <h5 className="text-sm font-semibold mb-2 text-gray-100">Subscribe to our newsletter</h5>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 text-sm text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-6 py-6 border-t border-gray-800">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.68-11.66c0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SMARTHIRE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>

      {/* Add custom CSS for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Footer;