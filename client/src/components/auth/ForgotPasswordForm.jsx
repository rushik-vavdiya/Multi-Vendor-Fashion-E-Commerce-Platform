import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, requestPasswordReset } from '../../slices/authSlice';
import { isEmail } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';

function ForgotPasswordForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  // Prefilled when this is reached from the account area ("Forgot password?" on
  // the change-password form hands over the signed-in address), or from a link
  // such as /forgot-password?email=you@example.com.
  const queryEmail = new URLSearchParams(location.search).get('email') ?? '';
  const [email, setEmail] = useState(location.state?.email ?? queryEmail);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    if (!email.trim()) {
      setFieldError('Email is required.');
      return;
    }

    if (!isEmail(email)) {
      setFieldError('Enter a valid email address.');
      return;
    }

    setFieldError('');

    try {
      // POST /auth/forgot-password always answers 202 for privacy.
      await dispatch(requestPasswordReset(email.trim())).unwrap();
      navigate('/reset-password', { state: { email: email.trim() } });
    } catch {
      // The failure message is rendered from the Redux auth state below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthField
        label="Email Address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={loading}
        error={fieldError}
        hint="If this email is registered, we send a code to reset the password."
        required
      />

      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        Send Reset Code
      </Button>

      <p className="text-center text-sm text-muted">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
