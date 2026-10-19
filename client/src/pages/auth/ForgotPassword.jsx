import AuthLayout from '../../components/auth/AuthLayout';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

function ForgotPassword() {
  return (
    <AuthLayout
      eyebrow="Password help"
      title="Forgot your password?"
      subtitle="We email a one-time code so you can choose a new password."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export default ForgotPassword;
