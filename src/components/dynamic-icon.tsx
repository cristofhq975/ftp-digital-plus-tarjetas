import {
  User, Layout, Sparkles, Clock, QrCode, Briefcase, ShoppingBag,
  Instagram, Images, FileText, Quote, Frame, Users, Share2, Flag,
  Type, Code, Search, Shield, ScrollText, Settings, MessageCircle,
  CreditCard, LayoutDashboard, Mail, Calendar, Package, Database,
  GitCompare, type LucideProps,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  User, Layout, Sparkles, Clock, QrCode, Briefcase, ShoppingBag,
  Instagram, Images, FileText, Quote, Frame, Users, Share2, Flag,
  Type, Code, Search, Shield, ScrollText, Settings, MessageCircle,
  CreditCard, LayoutDashboard, Mail, Calendar, Package, Database,
  GitCompare,
};

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] || User;
  return <Icon {...props} />;
}
