/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white px-8 py-10 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm space-y-6"
      >
        <h1 className="text-2xl font-bold text-center mb-6 tracking-tight text-gray-800">
          Sign in to your account
        </h1>
        {err && (
          <div className="text-center text-red-500 text-sm mb-2">{err}</div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-center text-sm mt-2 text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
