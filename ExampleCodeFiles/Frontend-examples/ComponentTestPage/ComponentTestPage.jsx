import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../../client/src/components/common/Button/Button';
import Input from '../../../client/src/components/common/Input/Input';
import { validateEmail, validatePassword, validateRequired, validateMatch } from '../../../client/src/utils/validators';
import './ComponentTestPage.css';

const ComponentTestPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        const nameError = validateRequired(formData.name, 'Name');
        if (nameError) newErrors.name = nameError;
        
        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;
        
        const passwordError = validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError;
        
        const matchError = validateMatch(formData.password, formData.confirmPassword);
        if (matchError) newErrors.confirmPassword = matchError;
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSimulateLoading = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            alert('Form submitted successfully!');
            console.log('Form data:', formData);
        }
    };

    return (
        <div className="component-test-page">
            <div className="container">
                <h1 className="page-title">Button & Input Components Demo</h1>

                {/* Button Variants Section */}
                <div className="demo-section">
                    <h2 className="section-title">Button Variants</h2>
                    <div className="button-demo">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="danger">Danger</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                    </div>
                </div>

                {/* Button Sizes Section */}
                <div className="demo-section">
                    <h2 className="section-title">Button Sizes</h2>
                    <div className="button-demo">
                        <Button variant="primary" size="sm">Small</Button>
                        <Button variant="primary" size="md">Medium</Button>
                        <Button variant="primary" size="lg">Large</Button>
                    </div>
                </div>

                {/* Button States Section */}
                <div className="demo-section">
                    <h2 className="section-title">Button States</h2>
                    <div className="button-demo">
                        <Button variant="primary" disabled>Disabled</Button>
                        <Button variant="primary" isLoading={isLoading} onClick={handleSimulateLoading}>
                            {isLoading ? 'Loading...' : 'Click to Load'}
                        </Button>
                    </div>
                </div>

                {/* Input Types Section */}
                <div className="demo-section">
                    <h2 className="section-title">Input Types</h2>
                    <div className="input-demo">
                        <Input
                            label="Text Input"
                            type="text"
                            placeholder="Enter text here"
                        />
                        <Input
                            label="Email Input"
                            type="email"
                            placeholder="Enter email"
                        />
                        <Input
                            label="Password Input"
                            type="password"
                            placeholder="Enter password"
                        />
                        <Input
                            label="Number Input"
                            type="number"
                            placeholder="Enter number"
                        />
                        <Input
                            label="Textarea"
                            type="textarea"
                            placeholder="Enter description"
                            rows={3}
                        />
                        <Input
                            label="Select Dropdown"
                            type="select"
                            options={[
                                { value: 'option1', label: 'Option 1' },
                                { value: 'option2', label: 'Option 2' },
                                { value: 'option3', label: 'Option 3' }
                            ]}
                        />
                        <Input
                            label="Disabled Input"
                            type="text"
                            value="Disabled field"
                            disabled
                        />
                    </div>
                </div>

                {/* Form Example with Validation */}
                <div className="demo-section">
                    <h2 className="section-title">Form with Validation</h2>
                    <form onSubmit={onSubmit} className="demo-form">
                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                            placeholder="Enter your full name"
                            required
                        />
                        
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            placeholder="Enter your email"
                            required
                        />
                        
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={errors.password}
                            placeholder="Create a password"
                            required
                        />
                        
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            error={errors.confirmPassword}
                            placeholder="Confirm your password"
                            required
                        />
                        
                        <Input
                            label="Role"
                            type="select"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            options={[
                                { value: 'job_seeker', label: 'Job Seeker' },
                                { value: 'employer', label: 'Employer' }
                            ]}
                        />
                        
                        <Button type="submit" variant="primary" fullWidth>
                            Submit Form
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ComponentTestPage;