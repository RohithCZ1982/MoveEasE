import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
}

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 52, text: 'text-3xl', sub: 'text-xs' },
  }

  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Box with speed lines - inspired by the reference image */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 3D Box */}
        <path
          d="M8 16L24 8L40 16V32L24 40L8 32V16Z"
          fill="#1e3a5f"
          stroke="#1e3a5f"
          strokeWidth="1"
        />
        <path
          d="M8 16L24 24L40 16"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M24 24V40"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 16L24 24L24 40L8 32V16Z"
          fill="#2563eb"
          opacity="0.7"
        />
        <path
          d="M40 16L24 24L24 40L40 32V16Z"
          fill="#1e3a5f"
          opacity="0.9"
        />
        {/* Speed lines */}
        <line x1="42" y1="14" x2="48" y2="14" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
        <line x1="43" y1="18" x2="48" y2="18" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        <line x1="44" y1="22" x2="48" y2="22" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="44" y1="26" x2="48" y2="26" stroke="#f97316" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        <line x1="45" y1="30" x2="48" y2="30" stroke="#f97316" strokeWidth="1" strokeLinecap="round" opacity="0.2"/>
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold text-[#1e3a5f]', s.text)}>
            Swift<span className="text-orange-500">Shift</span>
          </span>
          <span className={cn('font-semibold tracking-widest text-[#1e3a5f] uppercase', s.sub)}>
            Packers & Movers
          </span>
        </div>
      )}
    </div>
  )
}
