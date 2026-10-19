import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ShoppingBag, UserRound } from 'lucide-react';

import SearchBox from './SearchBox';

// The icon row on the right of the header: search, wishlist, account and bag —
// the four icons in the design, with the bag carrying the item count.
const ICON_BUTTON =
  'relative inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-peach/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

function IconButton({ label, href, onClick, children, badge = 0 }) {
  const content = (
    <>
      {children}

      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={ICON_BUTTON}>
        {content}
      </button>
    );
  }

  return (
    <Link to={href} aria-label={label} className={ICON_BUTTON}>
      {content}
    </Link>
  );
}

// The signed-in customer's menu: profile and logout.
function AccountMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="My account"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={ICON_BUTTON}
      >
        <UserRound size={20} strokeWidth={1.7} />
      </button>

      <div
        className={`absolute right-0 top-full z-50 min-w-40 pt-2 ${
          open ? 'block' : 'hidden group-hover:block group-focus-within:block'
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-lg">
          <Link
            to="/account/profile"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background hover:text-accent"
          >
            Profile
          </Link>
          <Link
            to="/logout"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background hover:text-accent"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HeaderActions({
  cartCount = 0,
  searchQuery = '',
  searchOpen = false,
  onToggleSearch,
  onSearch,
  onCartClick,
  accountHref = '/login',
  showAccountMenu = false,
}) {
  return (
    // On phones the search box wraps onto its own full-width row; from lg it sits
    // inline, just before the rest of the icons.
    <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-0 sm:gap-2">
      {/* Re-mounted from the URL after a search, so the box shows the query the
          results page is showing. */}
      {searchOpen && (
        <SearchBox
          key={searchQuery}
          initialQuery={searchQuery}
          onSubmit={onSearch}
        />
      )}

      <IconButton label="Search" onClick={onToggleSearch}>
        <Search size={20} strokeWidth={1.7} />
      </IconButton>

      <IconButton label="Wishlist" href="/wishlist">
        <Heart size={20} strokeWidth={1.7} />
      </IconButton>

      {showAccountMenu ? (
        <AccountMenu />
      ) : (
        <IconButton label="My account" href={accountHref}>
          <UserRound size={20} strokeWidth={1.7} />
        </IconButton>
      )}

      <IconButton label="Shopping bag" onClick={onCartClick} badge={cartCount}>
        <ShoppingBag size={20} strokeWidth={1.7} />
      </IconButton>
    </div>
  );
}
