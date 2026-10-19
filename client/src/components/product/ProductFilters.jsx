import { Link } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';

import { isActiveTopLevel } from '../../utils/navigation';

// The vertical filter rail on the collection page. Everything here is a real
// API filter: a category narrows GET /products by categoryId, and availability
// maps to its `availability=available` option. Sort and the result count stay in
// the toolbar above the grid, since they change the order rather than the set.
//
// On phones the same body is folded into a <details>, so a long category list
// does not push the products below the fold.

const parentIdOf = (category) =>
  category?.parentCategoryId?._id ?? category?.parentCategoryId ?? null;

const hrefFor = ({ categorySlug, availability }) => {
  const params = new URLSearchParams();

  if (categorySlug) params.set('category', categorySlug);
  if (availability === 'available') params.set('availability', 'available');

  const query = params.toString();

  return query ? `/shop?${query}` : '/shop';
};

const LINK_BASE =
  'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
const LINK_IDLE = 'text-primary hover:bg-peach/30 hover:text-accent';
const LINK_ACTIVE = 'bg-primary font-medium text-white';

function FilterBody({
  departments,
  childrenOf,
  activeCategoryId,
  availability,
  onSelectAvailability,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden="true" className="text-accent" />
          Categories
        </h2>

        <nav aria-label="Filter by category" className="mt-3 flex flex-col gap-1">
          <Link
            to={hrefFor({ availability })}
            aria-current={activeCategoryId ? undefined : 'page'}
            className={`${LINK_BASE} ${activeCategoryId ? LINK_IDLE : LINK_ACTIVE}`}
          >
            All products
          </Link>

          {departments.map((department) => {
            const children = childrenOf(department);
            const departmentActive = String(department._id) === String(activeCategoryId);

            return (
              <div key={department._id ?? department.slug} className="flex flex-col gap-1">
                <Link
                  to={hrefFor({ categorySlug: department.slug, availability })}
                  aria-current={departmentActive ? 'page' : undefined}
                  className={`${LINK_BASE} ${departmentActive ? LINK_ACTIVE : LINK_IDLE}`}
                >
                  {department.name}
                </Link>

                {children.length > 0 && (
                  <ul className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
                    {children.map((child) => {
                      const childActive = String(child._id) === String(activeCategoryId);

                      return (
                        <li key={child._id ?? child.slug}>
                          <Link
                            to={hrefFor({ categorySlug: child.slug, availability })}
                            aria-current={childActive ? 'page' : undefined}
                            className={`${LINK_BASE} text-[13px] ${
                              childActive
                                ? 'bg-peach/45 font-medium text-primary'
                                : 'text-muted hover:bg-peach/25 hover:text-accent'
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border pt-5">
        <h2 className="text-sm font-semibold text-primary">Availability</h2>

        <div className="mt-3 flex flex-col gap-1">
          {[
            { value: 'all', label: 'Everything' },
            { value: 'available', label: 'In stock only' },
          ].map((option) => {
            const checked = availability === option.value;

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                  checked ? 'bg-peach/35 font-medium text-primary' : 'text-muted hover:bg-peach/20'
                }`}
              >
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={checked}
                  onChange={() => onSelectAvailability(option.value)}
                  className="size-3.5 cursor-pointer accent-[#C0563A]"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProductFilters({
  categories = [],
  activeCategoryId = null,
  availability = 'all',
  onSelectAvailability,
}) {
  const departments = categories.filter(isActiveTopLevel);

  const childrenOf = (department) =>
    categories.filter((category) => {
      const parentId = parentIdOf(category);
      return (
        Boolean(parentId) &&
        String(parentId) === String(department._id) &&
        category.status === 'active'
      );
    });

  const bodyProps = {
    departments,
    childrenOf,
    activeCategoryId,
    availability,
    onSelectAvailability,
  };

  const activeName =
    categories.find((category) => String(category._id) === String(activeCategoryId))?.name ?? '';

  return (
    <>
      {/* Phones and tablets: collapsed by default, so the grid stays near the top. */}
      <details className="group rounded-3xl border border-border bg-white p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden="true" className="text-accent" />
            Filters
            {activeName && (
              <span className="rounded-full bg-peach/50 px-2 py-0.5 text-[11px] font-medium text-primary">
                {activeName}
              </span>
            )}
          </span>

          <span className="text-xs font-normal text-muted group-open:hidden">Show</span>
          <span className="hidden text-xs font-normal text-muted group-open:inline">Hide</span>
        </summary>

        <div className="mt-5">
          <FilterBody {...bodyProps} />
        </div>
      </details>

      {/* Desktop: the rail sits beside the grid. */}
      <aside
        aria-label="Product filters"
        className="hidden rounded-3xl border border-border bg-white p-5 lg:sticky lg:top-28 lg:block lg:self-start"
      >
        <FilterBody {...bodyProps} />
      </aside>
    </>
  );
}
