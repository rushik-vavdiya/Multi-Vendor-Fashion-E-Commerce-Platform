import { Link } from "react-router-dom";

import { getContent, listContent } from "../../data/content";

// Links and labels come from src/data/siteContent.json. The header passes the
// live department links in; these are the fallback.
const defaultLinks = listContent("nav.links");
const signInLabel = getContent("nav.signInLabel");
const NAV_ARIA_LABEL = getContent("nav.mobileNavLabel");

export default function MobileMenu({ open, onClose, links = defaultLinks }) {
  if (!open) return null;

  return (
    <div className="border-t border-border bg-background lg:hidden">
      <nav
        aria-label={NAV_ARIA_LABEL}
        className="mx-auto flex max-w-7xl flex-col px-5 py-3"
      >
        {links.map((link, index) => (
          <Link
            key={`${link.href}-${index}`}
            to={link.href}
            onClick={onClose}
            className="border-b border-border py-4 text-sm font-medium text-primary transition-colors duration-200 hover:text-accent"
          >
            {link.label}
          </Link>
        ))}

        <Link
          to="/login"
          onClick={onClose}
          className="mt-5 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-background transition-colors duration-200 hover:bg-accent"
        >
          {signInLabel}
        </Link>
      </nav>
    </div>
  );
}
