import React, { useState } from 'react';
import './Input.css';

// Input component - supports text, email, password, textarea, select
const Input = ({ 
    label, 
    type = 'text', 
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
    showPasswordToggle = true,  // true = show custom eye icon
    className = ''
}) => {
    // Toggle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const isTextarea = type === 'textarea';
    const isSelect = type === 'select';

    // Show text when eye icon is clicked
    const inputType = isPassword && showPassword ? 'text' : type;

    // Render textarea
    if (isTextarea) {
        return (
            <div className={`input-group ${className}`}>
                {label && (
                    <label className="input-label">
                        {label}
                        {required && <span className="input-required">*</span>}
                    </label>
                )}
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    className={`input-field ${error ? 'input-error' : ''} ${value ? 'input-filled' : ''}`}
                />
                {error && <p className="input-error-message">{error}</p>}
            </div>
        );
    }

    // Render select dropdown
    if (isSelect) {
        return (
            <div className={`input-group ${className}`}>
                {label && (
                    <label className="input-label">
                        {label}
                        {required && <span className="input-required">*</span>}
                    </label>
                )}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={`input-field input-select ${error ? 'input-error' : ''}`}
                >
                    <option value="">Select an option</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="input-error-message">{error}</p>}
            </div>
        );
    }

    // Render regular input (text, email, password, number)
    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-wrapper">
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input-field ${error ? 'input-error' : ''} ${value ? 'input-filled' : ''}`}
                />
                {/* Custom eye icon - only for password fields and when enabled */}
                {isPassword && showPasswordToggle && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                    >
                        <span className="material-symbols-outlined">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                )}
            </div>
            {error && <p className="input-error-message">{error}</p>}
        </div>
    );
};

export default Input;