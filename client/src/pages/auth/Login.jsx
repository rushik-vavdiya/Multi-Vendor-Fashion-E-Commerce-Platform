import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

function Login() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Customers, vendors and admins all sign in here."
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default Login;
