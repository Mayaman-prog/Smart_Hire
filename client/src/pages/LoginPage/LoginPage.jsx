import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Social login handlers with console log for debugging
  const handleGoogleLogin = () => {
    console.log('Google button clicked'); // Check console
    toast('Google login coming soon!', {
      duration: 3000,
      icon: '🔜',
    });
  };

  const handleLinkedInLogin = () => {
    console.log('LinkedIn button clicked'); // Check console
    toast('LinkedIn login coming soon!', {
      duration: 3000,
      icon: '🔜',
    });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await login(data.email, data.password, data.rememberMe);
      
      if (result.success) {
        // Redirect based on user role
        const role = result.user.role;
        switch (role) {
          case 'job_seeker':
            navigate('/dashboard/seeker');
            break;
          case 'employer':
            navigate('/dashboard/employer');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          default:
            navigate('/dashboard/seeker');
        }
      } else {
        // Handle specific error types
        if (result.error === 'Account disabled') {
          setError('root', {
            type: 'manual',
            message: 'Your account has been disabled. Please contact support.'
          });
        } else if (result.error === 'Invalid credentials') {
          setError('root', {
            type: 'manual',
            message: 'Invalid email or password. Please try again.'
          });
        } else {
          setError('root', {
            type: 'manual',
            message: result.error || 'Login failed. Please try again.'
          });
        }
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Panel - Hero Section */}
        <div className="login-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <h1>The Intelligent Curator of Your Next Career Move.</h1>
            <p>Join 50,000+ professionals discovering high-impact roles through AI-driven matching.</p>
            
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">50k+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Companies</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Match Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Enter your credentials to access your dashboard.</p>
            </div>

            {/* Social Login Buttons */}
            <div className="social-login">
              <button 
                type="button" 
                className="social-btn google-btn"
                onClick={handleGoogleLogin}
              >
                <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button 
                type="button" 
                className="social-btn linkedin-btn"
                onClick={handleLinkedInLogin}
              >
                <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C0.792 0 0 0.774 0 1.729v20.542C0 23.227 0.792 24 1.771 24h20.451c0.979 0 1.771-0.773 1.771-1.729V1.729C24 0.774 23.203 0 22.225 0z"/>
                </svg>
                Continue with LinkedIn
              </button>
            </div>

            <div className="divider">
              <span>OR LOGIN WITH EMAIL</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  EMAIL ADDRESS
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  icon="mail"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  icon="lock"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Root Error Display */}
              {errors.root && (
                <div className="error-message root-error">
                  <span className="material-symbols-outlined">error</span>
                  {errors.root.message}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>

              {/* Registration Link */}
              <div className="register-link">
                <p>
                  Don't have an account?
                  <Link to="/register">Create an account</Link>
                </p>
              </div>
            </form>

            <p className="terms-text">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;