'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import api from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const router = useRouter();
  const { setToken, setUser } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      setToken(data.access_token);
      setUser(data.user);
      toast.success('Welcome back!');
      router.push('/restaurants');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('password123');
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-wide">Slooze</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Your team's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                food, ordered.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Slooze makes it effortless for teams to discover local restaurants and place orders together, region by region.
            </p>
          </div>

          {/* Feature bullets */}
          <ul className="space-y-4">
            {[
              { icon: '🍽️', text: 'Region-specific restaurant discovery' },
              { icon: '👥', text: 'Role-based access for teams' },
              { icon: '⚡', text: 'Fast, seamless checkout flow' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-lg shrink-0">
                  {icon}
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-slate-400 text-sm italic">"The simplest way to feed our team across regions."</p>
          <p className="text-slate-500 text-xs mt-1">— Nick Fury, Admin</p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">S</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">Slooze</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Sign in</h1>
            <p className="text-gray-500 text-sm">
              New to Slooze?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  required
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  required
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loginLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 py-2 transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${showDemo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showDemo ? 'Hide' : 'Show'} demo accounts
            </button>

            {showDemo && (
              <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                {[
                  { label: 'Admin', email: 'nick.fury@slooze.com', color: 'bg-purple-100 text-purple-700' },
                  { label: 'Manager', email: 'captain.marvel@slooze.com', color: 'bg-blue-100 text-blue-700' },
                  { label: 'Member', email: 'thanos@slooze.com', color: 'bg-green-100 text-green-700' },
                ].map(({ label, email, color }) => (
                  <button
                    key={email}
                    onClick={() => fillDemo(email)}
                    className="w-full flex items-center justify-between text-left hover:bg-white border border-transparent hover:border-gray-200 rounded-lg px-3 py-2 transition-all group"
                  >
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color} mr-2`}>{label}</span>
                      <span className="text-xs text-gray-500 font-mono">{email}</span>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">Use →</span>
                  </button>
                ))}
                <p className="text-xs text-gray-400 text-center pt-1">All use password: <span className="font-mono font-semibold">password123</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
