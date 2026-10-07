import { EnvelopeSimple } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) setError(error);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="page py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="mx-auto max-w-sm text-center"
        >
          <EnvelopeSimple size={44} className="mx-auto text-ink" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-3 text-muted">
            We sent a confirmation link to <strong className="text-ink">{email}</strong>. Confirm it,
            then sign in.
          </p>
          <Link to="/login" className="btn btn-ink mt-8">
            Go to sign in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Save products to a wishlist and follow your orders."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="signup-name" className="label">
            Full name
          </label>
          <input
            id="signup-name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="label">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="label">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            aria-describedby="signup-password-help"
          />
          <p id="signup-password-help" className="help">
            At least 6 characters.
          </p>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
        </div>
        <button type="submit" disabled={loading} className="btn btn-ink w-full py-3 text-[15px]">
          {loading ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
