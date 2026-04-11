import React from 'react';
import './Button.css';

// Button component with 5 variants, 3 sizes, and loading/disabled states
const Button = ({ 
    children, 
    variant = 'primary',     // primary, secondary, danger, outline, ghost
    size = 'md',             // sm, md, lg
    isLoading = false,       // shows spinner when true
    disabled = false,        // disables button when true
    onClick, 
    type = 'button', 
    fullWidth = false,
    className = ''
}) => {
    // Get variant CSS class
    const getVariantClass = () => {
        switch(variant) {
            case 'primary': return 'btn-primary';
            case 'secondary': return 'btn-secondary';
            case 'danger': return 'btn-danger';
            case 'outline': return 'btn-outline';
            case 'ghost': return 'btn-ghost';
            default: return 'btn-primary';
        }
    };

    // Get size CSS class
    const getSizeClass = () => {
        switch(size) {
            case 'sm': return 'btn-sm';
            case 'lg': return 'btn-lg';
            default: return 'btn-md';
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`btn ${getVariantClass()} ${getSizeClass()} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
        >
            {isLoading ? (
                <div className="btn-loading">
                    <span className="btn-spinner"></span>
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;