/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { ID } from "appwrite";
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // Create user
      await account.create(ID.unique(), email, password, name);
      // Optionally: auto-login, or just redirect
      navigate('/login');
    } catch (e: any) {
      setErr(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl px-8 py-10 flex flex-col gap-6 transition-shadow hover:shadow-xl"
        autoComplete="off"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800 tracking-tight">
          Create your account
        </h1>
        {err && (
          <div className="text-center text-red-500 text-sm mb-2">{err}</div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition text-gray-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            disabled={loading}
          />
        </div>
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
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold tracking-wide hover:bg-blue-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
        <p className="text-center text-sm mt-2 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
