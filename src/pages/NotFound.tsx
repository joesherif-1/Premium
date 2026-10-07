import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page py-16 md:py-24">
      <p className="num text-[6rem] font-medium leading-none tracking-tighter">404</p>
      <h1 className="display mt-6 text-4xl md:text-6xl">Page not found.</h1>
      <p className="mt-3 text-muted">That page doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-ink mt-8 px-6 py-3.5">
        Go home
      </Link>
    </div>
  );
}
