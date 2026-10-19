import { isVisible } from '../../data/content';
import AnnouncementBar from '../home/Announcementbar';
import WhatsAppButton from '../common/WhatsAppButton';
import Footer from './Footer';
import Header from './Header';

// Shared shell for the storefront pages: announcement bar, header, page
// content and footer in one place.
// Each piece can be switched off in src/data/sectionVisibility.json, so the
// shell itself is what decides whether a band is rendered.
// The floating WhatsApp button is opt-in per page as well: only pages that pass
// showWhatsApp render it, so it stays on the contact page and never covers
// other pages' controls.
export default function StorefrontLayout({ children, showWhatsApp = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {isVisible('announcementBar') && <AnnouncementBar />}
      {isVisible('header') && <Header />}

      <main className="flex-1">{children}</main>

      {isVisible('footer') && <Footer />}

      {/* Fixed to the bottom-right of the viewport. Opt-in per page. */}
      <WhatsAppButton hidden={!showWhatsApp || !isVisible('whatsappButton')} />
    </div>
  );
}
