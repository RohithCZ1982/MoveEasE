import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
}

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { icon: 30, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 56, text: 'text-3xl', sub: 'text-xs' },
  }

  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Open moving box with speed lines */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 220 195"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Front face of box */}
        <path
          d="M72,82 L72,170 L138,170 L138,82"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Left face of box */}
        <path
          d="M38,58 L72,82 L72,170 L38,146 Z"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Top rim (open box) */}
        <path
          d="M38,58 L72,82 L138,82"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Open lid panel */}
        <path
          d="M38,58 L72,82 L54,30 L20,8 Z"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Speed lines */}
        <line x1="145" y1="68" x2="215" y2="60" stroke="currentColor" strokeWidth="7.5" strokeLinecap="round"/>
        <line x1="145" y1="83" x2="211" y2="76" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round"/>
        <line x1="145" y1="97" x2="206" y2="91" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
        <line x1="145" y1="110" x2="200" y2="106" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="145" y1="122" x2="193" y2="119" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="145" y1="133" x2="185" y2="131" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="145" y1="143" x2="175" y2="141" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-black tracking-tight', s.text)}>
            Move <span className="text-orange-400">EasE</span>
          </span>
          <span className={cn('font-semibold tracking-widest uppercase opacity-80', s.sub)}>
            Packers &amp; Movers
          </span>
        </div>
      )}
    </div>
  )
}
