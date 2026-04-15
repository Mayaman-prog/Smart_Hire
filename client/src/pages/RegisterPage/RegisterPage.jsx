import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "job_seeker",
      companyName: "",
    },
  });

  const selectedRole = watch("role");
  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === "employer" && { companyName: data.companyName }),
      };
      const response = await authAPI.register(payload);
      if (response.data.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 409) {
        setError("email", { type: "manual", message: "Email already exists" });
      } else if (status === 400 && message) {
        toast.error(message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Panel - Hero Section */}
        <div className="register-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <h1>The Intelligent Curator of Your Next Career Move.</h1>
            <p>
              Join 50,000+ professionals discovering high-impact roles through
              AI-driven matching.
            </p>
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

        {/* Right Panel - Registration Form */}
        <div className="register-form-panel">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Create an Account</h2>
              <p>Join SmartHire and start your career journey.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="register-form">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  FULL NAME
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  icon="person"
                  error={errors.fullName?.message}
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[A-Za-z\s\-']+$/,
                      message:
                        "Name can only contain letters, spaces, hyphens, and apostrophes",
                    },
                  })}
                />
              </div>

              {/* Email */}
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
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>

              {/* Password (no toggle) */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  icon="lock"
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /\d/,
                      message: "Password must contain at least one number",
                    },
                  })}
                />
              </div>

              {/* Confirm Password (no toggle) */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  CONFIRM PASSWORD
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  icon="lock"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                />
              </div>

              {/* Role Dropdown */}
              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  ROLE
                </label>
                <select id="role" className="role-select" {...register("role")}>
                  <option value="job_seeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>

              {/* Conditional Company Name (only for employer) */}
              {selectedRole === "employer" && (
                <div className="form-group">
                  <label htmlFor="companyName" className="form-label">
                    COMPANY NAME
                  </label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter your company name"
                    icon="business"
                    error={errors.companyName?.message}
                    {...register("companyName", {
                      required: "Company name is required for employers",
                    })}
                  />
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
                Create Account
              </Button>

              {/* Login Link */}
              <div className="login-link">
                <p>
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </div>
            </form>

            <p className="terms-text">
              By signing up, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
