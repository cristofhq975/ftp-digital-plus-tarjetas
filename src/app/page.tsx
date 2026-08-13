'use client';

import { useAppStore } from '@/lib/store';
import { PageTransition } from '@/components/animations/page-transition';
import { LandingPage } from '@/components/sections/landing-page';
import { PricingPage } from '@/components/sections/pricing-page';
import { CheckoutPage } from '@/components/sections/checkout-page';
import { LoginPage } from '@/components/sections/login-page';
import { Dashboard } from '@/components/sections/dashboard';
import { CardEditor } from '@/components/sections/card-editor';
import { PublicCardSection } from '@/components/sections/public-card';
import { QrExpiredSection } from '@/components/sections/qr-expired';
import { AnalyticsPage } from '@/components/sections/analytics-page';
import { TemplateGallery } from '@/components/sections/template-gallery';
import { HelpCenter } from '@/components/sections/help-center';
import { SupportPage } from '@/components/sections/support-page';
import { TermsPage, PrivacyPage, RefundsPage } from '@/components/sections/legal-pages';
import { ProfilePage } from '@/components/sections/profile-page';
import { BlogPage } from '@/components/sections/blog-page';
import { BlogPostPage } from '@/components/sections/blog-post-page';
import { ComparePage } from '@/components/sections/compare-page';
import { NotificationsPage } from '@/components/sections/notifications-page';
import { CasesPage } from '@/components/sections/cases-page';
import { ThemesPage } from '@/components/sections/themes-page';
import { KioskMode } from '@/components/sections/kiosk-mode';

function CurrentView() {
  const currentView = useAppStore(s => s.currentView);

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'pricing':
      return <PricingPage />;
    case 'checkout':
      return <CheckoutPage />;
    case 'login':
    case 'register':
      return <LoginPage />;
    case 'dashboard':
    case 'messages':
    case 'appointments':
    case 'orders':
    case 'virtual-funds':
    case 'affiliations':
    case 'storage':
    case 'settings':
      return <Dashboard />;
    case 'stats':
      return <AnalyticsPage />;
    case 'compare':
      return <ComparePage />;
    case 'notifications':
      return <NotificationsPage />;
    case 'cases':
      return <CasesPage />;
    case 'themes':
      return <ThemesPage />;
    case 'kiosk':
      return <KioskMode />;
    case 'template-gallery':
      return <TemplateGallery />;
    case 'help':
      return <HelpCenter />;
    case 'support':
      return <SupportPage />;
    case 'editor':
      return <CardEditor />;
    case 'public-card':
      return <PublicCardSection />;
    case 'qr-expired':
      return <QrExpiredSection />;
    case 'terms':
      return <TermsPage />;
    case 'privacy':
      return <PrivacyPage />;
    case 'refunds':
      return <RefundsPage />;
    case 'profile':
      return <ProfilePage />;
    case 'blog':
      return <BlogPage />;
    case 'blog-post':
      return <BlogPostPage />;
    default:
      return <LandingPage />;
  }
}

export default function Home() {
  // PageTransition lee `currentView` del store y usa la key para animar
  // la salida/entrada entre vistas con un fade + slide sutil.
  return (
    <PageTransition>
      <CurrentView />
    </PageTransition>
  );
}
