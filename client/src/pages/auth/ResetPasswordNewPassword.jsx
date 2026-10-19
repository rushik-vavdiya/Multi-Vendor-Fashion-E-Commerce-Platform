import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

// Step 2 of the password reset: the new password on its own, with no code
// field, since the code was verified on the previous screen.
function ResetPasswordNewPassword() {
  return (
    <AuthLayout
      eyebrow="Reset password · Step 2 of 2"
      title="Choose a new password"
      subtitle="Pick something you have not used before. You will sign in with it straight away."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default ResetPasswordNewPassword;
