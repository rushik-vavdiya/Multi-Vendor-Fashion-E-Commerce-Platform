import { Link, useLocation } from "react-router-dom";

// Desktop navigation row. The links come from the header, which builds them
// once from siteContent plus the live categories, so the desktop bar and the
// mobile menu always show the same thing.
const NAV_ARIA_LABEL = "Main navigation";

export default function Navbar({ links = [], className = "" }) {
  const location = useLocation();

  return (
    <nav aria-label={NAV_ARIA_LABEL} className={`flex items-center gap-4 xl:gap-5 2xl:gap-6 ${className}`}>
      {links.map((link, index) => {
        const isActive = location.pathname === link.href;

        return (
          <Link
            key={`${link.href}-${index}`}
            to={link.href}
            className={`relative inline-flex items-center whitespace-nowrap py-2 text-sm font-medium transition-colors duration-200 ${
              isActive ? "text-accent" : "text-primary hover:text-accent"
            }`}
          >
            {link.label}

            {isActive && (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
