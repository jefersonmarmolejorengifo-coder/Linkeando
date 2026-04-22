type LogoProps = {
  size?: number
  invert?: boolean
  className?: string
}

export default function Logo({ size = 28, invert = false, className }: LogoProps) {
  const verde = '#1D9E75'
  const verdeClaro = '#E1F5EE'
  const verdeLight = '#9FE1CB'

  const mainStroke = invert ? '#ffffff' : verde
  const mainFill = invert ? '#ffffff' : verde
  const inner = invert ? verde : verdeClaro
  const pinDot = invert ? verdeClaro : verdeLight

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Vinclu"
    >
      <circle cx="32" cy="22" r="15" fill={mainFill} />
      <circle cx="32" cy="22" r="8.5" fill={inner} />
      <rect
        x="25.5"
        y="18.5"
        width="9.5"
        height="6"
        rx="3"
        fill="none"
        stroke={mainStroke}
        strokeWidth="2.2"
      />
      <rect
        x="29.5"
        y="20.5"
        width="9.5"
        height="6"
        rx="3"
        fill="none"
        stroke={mainStroke}
        strokeWidth="2.2"
      />
      <path d="M32 37 L25 28 Q32 31 39 28 Z" fill={mainFill} />
      <circle cx="32" cy="49" r="2" fill={pinDot} opacity="0.8" />
      <circle
        cx="32"
        cy="49"
        r="4"
        fill="none"
        stroke={pinDot}
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  )
}
