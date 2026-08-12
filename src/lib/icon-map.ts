import { PlanType } from './types';

export interface IconProps {
  name: string;
  className?: string;
}

// Centralized icon name mapping for lucide-react
export const ICON_MAP: Record<string, string> = {
  // Manual 2 - Editor sections
  'User': 'User',
  'Layout': 'Layout',
  'Sparkles': 'Sparkles',
  'Clock': 'Clock',
  'QrCode': 'QrCode',
  'Briefcase': 'Briefcase',
  'ShoppingBag': 'ShoppingBag',
  'Instagram': 'Instagram',
  'Images': 'Images',
  'FileText': 'FileText',
  'Quote': 'Quote',
  'Frame': 'Frame',
  'Users': 'Users',
  'Share2': 'Share2',
  'Flag': 'Flag',
  'Type': 'Type',
  'Code': 'Code',
  'Search': 'Search',
  'Shield': 'Shield',
  'ScrollText': 'ScrollText',
  'Settings': 'Settings',
  'MessageCircle': 'MessageCircle',
  'CreditCard': 'CreditCard',
  // Dashboard sections
  'LayoutDashboard': 'LayoutDashboard',
  'Mail': 'Mail',
  'Calendar': 'Calendar',
  'Package': 'Package',
  'Database': 'Database',
};
