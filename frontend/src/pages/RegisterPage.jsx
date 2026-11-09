/**
 * OmniMarket AI - Register Page
 * Preserves 4-criteria password validation, Tuck Mascot reactions, and celebration screen.
 */

import React, { useState } from 'react';
import TuckMascot from '../components/TuckMascot';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage({ onRegisterSuccess, onNavigateLogin }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mascotState, setMascotState] = useState('default');
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 4-Criteria Password Evaluation
  const rules = {
    length: password.length >= 8,
    upperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#]/.test(password),
  };
  const score = Object.values(rules).filter(Boolean).length;
  const isMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      setMascotState('error');
      return;
    }
    if (score < 4) {
      setError('Password must satisfy all 4 security standards.');
      setMascotState('error');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setMascotState('error');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      setMascotState('success');
      setShowCelebration(true); // Shows Thumbs Up
    } catch (err) {
      setError(err.message || 'Registration failed');
      setMascotState('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="text-center z-10 mb-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Create your account</h2>
        <p className="text-xs text-slate-400 mt-1">Tuck ensures your inputs are secure and valid.</p>
      </div>

      <div className="w-full max-w-md relative mt-16 z-10">
        <TuckMascot mascotState={mascotState} showThumbsUp={showCelebration} />

        <div className={`bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl ${mascotState === 'error' ? 'shake-anim' : ''}`}>
          {!showCelebration ? (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold">Create Account</h3>
                <p className="text-xs text-slate-400 mt-0.5">Register with your store credentials.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setMascotState('email')}
                    onBlur={() => setMascotState('default')}
                    placeholder="moufik241-35-391@diu.edu.bd"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 transition text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase">
                      Password
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">{score} / 4 rules</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setMascotState(showPassword ? 'peeking' : 'hiding')}
                      onBlur={() => !showPassword && setMascotState('default')}
                      placeholder="••••••••••••"
                      className="w-full px-4 pr-12 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 transition text-white placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const n = !showPassword;
                        setShowPassword(n);
                        setMascotState(n ? 'peeking' : 'hiding');
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-cyan-400"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* 4 Password Rules Checklist */}
                  <div className="mt-2.5 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
                    <span className={rules.length ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      • 8+ characters
                    </span>
                    <span className={rules.upperLower ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      • Upper & lower case
                    </span>
                    <span className={rules.number ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      • At least 1 number
                    </span>
                    <span className={rules.special ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      • Special symbol (@$!%*?)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase">
                      Confirm Password
                    </label>
                    {confirmPassword && (
                      <span className={`text-[10px] font-bold ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isMatch ? 'Matches ✓' : 'Mismatch ✕'}
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm outline-none focus:border-cyan-500 transition text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-bold rounded-xl text-sm shadow-lg transition active:scale-[0.99] disabled:opacity-60 flex items-center justify-center"
                >
                  {loading ? 'Creating Account...' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 pt-5 mt-4 border-t border-slate-800">
                Already have an account?{' '}
                <button
                  onClick={onNavigateLogin}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            /* THUMBS UP CELEBRATION SCREEN */
            <div className="py-4 text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30 thumbs-up-pop">
                👍
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span>✓</span> Account Created Successfully
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Registered Email:</span>
                  <span className="font-semibold text-white">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security:</span>
                  <span className="font-bold text-emerald-400">Bcrypt Salted & Hashed</span>
                </div>
              </div>

              <button
                onClick={() => onRegisterSuccess(email)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-bold rounded-xl text-sm shadow-lg transition active:scale-[0.99]"
              >
                Proceed to Blank Dashboard ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
