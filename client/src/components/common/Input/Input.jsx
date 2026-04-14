import React, { useState, forwardRef } from 'react';
import './Input.css';

// Input component - supports text, email, password, textarea, select
// Uses forwardRef to work with react-hook-form
const Input = forwardRef(({ 
    label, 
    type = 'text', 
    id,
    name, 
    value, 
    onChange, 
    onBlur,
    error, 
    placeholder, 
    required = false, 
    disabled = false,
    rows = 4,
    options = [],
    showPasswordToggle = true,
    className = '',
    icon, // Left icon (material icon name)
    rightIcon, // Custom right icon component (for password toggle)
    ...props // Forward any additional props (like react-hook-form register)
}, ref) => {
    // Toggle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const isTextarea = type === 'textarea';
    const isSelect = type === 'select';

    // Generate unique ID if not provided
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Show text when eye icon is clicked
    const inputType = isPassword && showPassword ? 'text' : type;

    // Render textarea
    if (isTextarea) {
        return (
            <div className={`input-group ${className}`}>
                {label && (
                    <label htmlFor={inputId} className="input-label">
                        {label}
                        {required && <span className="input-required" aria-hidden="true">*</span>}
                    </label>
                )}
                <textarea
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    ref={ref}
                    className={`input-field ${error ? 'input-error' : ''} ${value ? 'input-filled' : ''}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="input-error-message" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    // Render select dropdown
    if (isSelect) {
        return (
            <div className={`input-group ${className}`}>
                {label && (
                    <label htmlFor={inputId} className="input-label">
                        {label}
                        {required && <span className="input-required" aria-hidden="true">*</span>}
                    </label>
                )}
                <select
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    ref={ref}
                    className={`input-field input-select ${error ? 'input-error' : ''}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                >
                    <option value="">Select an option</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p id={`${inputId}-error`} className="input-error-message" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    // Render regular input (text, email, password, number)
    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                    {required && <span className="input-required" aria-hidden="true">*</span>}
                </label>
            )}
            <div className="input-wrapper">
                {/* Left Icon */}
                {icon && (
                    <span className="input-icon left">
                        <span className="material-symbols-outlined">{icon}</span>
                    </span>
                )}
                
                <input
                    id={inputId}
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    ref={ref}
                    className={`input-field 
                        ${icon ? 'has-left-icon' : ''} 
                        ${rightIcon || (isPassword && showPasswordToggle) ? 'has-right-icon' : ''} 
                        ${error ? 'input-error' : ''} 
                        ${value ? 'input-filled' : ''}
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                
                {/* Custom right icon (if provided) */}
                {rightIcon && (
                    <div className="input-icon right">
                        {rightIcon}
                    </div>
                )}
                
                {/* Built-in password toggle */}
                {isPassword && showPasswordToggle && !rightIcon && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <span className="material-symbols-outlined">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                )}
            </div>
            {error && (
                <p id={`${inputId}-error`} className="input-error-message" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});

// Add display name for better debugging
Input.displayName = 'Input';

export default Input;