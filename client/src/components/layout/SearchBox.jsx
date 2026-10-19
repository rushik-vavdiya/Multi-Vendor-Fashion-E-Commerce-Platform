import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  CornerDownLeft,
  FileText,
  Layers,
  LayoutGrid,
  Loader2,
  PackageSearch,
  Search,
  Store,
} from 'lucide-react';

import FallbackImage from '../common/FallbackImage';
import { searchablePages } from '../../data/searchablePages';
import { searchableCollections } from '../../data/collections';
import {
  searchCategories,
  searchCollections,
  searchPages,
  searchVendors,
} from '../../utils/search';
import { getProducts } from '../../services/productService';
import { fetchPublicVendors } from '../../slices/vendorSlice';
import { formatPrice } from '../../utils/format';

const SUGGESTION_LIMIT = 3;
const DEFAULT_LIMIT = 3;
// Short enough that the panel feels like it updates as you type, long enough
// that a word is not a request per character.
const DEBOUNCE_MS = 200;
const MIN_TERM = 2;

const SECTION_TITLE =
  'flex items-center gap-1.5 px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted';

const ROW_CLASS = 'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors';

// Empty list that keeps its identity, so the groups memo does not rebuild on
// every render while a search is idle.
const NO_ROWS = [];

// The navbar search. It is a live combobox across everything a shopper can
// reach:
//
//   products   GET /products?search= (name, description, SKU)
//   collections the homepage edits, matched locally
//   categories  live categories from the store
//   stores      GET /vendors/public (approved, active stores only)
//   pages       the storefront's own pages
//
// The local groups update on the keystroke; products are debounced. Opening the
// box with no query shows collections and popular categories, so the panel is
// useful before a single letter is typed. Products are fetched through the
// service directly instead of the products slice, so typing here never replaces
// the listing a shop page is showing.
export default function SearchBox({ initialQuery = '', onSubmit, onNavigate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const listId = useId();

  const [value, setValue] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [products, setProducts] = useState(NO_ROWS);
  const [productsTerm, setProductsTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);

  // The header loads the categories already, so those suggestions match what the
  // store holds instead of asking the API again on every keystroke.
  const allCategories = useSelector((state) => state.categories.items);
  const { publicItems: vendors = NO_ROWS, publicLoaded } = useSelector(
    (state) => state.vendor,
  );

  const term = value.trim();
  const longEnough = term.length >= MIN_TERM;

  // The store directory is one small request per session. It is asked for as
  // soon as the box opens, so store suggestions are ready by the time a word is
  // typed.
  useEffect(() => {
    if (open && !publicLoaded) dispatch(fetchPublicVendors());
  }, [dispatch, open, publicLoaded]);

  // One debounced request per word. Nothing is set on the way in: results are
  // only used once they belong to the term currently in the box, so a slow
  // answer for an older word never replaces a newer one.
  useEffect(() => {
    if (!longEnough) return undefined;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await getProducts({
          search: term,
          limit: SUGGESTION_LIMIT,
          sort: 'newest',
        });
        if (!cancelled) {
          setProducts(response?.data ?? []);
          setProductsTerm(term);
        }
      } catch {
        // A failed suggestion request simply leaves the other groups on screen.
        if (!cancelled) {
          setProducts(NO_ROWS);
          setProductsTerm(term);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [longEnough, term]);

  // Clicking anywhere else closes the panel, including on another header control.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  // Only products from this exact term are shown, so the panel never holds rows
  // for a word that is no longer in the box.
  const visibleProducts = useMemo(
    () => (longEnough && productsTerm === term ? products : NO_ROWS),
    [longEnough, productsTerm, term, products],
  );

  const { groups, items } = useMemo(() => {
    const activeCategories = allCategories.filter(
      (category) => category?.status === 'active',
    );

    const asCategory = (category) => ({
      id: `category-${category._id ?? category.slug}`,
      href: `/shop?category=${category.slug}`,
      title: category.name,
      subtitle: category.description,
    });

    const asCollection = (collection) => ({
      id: `collection-${collection.id}`,
      href: collection.href,
      title: collection.title,
      subtitle: collection.description,
      image: collection.image,
      imageFallback: collection.imageFallback,
      imageFit: 'object-cover',
    });

    const asVendor = (vendor) => ({
      id: `vendor-${vendor._id}`,
      href: `/shop?vendor=${vendor._id}`,
      title: vendor.storeName,
      subtitle: vendor.storeDescription,
    });

    const asPage = (page) => ({
      id: `page-${page.id}`,
      href: page.href,
      title: page.title,
      subtitle: page.description,
    });

    // Nothing typed yet: a starting point rather than an empty panel.
    const suggestions = longEnough
      ? [
          {
            key: 'products',
            title: 'Products',
            Icon: PackageSearch,
            rows: visibleProducts.map((product) => ({
              id: `product-${product._id}`,
              href: `/products/${product._id}`,
              title: product.name,
              subtitle: formatPrice(product.price),
              image: product.mainImage,
              // The whole outfit stays visible in the little square.
              imageFit: 'object-contain',
            })),
          },
          {
            key: 'collections',
            title: 'Collections',
            Icon: Layers,
            rows: searchCollections(searchableCollections, term, SUGGESTION_LIMIT).map(
              asCollection,
            ),
          },
          {
            key: 'categories',
            title: 'Categories',
            Icon: LayoutGrid,
            rows: searchCategories(allCategories, term, SUGGESTION_LIMIT).map(asCategory),
          },
          {
            key: 'vendors',
            title: 'Stores',
            Icon: Store,
            rows: searchVendors(vendors, term, SUGGESTION_LIMIT).map(asVendor),
          },
          {
            key: 'pages',
            title: 'Pages',
            Icon: FileText,
            rows: searchPages(searchablePages, term, SUGGESTION_LIMIT).map(asPage),
          },
        ]
      : [
          {
            key: 'collections',
            title: 'Collections',
            Icon: Layers,
            rows: searchableCollections.slice(0, DEFAULT_LIMIT).map(asCollection),
          },
          {
            key: 'categories',
            title: 'Popular categories',
            Icon: LayoutGrid,
            rows: activeCategories.slice(0, DEFAULT_LIMIT).map(asCategory),
          },
        ];

    // Every row in the order it is drawn, each carrying its own flat index, so
    // the arrow keys, the pointer and the groups below all agree on a position.
    const flat = [];
    const withRows = suggestions
      .filter((group) => group.rows.length > 0)
      .map((group) => ({
        ...group,
        rows: group.rows.map((row) => {
          flat.push(row);
          return { ...row, index: flat.length - 1 };
        }),
      }));

    return { groups: withRows, items: flat };
  }, [allCategories, longEnough, term, vendors, visibleProducts]);

  const hasResults = items.length > 0;
  const showPanel = open;
  const searching = longEnough && loading && visibleProducts.length === 0;

  const go = (href) => {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    navigate(href);
  };

  const submit = (event) => {
    event?.preventDefault();

    const active = items[activeIndex];
    if (active) {
      go(active.href);
      return;
    }

    setOpen(false);
    setActiveIndex(-1);
    onSubmit?.(term);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      // Escape closes the panel. Preventing the default also stops the browser
      // clearing a type="search" field, which would reopen the panel through
      // onChange a moment later.
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!showPanel) return;

      event.preventDefault();
      setActiveIndex((current) => {
        if (items.length === 0) return -1;
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        return (next + items.length) % items.length;
      });
    }
  };

  return (
    <form
      ref={containerRef}
      role="search"
      onSubmit={submit}
      onKeyDown={handleKeyDown}
      className="relative order-last mt-1 flex h-11 w-full min-w-0 items-center gap-2 rounded-full border border-border bg-background pl-4 pr-1 transition-colors focus-within:border-accent lg:order-none lg:mt-0 lg:h-10 lg:w-64 xl:w-80"
    >
      <input
        type="search"
        name="navbar-search"
        autoFocus
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search products, collections, stores..."
        aria-label="Search products, collections, categories, stores and pages"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showPanel && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-primary outline-none placeholder:text-muted focus:ring-0"
      />

      <button
        type="submit"
        aria-label="Search"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-peach/60 hover:text-accent"
      >
        {loading ? (
          <Loader2 size={16} strokeWidth={1.8} className="animate-spin" aria-hidden="true" />
        ) : (
          <Search size={17} strokeWidth={1.8} aria-hidden="true" />
        )}
      </button>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-white p-2 text-left shadow-[0_24px_60px_-24px_rgba(122,46,31,0.35)] lg:left-auto lg:w-[400px]"
        >
          {!hasResults && searching && (
            <p className="flex items-center gap-2 px-3 py-4 text-sm text-muted">
              <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />
              Looking for “{term}”…
            </p>
          )}

          {!hasResults && !searching && longEnough && (
            <p className="px-3 py-4 text-sm text-muted">
              Nothing matches “{term}” yet. Try a shorter word, or press Enter to search
              the whole shop.
            </p>
          )}

          {groups.map((group) => (
            <div key={group.key}>
              <p className={SECTION_TITLE}>
                <group.Icon size={12} strokeWidth={2} aria-hidden="true" />
                {group.title}
              </p>

              {group.rows.map((row) => (
                <Link
                  key={row.id}
                  to={row.href}
                  id={`${listId}-option-${row.index}`}
                  role="option"
                  aria-selected={activeIndex === row.index}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  onMouseEnter={() => setActiveIndex(row.index)}
                  className={`${ROW_CLASS} ${
                    activeIndex === row.index ? 'bg-peach/45' : 'hover:bg-peach/30'
                  }`}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-peach/30">
                    {row.image ? (
                      <FallbackImage
                        src={row.image}
                        fallbackSrc={row.imageFallback}
                        alt=""
                        loading="lazy"
                        className={`h-full w-full ${row.imageFit ?? 'object-cover'}`}
                      />
                    ) : (
                      <group.Icon
                        size={15}
                        strokeWidth={1.6}
                        aria-hidden="true"
                        className="text-accent"
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-primary">
                      {row.title}
                    </span>
                    {row.subtitle && (
                      <span className="block truncate text-xs text-muted">
                        {row.subtitle}
                      </span>
                    )}
                  </span>

                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0 text-muted/60"
                  />
                </Link>
              ))}
            </div>
          ))}

          {hasResults && (
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-border px-3 py-2.5 text-left text-xs font-semibold text-accent transition-colors hover:bg-peach/30"
            >
              <CornerDownLeft size={13} strokeWidth={2} aria-hidden="true" />
              {term ? `See every result for “${term}”` : 'Browse every product'}
            </button>
          )}
        </div>
      )}
    </form>
  );
}
