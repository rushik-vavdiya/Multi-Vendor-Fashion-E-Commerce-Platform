import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

function Register() {
  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join Lunella"
      subtitle="Create a customer account and we’ll send a verification code to your email. Email verification is optional, so you can still sign in if the code does not arrive."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

export default Register;
