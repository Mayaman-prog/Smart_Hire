import React from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';
import Input from './Input';
import { validateEmail, validatePassword, validateRequired, validateMatch } from '../../utils/validators';

const FormExample = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Form submitted successfully!');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Registration Form</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          register={register}
          validation={{ validate: (value) => validateRequired(value, 'Name') || true }}
          error={errors.name?.message}
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          register={register}
          validation={{ validate: (value) => validateEmail(value) || true }}
          error={errors.email?.message}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password"
          register={register}
          validation={{ validate: (value) => validatePassword(value) || true }}
          error={errors.password?.message}
          required
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          register={register}
          validation={{ validate: (value) => validateMatch(password, value) || true }}
          error={errors.confirmPassword?.message}
          required
        />

        <Input
          label="Role"
          name="role"
          type="select"
          options={[
            { value: 'job_seeker', label: 'Job Seeker' },
            { value: 'employer', label: 'Employer' }
          ]}
          register={register}
          error={errors.role?.message}
        />

        <Input
          label="Bio"
          name="bio"
          type="textarea"
          placeholder="Tell us about yourself..."
          rows={4}
          register={register}
        />

        <div className="flex gap-3 mt-6">
          <Button type="submit" loading={isSubmitting} fullWidth>
            Register
          </Button>
          <Button type="button" variant="outline" fullWidth>
            Cancel
          </Button>
        </div>
      </form>

      {/* Button Variants Demo */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">Primary</Button>
          <Button variant="secondary" size="md">Secondary</Button>
          <Button variant="danger" size="lg">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </div>
    </div>
  );
};

export default FormExample;