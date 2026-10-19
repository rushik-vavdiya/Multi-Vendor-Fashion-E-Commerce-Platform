import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail } from 'lucide-react';

import Button from '../common/Button';
import {
  clearAuthError,
  resendVerificationCode,
  verifyEmailOtp,
} from '../../slices/authSlice';
import { OTP_EXPIRES_IN_MINUTES, OTP_LENGTH, isEmail, isOtp } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';
import OtpInput from './OtpInput';
import VerifyAnimation from './VerifyAnimation';

function OtpVerificationForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, message } = useSelector((state) => state.auth);
  const [registrationMessage, setRegistrationMessage] = useState(location.state?.message);

  // Email arrives from /register, or from a link such as
  // /verify-email?email=you@example.com
  const queryEmail = new URLSearchParams(location.search).get('email') ?? '';
  const [email, setEmail] = useState(location.state?.email ?? queryEmail);
  const [otp, setOtp] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  // 'idle' | 'verifying' | 'verified' — the form is replaced while verifying.
  const [status, setStatus] = useState('idle');

  // Hand off to the sign-in page once the success animation has played.
  useEffect(() => {
    if (status !== 'verified') return undefined;

    const timer = setTimeout(() => {
      navigate('/login', {
        replace: true,
        state: {
          email: email.trim(),
          message: 'Email verified successfully. Please sign in.',
        },
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [status, email, navigate]);

  const validateEmail = () => {
    if (!email.trim()) return 'Email is required.';
    if (!isEmail(email)) return 'Enter a valid email address.';
    return '';
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    const nextErrors = {};
    const emailError = validateEmail();
    if (emailError) nextErrors.email = emailError;

    if (!otp) {
      nextErrors.otp = 'Enter the code we emailed you.';
    } else if (!isOtp(otp)) {
      nextErrors.otp = `The code must contain ${OTP_LENGTH} digits.`;
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('verifying');

    try {
      // POST /auth/verify-email -> { email, otp }
      await dispatch(verifyEmailOtp({ email: email.trim(), otp })).unwrap();
      // The navigation happens in the effect above, after the animation.
      setStatus('verified');
    } catch {
      // Back to the form; the failure message comes from the Redux auth state.
      setStatus('idle');
    }
  };

  const handleResend = async () => {
    dispatch(clearAuthError());

    const emailError = validateEmail();
    if (emailError) {
      setFieldErrors({ email: emailError });
      return;
    }

    setFieldErrors({});

    // POST /auth/resend-verification -> { email }
    try {
      await dispatch(resendVerificationCode(email.trim())).unwrap();
      setRegistrationMessage(null);
    } catch {
      // The resend failure is displayed from the Redux auth state.
    }
  };

  if (status !== 'idle') {
    return <VerifyAnimation state={status} />;
  }

  return (
    <form onSubmit={handleVerify} noValidate className="flex flex-col gap-4">
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
        error={fieldErrors.email}
        required
      />

      <OtpInput
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        error={fieldErrors.otp}
        disabled={loading}
        autoFocus
        hint={`The ${OTP_LENGTH}-digit code expires in ${OTP_EXPIRES_IN_MINUTES} minutes.`}
      />

      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {!error && registrationMessage && (
        <AuthAlert variant="info">{registrationMessage}</AuthAlert>
      )}
      {!error && !registrationMessage && message && <AuthAlert variant="success">{message}</AuthAlert>}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        Verify Email
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleResend}
        disabled={loading}
      >
        Resend Code
      </Button>

      <p className="text-center text-sm text-muted">
        Wrong email?{' '}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Create the account again
        </Link>{' '}
        or{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          sign in
        </Link>
        .
      </p>
    </form>
  );
}

export default OtpVerificationForm;
