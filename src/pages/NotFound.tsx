import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="mt-3 text-slate-600">That page doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block text-indigo-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}
