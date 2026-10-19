import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

import SideNav from '../dashboard/SideNav';
import { profileSections } from '../../data/dashboardNav';

// Desktop sidebar for the customer profile area. The wishlist already has its
// own section in the list, so the footer only carries the vendor application,
// which lives outside the account area.
export default function ProfileSidebar() {
  return (
    <SideNav
      label="My account"
      base="/account"
      sections={profileSections}
      footer={
        <Link
          to="/vendor/apply"
          className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-3 py-2.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Store size={14} strokeWidth={1.8} aria-hidden="true" />
          Become a vendor
        </Link>
      }
    />
  );
}
