import { Link } from 'react-router'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizeMap = {
  sm: { shield: 'h-[52px] w-10', text: 'text-[15px]', gap: 'gap-2' },
  md: { shield: 'h-[68px] w-[52px]', text: 'text-[18px]', gap: 'gap-2.5' },
  lg: { shield: 'h-[88px] w-[68px]', text: 'text-[22px]', gap: 'gap-3' },
}

/** Classic shield clip-path: flat top, curved sides, pointed bottom */
const SHIELD_CLIP = 'polygon(50% 0%, 100% 8%, 100% 62%, 50% 100%, 0% 62%, 0% 8%)'

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = sizeMap[size]

  return (
    <Link to="/" className={`flex items-center ${s.gap} group`}>
      {/* Shield Container */}
      <div
        className={`${s.shield} relative flex-shrink-0 flex items-center justify-center overflow-hidden`}
        style={{
          clipPath: SHIELD_CLIP,
          WebkitClipPath: SHIELD_CLIP,
          background: 'linear-gradient(180deg, #C8A55C 0%, #A08040 100%)',
          padding: '2.5px',
          filter: 'drop-shadow(0 2px 6px rgba(200, 165, 92, 0.3))',
        }}
      >
        {/* Inner dark background — fills the shield completely */}
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{
            clipPath: SHIELD_CLIP,
            WebkitClipPath: SHIELD_CLIP,
            background: 'linear-gradient(180deg, #1A1A1F 0%, #232328 100%)',
          }}
        >
          {/* Logo image — scaled to fill with NO gaps */}
          <img
            src="/logo-shield.png"
            srcSet="/logo-shield.png 1x, /logo-shield@2x.png 2x"
            alt="Virtus Publishing and Bookstore Group"
            className="w-[112%] h-[112%] object-cover"
            style={{
              filter: 'contrast(1.05) brightness(1.02)',
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Text */}
      {showText && (
        <span
          className={`${s.text} font-semibold text-gradient-gold tracking-[-0.02em] group-hover:brightness-110 transition-all whitespace-nowrap`}
        >
          Virtus
        </span>
      )}
    </Link>
  )
}
