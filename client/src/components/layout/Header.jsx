import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import Navbar from './Navbar';
import HeaderActions from './HeaderActions';
import MobileMenu from './MobileMenu';
import CartDrawer from '../cart/CartDrawer';

import { getContent, listContent } from '../../data/content';

import {
  changeCartQuantity,
  fetchCart,
  removeFromCart,
  resetCart,
} from '../../slices/cartSlice';
import { logoutUser } from '../../slices/authSlice';
import { roleHomePath } from '../../utils/authHelpers';

// The navigation links and the brand text come from src/data/siteContent.json
// (keys "nav" and "brand").
const LINKS = listContent('nav.links');
const BRAND_LOGO = getContent('brand.logoText');
const BRAND_TAGLINE = getContent('brand.tagline');
const LOGO_ARIA_LABEL = getContent('nav.logoAriaLabel');

export default function Header({ logo = BRAND_LOGO }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  // Signed in: the icon opens the dashboard for that role (admin area, vendor
  // area or account). Signed out: the sign-in page.
  const accountHref = token && user ? roleHomePath(user.role) : '/login';
  const showAccountMenu = Boolean(token && user?.role === 'customer');
  const cartState = useSelector((state) => state.cart);
  const cart = cartState.cart;

  // The box is filled from the URL: /search owns ?q=, and the shop page still
  // reads ?search= so a link shared with an old query keeps working.
  const urlParams = new URLSearchParams(location.search);
  const searchQuery = urlParams.get('q') ?? urlParams.get('search') ?? '';

  // Submitting the box lands on the search page, which looks through products,
  // categories and the site's own pages.
  const handleSearch = (value) => {
    const query = String(value ?? '').trim();

    setMenuOpen(false);

    if (!query) {
      navigate('/search');
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const cartCount =
    cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;

  const closeCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    } else {
      dispatch(resetCart());
    }
  }, [dispatch, token]);

  useEffect(() => {
    const handleExpiredToken = () => {
      setCartOpen(false);
      dispatch(logoutUser());
    };

    window.addEventListener('auth:expired', handleExpiredToken);

    return () => {
      window.removeEventListener('auth:expired', handleExpiredToken);
    };
  }, [dispatch]);

  // The bar hides on the way down and comes back on the way up.
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0 || currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setHeaderVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const openCart = () => {
    setCartOpen(true);

    if (token && !cart) {
      dispatch(fetchCart());
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-white transition-transform duration-300 ease-in-out ${
        headerVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4 sm:gap-y-3 sm:px-8 lg:h-[86px] lg:flex-nowrap lg:gap-x-8 lg:px-10">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-peach/40 lg:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Wordmark: widely tracked caps over a small tracked subtitle, the
            lock-up a fashion house uses instead of an icon. */}
        <Link
          to="/"
          aria-label={LOGO_ARIA_LABEL}
          className="flex shrink-0 flex-col text-primary"
        >
          <span className="font-wordmark whitespace-nowrap text-[clamp(15px,4.1vw,20px)] uppercase leading-none tracking-[0.12em] sm:text-[22px] sm:tracking-[0.14em] lg:text-[26px]">
            {logo}
          </span>

          {BRAND_TAGLINE && (
            <span className="mt-1 self-center whitespace-nowrap text-[6px] uppercase leading-none tracking-[0.38em] text-primary sm:mt-1.5 sm:text-[8px] sm:tracking-[0.42em]">
              {BRAND_TAGLINE}
            </span>
          )}
        </Link>

        {/* Desktop navigation, centred in the bar. */}
        <div className="hidden min-w-0 flex-1 justify-center overflow-x-auto [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
          <Navbar links={LINKS} />
        </div>

        <HeaderActions
          cartCount={cartCount}
          searchQuery={searchQuery}
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((open) => !open)}
          accountHref={accountHref}
          showAccountMenu={showAccountMenu}
          onSearch={handleSearch}
          onCartClick={openCart}
        />
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={LINKS} />

      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        cart={cart}
        isAuthenticated={Boolean(token)}
        loading={cartState.loading}
        error={cartState.error}
        onUpdateQuantity={(itemId, quantity) =>
          dispatch(changeCartQuantity({ itemId, quantity }))
        }
        onRemoveItem={(itemId) => dispatch(removeFromCart(itemId))}
      />
    </header>
  );
}
