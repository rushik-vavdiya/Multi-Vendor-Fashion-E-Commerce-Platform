import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockKeyhole, Mail, Phone, User } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, registerUser } from '../../slices/authSlice';
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_PATTERN,
  isEmail,
} from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialForm);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  // Mirrors registerSchema on the server (which is strict about extra fields).
  const validate = () => {
    const nextErrors = {};

    if (formData.firstName.trim().length < NAME_MIN_LENGTH) {
      nextErrors.firstName = `First name must be at least ${NAME_MIN_LENGTH} characters.`;
    } else if (formData.firstName.trim().length > NAME_MAX_LENGTH) {
      nextErrors.firstName = `First name cannot exceed ${NAME_MAX_LENGTH} characters.`;
    }

    if (formData.lastName.trim().length < NAME_MIN_LENGTH) {
      nextErrors.lastName = `Last name must be at least ${NAME_MIN_LENGTH} characters.`;
    } else if (formData.lastName.trim().length > NAME_MAX_LENGTH) {
      nextErrors.lastName = `Last name cannot exceed ${NAME_MAX_LENGTH} characters.`;
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isEmail(formData.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'Phone number is required.';
    } else if (!PHONE_PATTERN.test(formData.phoneNumber.trim())) {
      nextErrors.phoneNumber = 'Use 10 to 15 digits, optionally starting with +.';
    }

    if (formData.password.length < PASSWORD_MIN_LENGTH) {
      nextErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    } else if (formData.password.length > PASSWORD_MAX_LENGTH) {
      nextErrors.password = `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    const nextErrors = validate();

    if (!agreeToTerms) {
      nextErrors.terms = 'Please accept the Terms & Conditions and Privacy Policy.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      // POST /auth/register expects exactly these five fields.
      const result = await dispatch(
        registerUser({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password,
        }),
      ).unwrap();

      navigate('/verify-email', {
        state: {
          email: formData.email.trim(),
          message: result.message,
          verificationEmailSent: result.verificationEmailSent,
        },
      });
    } catch {
      // The failure message is rendered from the Redux auth state below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthField
          label="First Name"
          name="firstName"
          icon={User}
          placeholder="First name"
          autoComplete="given-name"
          value={formData.firstName}
          onChange={handleChange}
          disabled={loading}
          error={fieldErrors.firstName}
          required
        />

        <AuthField
          label="Last Name"
          name="lastName"
          placeholder="Last name"
          autoComplete="family-name"
          value={formData.lastName}
          onChange={handleChange}
          disabled={loading}
          error={fieldErrors.lastName}
          required
        />
      </div>

      <AuthField
        label="Email Address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.email}
        hint="We email a verification code to this address."
        required
      />

      <AuthField
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        icon={Phone}
        placeholder="9876543210"
        autoComplete="tel"
        value={formData.phoneNumber}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.phoneNumber}
        required
      />

      <AuthField
        label="Password"
        name="password"
        type="password"
        icon={LockKeyhole}
        reveal
        placeholder="Create a password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        required
      />

      <AuthField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        icon={LockKeyhole}
        reveal
        placeholder="Repeat your password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.confirmPassword}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={agreeToTerms}
            onChange={(event) => setAgreeToTerms(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <span className="text-sm leading-5 text-muted">
            I agree to the Terms &amp; Conditions and Privacy Policy.
          </span>
        </label>

        {fieldErrors.terms && <p className="text-xs text-red-600">{fieldErrors.terms}</p>}
      </div>

      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        Create Account
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
