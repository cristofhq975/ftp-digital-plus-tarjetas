'use client';

import { useAppStore } from '@/lib/store';
import { LandingPage } from '@/components/sections/landing-page';
import { PricingPage } from '@/components/sections/pricing-page';
import { LoginPage } from '@/components/sections/login-page';
import { Dashboard } from '@/components/sections/dashboard';
import { CardEditor } from '@/components/sections/card-editor';
import { PublicCardSection } from '@/components/sections/public-card';
import { QrExpiredSection } from '@/components/sections/qr-expired';

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
    case 'stats':
      return <Dashboard />;
    case 'editor':
      return <CardEditor />;
    case 'public-card':
      return <PublicCardSection />;
    case 'qr-expired':
      return <QrExpiredSection />;
    default:
      return <LandingPage />;
  }
}
