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
  const [role, setRole] = useState("job_seeker"); // For UI and payload

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
      companyName: "",
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: role, // ✅ Use local state instead of form value
        ...(role === "employer" && { companyName: data.companyName }),
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
              <span className="material-symbols-outlined">
                {role === "job_seeker" ? "person_search" : "business_center"}
              </span>
            </div>
            <h1>
              {role === "job_seeker"
                ? "Unlock Your Career Potential"
                : "Find Your Next Top Performer"}
            </h1>
            <p>
              {role === "job_seeker"
                ? "Get matched with top employers, receive job alerts based on your skills, and track your applications in one place."
                : "Post jobs, manage applicants, and use AI-driven insights to find the perfect candidate for your team."}
            </p>
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
              {/* Role Toggle */}
              <div className="role-toggle-group">
                <button
                  type="button"
                  className={`role-btn ${role === "employer" ? "active" : ""}`}
                  onClick={() => setRole("employer")}
                >
                  Employer
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "job_seeker" ? "active" : ""}`}
                  onClick={() => setRole("job_seeker")}
                >
                  Job Seeker
                </button>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Full Name*"
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
                <Input
                  id="email"
                  type="email"
                  placeholder="Email ID*"
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

              {/* Mobile Number (New field) */}
              <div className="form-group">
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Mobile Number*"
                  icon="phone"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile number must be 10 digits",
                    },
                  })}
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password*"
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

              {/* Confirm Password */}
              <div className="form-group">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password*"
                  icon="lock"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                />
              </div>

              {/* Conditional Company Name (only for employer) */}
              {role === "employer" && (
                <div className="form-group">
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Company Name*"
                    icon="business"
                    error={errors.companyName?.message}
                    {...register("companyName", {
                      required: "Company name is required for employers",
                    })}
                  />
                </div>
              )}

              {/* Experienced / Fresher Cards */}
              <div className="user-type-group">
                <div className="user-type-card">
                  <h4>Experienced</h4>
                  <p>
                    Already have experience? Leverage our AI to discover
                    higher-level roles.
                  </p>
                </div>
                <div className="user-type-card">
                  <h4>Fresher</h4>
                  <p>
                    New to the job market? SmartHire offers plenty of
                    opportunities for freshers.
                  </p>
                </div>
              </div>

              {/* Terms Text */}
              <p className="terms-text">
                <span className="material-symbols-outlined info-icon">
                  info
                </span>
                By clicking 'Create Account', you agree to our{" "}
                <Link to="/terms">Terms & Conditions</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="btn-black-pill"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Create {role === "job_seeker" ? "Job Seeker" : "Employer"}{" "}
                Account
              </Button>

              {/* Login Link */}
              <div className="login-link">
                <p>
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
