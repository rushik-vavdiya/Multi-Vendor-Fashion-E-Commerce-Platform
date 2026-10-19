import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, FileText, LayoutGrid, Layers, PackageSearch, Store } from 'lucide-react';

import FallbackImage from '../../components/common/FallbackImage';
import PageHero from '../../components/common/PageHero';
import PageState from '../../components/common/PageState';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import ProductGrid from '../../components/product/ProductGrid';
import { fetchCategories } from '../../slices/categorySlice';
import { fetchProducts, productListQueryKey } from '../../slices/productSlice';
import { fetchPublicVendors } from '../../slices/vendorSlice';
import { searchablePages } from '../../data/searchablePages';
import { searchableCollections } from '../../data/collections';
import {
  searchCategories,
  searchCollections,
  searchPages,
  searchVendors,
} from '../../utils/search';

const PRODUCT_LIMIT = 24;
const GROUP_LIMIT = 6;

const GROUP_HEADING =
  'flex items-center gap-2 font-serif text-2xl font-medium tracking-tight text-primary';

function GroupHeading({ icon: Icon, children, count }) {
  return (
    <h2 className={GROUP_HEADING}>
      <Icon size={20} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
      {children}
      <span className="text-sm font-normal text-muted">({count})</span>
    </h2>
  );
}

// /search?q= — one page for the whole store: products from GET /products with
// its own `search` filter, plus live categories, collections, stores and the
// storefront's own pages matched locally. Products and stores are the only
// groups that come from the API.
export default function Search() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const query = (searchParams.get('q') ?? '').trim();

  const {
    items = [],
    loading,
    listQueryKey,
    error,
  } = useSelector((state) => state.products);
  const { items: allCategories = [] } = useSelector((state) => state.categories);
  const { publicItems: allVendors = [], publicLoaded } = useSelector(
    (state) => state.vendor,
  );

  const productQuery = useMemo(
    () => (query ? { search: query, limit: PRODUCT_LIMIT, sort: 'newest' } : null),
    [query],
  );

  useEffect(() => {
    if (!productQuery) return;

    dispatch(fetchProducts(productQuery));
  }, [dispatch, productQuery]);

  useEffect(() => {
    if (allCategories.length === 0) dispatch(fetchCategories());
  }, [dispatch, allCategories.length]);

  // The store directory is one request per session; the header may already have
  // asked for it, in which case nothing is sent.
  useEffect(() => {
    if (!publicLoaded) dispatch(fetchPublicVendors());
  }, [dispatch, publicLoaded]);

  // Only rows from this page's own request are trusted, so a new search never
  // shows the previous result set while the request is in flight.
  const isCurrentQuery = !productQuery || productListQueryKey(productQuery) === listQueryKey;
  const visibleProducts = isCurrentQuery && !loading ? items : [];

  const collections = searchCollections(searchableCollections, query, GROUP_LIMIT);
  const categories = searchCategories(allCategories, query, GROUP_LIMIT);
  const vendors = searchVendors(allVendors, query, GROUP_LIMIT);
  const pages = searchPages(searchablePages, query, GROUP_LIMIT);
  const totalFound =
    visibleProducts.length +
    collections.length +
    categories.length +
    vendors.length +
    pages.length;

  const retry = () => {
    if (productQuery) dispatch(fetchProducts(productQuery));
  };

  return (
    <StorefrontLayout>
      <PageHero
        eyebrow="Search"
        title={query ? `Results for “${query}”` : 'Search the shop'}
        description={
          query
            ? 'Products, collections, categories, stores and pages that match your words. Products are matched on name, description and SKU.'
            : 'Type a product, a collection, a store or a page in the search box above — the results appear here.'
        }
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
        image="/images/placeholder-banner.svg"
        imageFallback="/images/placeholder-banner.svg"
      />

      <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-5 sm:px-8 lg:gap-14 lg:px-10">
          {!query ? (
            <PageState
              title="Nothing to search for yet"
              description="The search box in the header looks through every product, collection, category, store and page on the site."
            />
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted">
                {totalFound} {totalFound === 1 ? 'match' : 'matches'}
              </p>

              <div>
                <GroupHeading icon={PackageSearch} count={visibleProducts.length}>
                  Products
                </GroupHeading>

                {error && visibleProducts.length === 0 ? (
                  <div className="mt-6">
                    <PageState
                      variant="error"
                      title="We couldn't load the products"
                      description={`${error} — check that the API is running, then try again.`}
                      actionLabel="Try again"
                      onAction={retry}
                    />
                  </div>
                ) : (
                  <div className="mt-6">
                    <ProductGrid
                      products={visibleProducts}
                      loading={loading || !isCurrentQuery}
                      skeletonCount={4}
                      emptyMessage={`No products match “${query}”. Try a shorter word, or browse the collections below.`}
                    />
                  </div>
                )}
              </div>

              {collections.length > 0 && (
                <div>
                  <GroupHeading icon={Layers} count={collections.length}>
                    Collections
                  </GroupHeading>

                  <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {collections.map((collection) => (
                      <li key={collection.id}>
                        <Link
                          to={collection.href}
                          className="flex h-full items-center gap-4 rounded-2xl border border-border bg-white p-3 transition-colors hover:border-accent/50"
                        >
                          <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-peach/30">
                            <FallbackImage
                              src={collection.image}
                              fallbackSrc={collection.imageFallback}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </span>

                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-primary">
                              {collection.title}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-muted">
                              {collection.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {categories.length > 0 && (
                <div>
                  <GroupHeading icon={LayoutGrid} count={categories.length}>
                    Categories
                  </GroupHeading>

                  <ul className="mt-6 flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <li key={category._id ?? category.slug}>
                        <Link
                          to={`/shop?category=${category.slug}`}
                          className="inline-flex min-h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {vendors.length > 0 && (
                <div>
                  <GroupHeading icon={Store} count={vendors.length}>
                    Stores
                  </GroupHeading>

                  <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {vendors.map((vendor) => (
                      <li key={vendor._id}>
                        <Link
                          to={`/shop?vendor=${vendor._id}`}
                          className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-colors hover:border-accent/50"
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-peach/30">
                              {vendor.storeLogo ? (
                                <img
                                  src={vendor.storeLogo}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Store
                                  size={16}
                                  strokeWidth={1.7}
                                  aria-hidden="true"
                                  className="text-accent"
                                />
                              )}
                            </span>

                            <span className="min-w-0 truncate text-sm font-semibold text-primary">
                              {vendor.storeName}
                            </span>
                          </span>

                          <span className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                            {vendor.storeDescription}
                          </span>

                          <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-semibold text-accent">
                            Shop this store
                            <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pages.length > 0 && (
                <div>
                  <GroupHeading icon={FileText} count={pages.length}>
                    Pages
                  </GroupHeading>

                  <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pages.map((page) => (
                      <li key={page.id}>
                        <Link
                          to={page.href}
                          className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-colors hover:border-accent/50"
                        >
                          <span className="text-sm font-semibold text-primary">{page.title}</span>
                          <span className="mt-1.5 text-xs leading-5 text-muted">
                            {page.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {totalFound === 0 && !loading && (
                <PageState
                  title={`Nothing matches “${query}”`}
                  description="Check the spelling, try a single word such as “kurti”, or browse the categories from the header."
                />
              )}
            </>
          )}
        </div>
      </section>
    </StorefrontLayout>
  );
}
