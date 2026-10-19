import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

import SideNav from '../dashboard/SideNav';
import { adminSections } from '../../data/dashboardNav';

// Desktop sidebar for the admin area. The mobile version of these links is in
// AdminHeader (both read src/data/dashboardNav.js).
export default function AdminSidebar() {
  return (
    <SideNav
      label="Admin"
      base="/admin"
      sections={adminSections}
      footer={
        <Link
          to="/vendor-preview"
          className="mt-2 flex items-center gap-2 rounded-2xl border border-dashed border-peach px-3 py-2.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
          Vendor UI preview
        </Link>
      }
    />
  );
}
