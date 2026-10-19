import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockKeyhole, Mail } from 'lucide-react';

import Button from '../common/Button';
import { clearAuthError, loginUser } from '../../slices/authSlice';
import { PASSWORD_MAX_LENGTH, isEmail, roleHomePath } from '../../utils/authHelpers';
import AuthAlert from './AuthAlert';
import AuthField from './AuthField';

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, token, user } = useSelector((state) => state.auth);

  // The register / verify-email pages hand over the email and a notice.
  const [email, setEmail] = useState(location.state?.email ?? '');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const notice = location.state?.message;

  // Already signed in: send the user to their role home.
  if (token && user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length > PASSWORD_MAX_LENGTH) {
      nextErrors.password = `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`;
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
      // POST /auth/login -> { data: user, token }
      const result = await dispatch(
        loginUser({ email: email.trim(), password }),
      ).unwrap();

      // Send each role to its own area.
      navigate(roleHomePath(result.data?.role), { replace: true });
    } catch {
      // The failure message is rendered from the Redux auth state below.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {notice && <AuthAlert variant="success">{notice}</AuthAlert>}

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

      <div className="flex flex-col gap-1.5">
        <AuthField
          label="Password"
          name="password"
          type="password"
          icon={LockKeyhole}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          error={fieldErrors.password}
          required
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-accent hover:text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* An unverified email never blocks sign-in, so there is no "verify first"
          hint here. Verification is offered on /account/profile once signed in. */}
      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
        Sign In
      </Button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
