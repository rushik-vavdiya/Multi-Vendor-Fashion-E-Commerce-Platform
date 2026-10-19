import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MailCheck } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, requestPasswordReset } from '../../slices/authSlice';
import { OTP_EXPIRES_IN_MINUTES, OTP_LENGTH, isOtp } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import OtpInput from './OtpInput';
import VerifyAnimation from './VerifyAnimation';

// Step 1 of the reset flow: the code on its own. The password fields live on
// the next screen, so this page never mixes the code with a new password.
//
// There is no endpoint that checks a reset code by itself — POST
// /auth/reset-password takes { email, otp, newPassword } together — so the code
// is confirmed when the new password is submitted. This step validates the
// shape of the code, shows the animation and carries it forward.
function ResetPasswordOtpForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, message } = useSelector((state) => state.auth);

  const queryEmail = new URLSearchParams(location.search).get('email') ?? '';
  const [email] = useState(location.state?.email ?? queryEmail);
  const [otp, setOtp] = useState('');
  const [fieldError, setFieldError] = useState('');
  // 'idle' | 'verifying' | 'verified'
  const [status, setStatus] = useState('idle');

  // Without an address there is nothing to send a code to — send the visitor
  // back to the step that asks for one.
  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);

  // Drive the animation, then hand the code to the password step.
  useEffect(() => {
    if (status === 'verifying') {
      const timer = setTimeout(() => setStatus('verified'), 800);
      return () => clearTimeout(timer);
    }

    if (status === 'verified') {
      const timer = setTimeout(
        () =>
          navigate('/reset-password/new-password', {
            replace: true,
            state: { email, otp },
          }),
        1200,
      );
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [status, email, otp, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    if (!isOtp(otp)) {
      setFieldError(`Enter the ${OTP_LENGTH}-digit code we emailed you.`);
      return;
    }

    setFieldError('');
    setStatus('verifying');
  };

  const handleResend = async () => {
    dispatch(clearAuthError());
    setFieldError('');
    // POST /auth/forgot-password -> a fresh reset code.
    await dispatch(requestPasswordReset(email));
  };

  if (status !== 'idle') {
    return <VerifyAnimation state={status} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3.5">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-peach/60 text-primary"
        >
          <MailCheck size={18} strokeWidth={1.8} />
        </span>

        <div className="min-w-0 text-sm leading-6">
          <p className="text-muted">We sent a {OTP_LENGTH}-digit code to</p>

          <p className="truncate font-medium text-primary">{email || 'your email'}</p>

          <Link
            to="/forgot-password"
            state={{ email }}
            className="mt-1 inline-block text-xs font-semibold text-accent hover:underline"
          >
            Use a different email
          </Link>
        </div>
      </div>

      <OtpInput
        value={otp}
        onChange={(event) => {
          setOtp(event.target.value);
          if (fieldError) setFieldError('');
          if (error) dispatch(clearAuthError());
        }}
        error={fieldError}
        disabled={loading}
        autoFocus
        hint={`The code expires in ${OTP_EXPIRES_IN_MINUTES} minutes.`}
        label="Reset code"
      />

      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {!error && message && <AuthAlert variant="success">{message}</AuthAlert>}

      <Button type="submit" size="lg" fullWidth disabled={loading}>
        Verify code
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleResend}
        disabled={loading}
      >
        Resend code
      </Button>

      <p className="text-center text-sm text-muted">
        Remembered your password?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordOtpForm;
