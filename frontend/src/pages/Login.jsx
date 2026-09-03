import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();

setError('');
setLoading(true);

try {
  // Step 1:
  // Verify email and password.
  // Backend will send OTP to the user's email.
  await login(email, password);

  // Step 2:
  // Redirect user to OTP verification page.
  navigate('/verify', {
    state: {
      email,
    },
  });

} catch (err) {

  const message =
    err.response?.data?.error ||
    err.response?.data?.details?.[0]?.message ||
    'Login failed. Please try again.';

  setError(message);

} finally {

  setLoading(false);

}

};

return (
<div className="min-h-screen flex items-center justify-center px-4 py-12">

  {/* Background orbs */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">

    <div className="absolute top-1/4 -left-20 w-60 h-60 bg-emerald-500/8 rounded-full blur-3xl"></div>

    <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-amber-500/8 rounded-full blur-3xl"></div>

  </div>


  <div className="relative w-full max-w-md animate-slide-up">

    <div className="glass-card p-8 sm:p-10">

      {/* Header */}
      <div className="text-center mb-8">

        <span className="text-4xl">
          🍃
        </span>

        <h1 className="text-2xl font-bold text-slate-200 mt-3">
          Welcome Back
        </h1>

        <p className="text-slate-400 mt-1">
          Sign in to your LeafScan account
        </p>

      </div>


      {/* Error Message */}
      {error && (

        <div className="alert alert-error mb-6 animate-fade-in">

          ⚠️ {error}

        </div>

      )}


      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* Email */}
        <div>

          <label
            htmlFor="email"
            className="input-label"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
            required
            className="input"
            autoComplete="email"
          />

        </div>


        {/* Password */}
        <div>

          <label
            htmlFor="password"
            className="input-label"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="••••••••"
            required
            className="input"
            autoComplete="current-password"
          />

        </div>


        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3"
        >

          {loading ? (

            <>
              <span className="spinner"></span>
              Signing in...
            </>

          ) : (

            'Sign In'

          )}

        </button>

      </form>


      {/* Signup Link */}
      <p className="text-center text-sm text-slate-400 mt-6">

        Don't have an account?{' '}

        <Link
          to="/signup"
          className="text-emerald-400 hover:text-emerald-300 font-medium"
        >
          Sign up
        </Link>

      </p>

    </div>

  </div>

</div>

);
};

export default Login;