import React, { useState } from 'react';
import TuckMascot from '../components/TuckMascot';
import { loginUser } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mascotState, setMascotState] = useState('default');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordFocus = () => {
    setMascotState(showPassword ? 'peeking' : 'hiding');
  };

  const handleTogglePassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    setMascotState(next ? 'peeking' : 'hiding');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please provide a valid store email address.');
      setMascotState('error');
      return;
    }
    if (!password) {
      setError('Password cannot be empty.');
      setMascotState('error');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);

      setMascotState('success');
      setTimeout(() => {
        onLoginSuccess(data.user.email);
      }, 500);
    } catch (err) {
      setError(err.message);
      setMascotState('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="text-center z-10 mb-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-slate-400 mt-1">Enter your credentials to enter your merchant dashboard.</p>
      </div>

      <div className="w-full max-w-md relative mt-16 z-10">
        <TuckMascot mascotState={mascotState} showThumbsUp={false} />

        <div className={`bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl ${mascotState === 'error' ? 'shake-anim' : ''}`}>
          <div className="mb-6">
            <h3 className="text-xl font-bold">Sign In to Dashboard</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enter your store email and password.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Store Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setMascotState('email')}
                onBlur={() => setMascotState('default')}
                placeholder="moufik241-35-391@diu.edu.bd"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={() => !showPassword && setMascotState('default')}
                  placeholder="••••••••••••"
                  className="w-full px-4 pr-12 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-cyan-400"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-bold rounded-xl text-sm shadow-lg transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-5 mt-4 border-t border-slate-800">
            Don't have an account?{' '}
            <button onClick={onNavigateRegister} className="text-cyan-400 font-semibold hover:underline">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}