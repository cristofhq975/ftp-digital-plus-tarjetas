'use client';

import { useAppStore } from '@/lib/store';
import { LandingPage } from '@/components/sections/landing-page';
import { PricingPage } from '@/components/sections/pricing-page';
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

export default function Home() {
  const currentView = useAppStore(s => s.currentView);

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'pricing':
      return <PricingPage />;
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
    default:
      return <LandingPage />;
  }
}
