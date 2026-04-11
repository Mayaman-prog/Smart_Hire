// Email validation - checks format and empty
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
};

// Password validation - min 6 chars, at least 1 number
export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/\d/.test(password)) return 'Password must contain at least 1 number';
    return '';
};

// Required field validation
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return '';
};

// Password match validation
export const validateMatch = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
};

// Name validation
export const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return '';
};

// Phone validation (10 digits)
export const validatePhone = (phone) => {
    if (!phone) return '';
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit phone number';
    return '';
};