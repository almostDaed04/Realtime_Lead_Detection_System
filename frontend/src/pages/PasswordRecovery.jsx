import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const PasswordRecovery = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (token && password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = token
        ? await api.post('/auth/reset-password', { token, password })
        : await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="glass-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="text-4xl" aria-hidden="true">🍃</span>
            <h1 className="text-2xl font-bold text-slate-200 mt-3">{token ? 'Choose a new password' : 'Forgot your password?'}</h1>
            <p className="text-slate-400 mt-2">{token ? 'Use a strong password you have not used before.' : 'Enter your email and we’ll send you a password reset link.'}</p>
          </div>

          {error && <div role="alert" className="alert alert-error mb-6">{error}</div>}
          {message && <div role="status" className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!token ? (
              <div>
                <label htmlFor="recovery-email" className="input-label">Email</label>
                <input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" className="input" />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="new-password" className="input-label">New password</label>
                  <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete="new-password" className="input" />
                  <p className="text-xs text-slate-500 mt-2">At least 8 characters, including uppercase, lowercase, number, and symbol.</p>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="input-label">Confirm new password</label>
                  <input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="new-password" className="input" />
                </div>
              </>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading ? <><span className="spinner" />Please wait...</> : token ? 'Reset password' : 'Send reset link'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6"><Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Back to sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;
