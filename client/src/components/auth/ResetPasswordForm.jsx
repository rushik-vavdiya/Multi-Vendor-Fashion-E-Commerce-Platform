import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockKeyhole } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, resetPasswordWithOtp } from '../../slices/authSlice';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';

// Step 2 of the reset flow: the new password on its own. The code was entered
// on the previous screen and arrives in the router state, so this page shows no
// OTP field at all.
function ResetPasswordForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const email = location.state?.email ?? '';
  const otp = location.state?.otp ?? '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Reaching this step without a verified code means a refresh or a direct
  // visit — start again instead of submitting an empty code.
  useEffect(() => {
    if (!email || !otp) navigate('/reset-password', { replace: true });
  }, [email, otp, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (formData.newPassword.length < PASSWORD_MIN_LENGTH) {
      nextErrors.newPassword = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    } else if (formData.newPassword.length > PASSWORD_MAX_LENGTH) {
      nextErrors.newPassword = `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearAuthError());

    const nextErrors = validate();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      // POST /auth/reset-password -> { email, otp, newPassword }
      await dispatch(
        resetPasswordWithOtp({
          email,
          otp,
          newPassword: formData.newPassword,
        }),
      ).unwrap();

      navigate('/login', {
        replace: true,
        state: {
          email,
          message: 'Password reset successfully. Please sign in.',
        },
      });
    } catch {
      // The failure message is rendered from the Redux auth state below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted">
        <LockKeyhole
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-accent"
        />
        <span>
          Code accepted for{' '}
          <span className="font-medium text-primary">{email}</span>. Choose a new
          password to finish — this is the last step.
        </span>
      </p>

      <AuthField
        label="New Password"
        name="newPassword"
        type="password"
        icon={LockKeyhole}
        reveal
        autoFocus
        placeholder="Enter a new password"
        autoComplete="new-password"
        value={formData.newPassword}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.newPassword}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        required
      />

      <AuthField
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        icon={LockKeyhole}
        reveal
        placeholder="Repeat the new password"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        error={fieldErrors.confirmPassword}
        required
      />

      {error && (
        <>
          <AuthAlert variant="error">{error}</AuthAlert>

          <p className="text-xs text-muted">
            If the code was rejected,{' '}
            <Link
              to="/reset-password"
              state={{ email }}
              className="font-semibold text-accent hover:underline"
            >
              go back and enter a new one
            </Link>
            .
          </p>
        </>
      )}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        Reset Password
      </Button>
    </form>
  );
}

export default ResetPasswordForm;
