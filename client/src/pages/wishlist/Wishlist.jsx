import PageHero from '../../components/common/PageHero';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import WishlistBoard from '../../components/wishlist/WishlistBoard';

// /wishlist — the dedicated wishlist page, reachable from the header, the profile
// sidebar and after saving an item.
export default function Wishlist() {
  return (
    <StorefrontLayout>
      <PageHero
        eyebrow="Saved for later"
        title="Your wishlist"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]}
        description="Everything you have saved, with the live price and availability from the catalog. Items stay here until you remove them."
      />

      <section className="w-full bg-background py-12 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8 lg:px-10">
          <WishlistBoard />
        </div>
      </section>
    </StorefrontLayout>
  );
}
