import { Headset, Leaf, ShieldCheck, Truck } from 'lucide-react';

// The wordmark shown on the auth pages. Change this one word to rename it.
const BRAND = 'Lunella';

// The three promises that sit under the headline.
const highlights = [
  { id: 'shipping', label: 'Free shipping', Icon: Truck },
  { id: 'payment', label: 'Secure payment', Icon: ShieldCheck },
  { id: 'support', label: '24/7 support', Icon: Headset },
];

// Left half of the auth pages (desktop only), built as one structured column:
// brand, headline, promises, then a framed photo filling whatever height is
// left. The photo is /images/placeholder-banner.svg until real photography is
// added — swap the src and the frame keeps working, because the art is cropped
// with object-cover rather than laid out around fixed dimensions.
export default function AuthBenefits() {
  return (
    <aside className="hidden min-h-0 flex-col gap-8 bg-background p-8 lg:flex xl:gap-10 xl:p-12">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-3 text-primary">
        <Leaf size={22} strokeWidth={1.6} className="text-accent" aria-hidden="true" />
        <span className="text-xl font-medium tracking-[0.18em]">{BRAND}</span>
      </div>

      {/* Headline + promises */}
      <div className="max-w-[520px] shrink-0">
        <div className="flex items-center gap-3">
          <span className="h-px w-9 bg-accent/50" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            Discover your style
          </p>
        </div>

        <h2 className="mt-4 font-serif text-[36px] font-medium leading-[1.06] tracking-tight text-primary xl:text-[44px]">
          Fashion for <em className="italic text-accent">every you</em>
        </h2>

        <p className="mt-4 max-w-[400px] text-sm leading-6 text-muted xl:text-[15px] xl:leading-7">
          Trendy styles, timeless essentials, and more — all in one place.
        </p>

        <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 xl:mt-7 xl:gap-x-6">
          {highlights.map(({ id, label, Icon }) => (
            <li key={id} className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent">
                <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="whitespace-nowrap text-xs font-medium text-primary/85">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Framed photo, filling the rest of the column */}
      <figure className="relative min-h-[170px] flex-1 overflow-hidden rounded-[28px] border border-border bg-peach">
        <img
          src="/images/placeholder-banner.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </figure>
    </aside>
  );
}
