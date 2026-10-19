import AuthLayout from '../../components/auth/AuthLayout';
import ResetPasswordOtpForm from '../../components/auth/ResetPasswordOtpForm';

// Step 1 of the password reset: the reset code only. The new password is a
// separate screen (/reset-password/new-password) so the two are never shown
// together.
function ResetPassword() {
  return (
    <AuthLayout
      eyebrow="Reset password · Step 1 of 2"
      title="Enter your reset code"
      subtitle="Type the code we emailed you. The new password comes on the next step."
    >
      <ResetPasswordOtpForm />
    </AuthLayout>
  );
}

export default ResetPassword;
