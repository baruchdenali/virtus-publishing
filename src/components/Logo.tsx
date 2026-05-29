import { Link } from 'react-router'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

// logo.png is 1024x559 (ratio 1.83:1) — the ORIGINAL with all readable text
const LOGO_ASPECT = 1024 / 559 // 1.83

const sizeMap = {
  sm: { h: 'h-[40px]', w: 'w-[73px]' },   // 40 * 1.83 = 73
  md: { h: 'h-[52px]', w: 'w-[95px]' },   // 52 * 1.83 = 95
  lg: { h: 'h-[68px]', w: 'w-[124px]' },  // 68 * 1.83 = 124
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = sizeMap[size]

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      {/* Logo container — exact aspect ratio match to logo.png (1.83:1) */}
      <div
        className={`${s.h} ${s.w} relative flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg`}
        style={{
          background: 'linear-gradient(135deg, #C8A55C 0%, #A08040 50%, #C8A55C 100%)',
          padding: '1.5px',
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden rounded-md"
          style={{ background: '#1A1A1F' }}
        >
          {/* Use the ORIGINAL logo.png — it has ALL the text readable */}
          <img
            src="/logo.png"
            alt="Virtus Publishing and Bookstore Group"
            className="w-full h-full object-contain"
            style={{ filter: 'contrast(1.05) brightness(1.02)' }}
            draggable={false}
          />
        </div>
      </div>

      {/* Site name next to logo */}
      {showText && (
        <span className="text-[16px] font-semibold text-gradient-gold tracking-[-0.01em] group-hover:brightness-110 transition-all whitespace-nowrap">
          Virtus
        </span>
      )}
    </Link>
  )
}
