import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as authService from '../services/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROUTES, STORAGE_KEYS } from '../constants';

export default function VerifyEmail() {
  const router = useRouter();
  const { email: emailQuery } = router.query;

  const [status, setStatus] = useState('idle'); // idle | verifying | success | error
  const [otp, setOtp] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle | sending | sent | error
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const email = (typeof emailQuery === 'string' ? emailQuery : emailQuery?.[0]) || resendEmail;

  useEffect(() => {
    if (emailQuery) {
      setResendEmail(typeof emailQuery === 'string' ? emailQuery : emailQuery[0] || '');
    }
  }, [emailQuery]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const emailToUse = email?.trim();
    if (!emailToUse) {
      setVerifyError('Email is required');
      return;
    }
    const otpTrimmed = otp.replace(/\D/g, '');
    if (otpTrimmed.length !== 6) {
      setVerifyError('Please enter the 6-digit code from your email');
      return;
    }
    setVerifyError('');
    setStatus('verifying');
    try {
      const response = await authService.verifyEmail(emailToUse, otpTrimmed);
      const payload = response.data?.data || response.data;
      const tokens = payload.tokens || payload;
      const accessToken = tokens.access_token || tokens.token;
      const refreshToken = tokens.refresh_token;
      if (typeof window !== 'undefined' && accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      setStatus('success');
    } catch (err) {
      setVerifyError(
        err.response?.data?.message || 'Invalid or expired code. Please try again or resend.'
      );
      setStatus('error');
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const emailToUse = email?.trim();
    if (!emailToUse) {
      setResendError('Please enter your email address');
      return;
    }
    setResendStatus('sending');
    setResendError('');
    setVerifyError('');
    try {
      await authService.resendVerification(emailToUse);
      setResendStatus('sent');
      setCountdown(60);
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to send. Please try again.');
      setResendStatus('error');
    }
  };

  return (
    <>
      <Head><title>Verify Email – Mano App</title></Head>

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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            {/* Verifying state */}
            {status === 'verifying' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 font-medium">Verifying your email…</p>
              </div>
            )}

            {/* Success state */}
            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your account is ready. You are now signed in.
                </p>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="inline-block bg-teal-600 text-white font-semibold px-8 py-2.5 rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  Go to Dashboard
                </Link>
              </>
            )}

            {/* Error state (invalid/expired OTP) */}
            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid or expired code</h2>
                <p className="text-gray-500 text-sm mb-6">
                  The code you entered is invalid or has expired. Enter a new code below or resend.
                </p>
              </>
            )}

            {/* OTP entry (idle or after error when we have email) */}
            {(status === 'idle' || status === 'error') && (
              <div className={status === 'error' ? '' : 'pt-2'}>
                {(emailQuery || resendEmail) ? (
                  <>
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Enter verification code</h2>
                    <p className="text-gray-500 text-sm mb-2">
                      We sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-gray-900 mb-5 text-sm break-all">
                      {email}
                    </p>
                    <form onSubmit={handleVerifyOtp} className="text-left mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Verification code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(v);
                          setVerifyError('');
                        }}
                        placeholder="000000"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-center text-lg tracking-[0.5em] font-mono outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 mb-2"
                      />
                      {verifyError && <p className="text-xs text-red-500 mb-2">{verifyError}</p>}
                      <button
                        type="submit"
                        disabled={status === 'verifying' || otp.replace(/\D/g, '').length !== 6}
                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        {status === 'verifying' ? (
                          <><LoadingSpinner size="sm" /> Verifying…</>
                        ) : (
                          'Verify email'
                        )}
                      </button>
                    </form>
                    {resendStatus === 'sent' ? (
                      <div className="flex items-center gap-2 bg-teal-50 text-teal-700 rounded-lg px-4 py-3 text-sm justify-center mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        New code sent! Check your inbox.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendStatus === 'sending' || countdown > 0}
                        className="w-full text-teal-600 hover:text-teal-700 font-medium py-2 text-sm disabled:opacity-50"
                      >
                        {resendStatus === 'sending' ? (
                          <span className="inline-flex items-center gap-2"><LoadingSpinner size="sm" /> Sending…</span>
                        ) : countdown > 0 ? (
                          `Resend code in ${countdown}s`
                        ) : (
                          'Resend code'
                        )}
                      </button>
                    )}
                    {resendError && <p className="text-xs text-red-500 mt-2">{resendError}</p>}
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Verify Your Email</h2>
                    <p className="text-gray-500 text-sm mb-6">
                      Enter your email to receive a new verification code.
                    </p>
                    {resendStatus === 'sent' ? (
                      <div className="flex items-center gap-2 bg-teal-50 text-teal-700 rounded-lg px-4 py-3 text-sm justify-center mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verification code sent! Check your inbox.
                      </div>
                    ) : (
                      <form onSubmit={handleResend} className="text-left">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          value={resendEmail}
                          onChange={(e) => { setResendEmail(e.target.value); setResendError(''); }}
                          placeholder="you@example.com"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 mb-2"
                        />
                        {resendError && <p className="text-xs text-red-500 mb-2">{resendError}</p>}
                        <button
                          type="submit"
                          disabled={resendStatus === 'sending' || countdown > 0}
                          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          {resendStatus === 'sending' ? (
                            <><LoadingSpinner size="sm" /> Sending…</>
                          ) : countdown > 0 ? (
                            `Resend in ${countdown}s`
                          ) : (
                            'Send verification code'
                          )}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100">
              <Link href={ROUTES.LOGIN} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
