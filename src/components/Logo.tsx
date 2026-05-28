import { Link } from 'react-router'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizeMap = {
  sm: { wrap: 'h-[44px] w-[180px]', text: 'text-[15px]', gap: 'gap-2' },
  md: { wrap: 'h-[56px] w-[230px]', text: 'text-[18px]', gap: 'gap-2.5' },
  lg: { wrap: 'h-[72px] w-[300px]', text: 'text-[22px]', gap: 'gap-3' },
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = sizeMap[size]

  return (
    <Link to="/" className={`flex items-center ${s.gap} group`}>
      {/* Logo Badge — wide rounded container that fits the full logo text */}
      <div
        className={`${s.wrap} relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl`}
        style={{
          background: 'linear-gradient(135deg, #C8A55C 0%, #A08040 50%, #C8A55C 100%)',
          padding: '2px',
          filter: 'drop-shadow(0 2px 8px rgba(200, 165, 92, 0.35))',
        }}
      >
        {/* Inner container */}
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg"
          style={{
            background: 'linear-gradient(180deg, #1A1A1F 0%, #232328 100%)',
          }}
        >
          {/* Logo image — scaled to fit entirely within the container */}
          <img
            src="/logo-shield.png"
            srcSet="/logo-shield.png 1x, /logo-shield@2x.png 2x"
            alt="Virtus Publishing and Bookstore Group"
            className="w-[95%] h-[95%] object-contain"
            style={{
              filter: 'contrast(1.08) brightness(1.05)',
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Optional text label */}
      {showText && (
        <span
          className={`${s.text} font-semibold text-gradient-gold tracking-[-0.02em] group-hover:brightness-110 transition-all whitespace-nowrap hidden lg:inline`}
        >
          Publishing
        </span>
      )}
    </Link>
  )
}
