import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  theme?: 'light' | 'dark';
}

export function FTPLogo({ variant = 'full', className, theme = 'light' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 48 48"
        className={cn('h-8 w-8', className)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ftpIconGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="ftpIconGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ftpIconGrad)" />
        <path
          d="M14 16h20M14 24h14M14 32h8"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="34" cy="32" r="6" fill="url(#ftpIconGold)" stroke="white" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 48"
      className={cn('h-10 w-auto', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ftpFullGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="ftpFullGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect x="2" y="6" width="36" height="36" rx="10" fill="url(#ftpFullGrad)" />
      <path
        d="M12 16h16M12 24h12M12 32h8"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="30" cy="32" r="5" fill="url(#ftpFullGold)" stroke="white" strokeWidth="1.5" />
      <text
        x="48"
        y="22"
        fontFamily="'Poppins', Arial, sans-serif"
        fontSize="16"
        fontWeight="800"
        fill={theme === 'dark' ? '#f8fafc' : '#0f172a'}
      >
        FTP Digital
      </text>
      <text
        x="48"
        y="38"
        fontFamily="'Poppins', Arial, sans-serif"
        fontSize="16"
        fontWeight="800"
        fill="url(#ftpFullGold)"
      >
        Plus
      </text>
    </svg>
  );
}
