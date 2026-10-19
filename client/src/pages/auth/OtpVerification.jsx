import AuthLayout from '../../components/auth/AuthLayout';
import OtpVerificationForm from '../../components/auth/OtpVerificationForm';

// Also the OTP step for sign-up: the backend only supports email codes
// (there is no phone verification endpoint).
function OtpVerification() {
  return (
    <AuthLayout
      eyebrow="Verify your email"
      title="Enter your verification code"
      subtitle="Enter the one-time code sent to your email. If it has not arrived, you can request another code below."
    >
      <OtpVerificationForm />
    </AuthLayout>
  );
}

export default OtpVerification;
