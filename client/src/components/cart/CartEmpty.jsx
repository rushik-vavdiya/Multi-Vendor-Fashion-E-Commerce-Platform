import { Link } from "react-router-dom";

export default function CartEmpty({
  onClose,
  isAuthenticated = true,
}) {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center px-6 py-10 text-center">
      <div
        className="flex size-20 items-center justify-center rounded-full border border-border bg-peach/50 text-4xl shadow-sm"
        aria-hidden="true"
      >
        🛒
      </div>

      <h3 className="mt-5 text-xl font-bold tracking-tight text-primary">
        {isAuthenticated
          ? "Your cart is empty"
          : "Log in to view your cart"}
      </h3>

      <p className="mt-2 max-w-64 text-sm leading-6 text-muted">
        {isAuthenticated
          ? "Discover something you love and add it to your cart."
          : "Your saved cart items are waiting for you. Log in to view them."}
      </p>

      <Link
        to={isAuthenticated ? "/shop" : "/login"}
        onClick={onClose}
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {isAuthenticated ? "Continue shopping" : "Log in"}
      </Link>

      {isAuthenticated && (
        <p className="mt-4 text-xs font-medium text-muted">
          Your next favourite is waiting.
        </p>
      )}
    </div>
  );
}