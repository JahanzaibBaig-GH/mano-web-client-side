import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import * as authService from '../services/auth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setEmailError(err);
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Forgot Password – Mano App</title></Head>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 justify-center">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-2xl text-gray-900">Mano App</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {submitted ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h2>
                <p className="text-gray-500 text-sm mb-2">We sent a password reset link to</p>
                <p className="font-semibold text-gray-900 text-sm mb-5">{email}</p>
                <p className="text-gray-400 text-xs mb-6">
                  If you don&apos;t see the email, check your spam folder. The link expires in 1 hour.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setEmail(''); }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
                  <p className="text-gray-500 text-sm">
                    Enter your email and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                {apiError && (
                  <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                        emailError
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                      }`}
                    />
                    {emailError && <p className="mt-1.5 text-xs text-red-500">{emailError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : null}
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <Link href="/login" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
