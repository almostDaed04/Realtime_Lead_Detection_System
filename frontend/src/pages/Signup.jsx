import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const { register } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setError('');


// Check whether passwords match
if (password !== confirmPassword) {
  setError('Passwords do not match.');
  return;
}

// Check password length
if (password.length < 8) {
  setError('Password must be at least 8 characters.');
  return;
}

setLoading(true);

try {
  // Register user and send verification code
  const data = await register(
    username,
    email,
    password
  );

  // Go to OTP verification page
  navigate('/verify', {
    state: {
      email: data.email,
    },
  });

} catch (err) {

  const message =
    err.response?.data?.error ||
    err.response?.data?.details?.[0]?.message ||
    'Registration failed. Please try again.';

  setError(message);

} finally {

  setLoading(false);

}


};

return ( <div className="min-h-screen flex items-center justify-center px-4 py-12">


  {/* Background orbs */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">

    <div className="absolute top-1/3 -right-20 w-60 h-60 bg-emerald-500/8 rounded-full blur-3xl"></div>

    <div className="absolute bottom-1/3 -left-20 w-60 h-60 bg-amber-500/8 rounded-full blur-3xl"></div>

  </div>

  <div className="relative w-full max-w-md animate-slide-up">

    <div className="glass-card p-8 sm:p-10">

      {/* Header */}
      <div className="text-center mb-8">

        <span className="text-4xl">🌿</span>

        <h1 className="text-2xl font-bold text-slate-200 mt-3">
          Create Account
        </h1>

        <p className="text-slate-400 mt-1">
          Join LeafScan to start identifying leaves
        </p>

      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error mb-6 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Signup Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* Username */}
        <div>

          <label
            htmlFor="username"
            className="input-label"
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="leaflover42"
            required
            minLength={3}
            maxLength={30}
            className="input"
            autoComplete="username"
          />

        </div>

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
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
            minLength={8}
            className="input"
            autoComplete="new-password"
          />

        </div>

        {/* Confirm Password */}
        <div>

          <label
            htmlFor="confirmPassword"
            className="input-label"
          >
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Repeat your password"
            required
            className={`input ${
              password &&
              confirmPassword &&
              password !== confirmPassword
                ? 'input-error'
                : ''
            }`}
            autoComplete="new-password"
          />

          {password &&
            confirmPassword &&
            password !== confirmPassword && (
              <p className="error-text">
                Passwords do not match
              </p>
            )}

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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}

        </button>

      </form>

      {/* Footer */}
      <p className="text-center text-sm text-slate-400 mt-6">

        Already have an account?{' '}

        <Link
          to="/login"
          className="text-emerald-400 hover:text-emerald-300 font-medium"
        >
          Sign in
        </Link>

      </p>

    </div>

  </div>

</div>


);
};

export default Signup;
