/**
 * Vector pantry shelf used while the 3D scene loads, and when WebGL is unavailable (or `?nowebgl`).
 * Pure SVG: no three.js imports, so it is safe to use as a Suspense fallback.
 */

const C = {
  forest: '#173F35',
  forest2: '#1F5244',
  leaf: '#8DBF75',
  leafWash: '#E5EFD9',
  cream: '#F7F4EC',
  paper: '#FFFEFA',
  terracotta: '#D98566',
  terraInk: '#9C4A2B',
  terraWash: '#F6E2D8',
  ink: '#252C28',
}

const TOPS = [262, 178, 94] as const
const FONT = "'Archivo Variable', ui-sans-serif, system-ui, sans-serif"

function Shadow({ cx, y, rx }: { cx: number; y: number; rx: number }) {
  return <ellipse cx={cx} cy={y} rx={rx} ry={3} fill="#5A3E22" opacity={0.18} />
}

function Jar({ x, w, h, food, lid, label, seed }: { x: number; w: number; h: number; food: string; lid: string; label: string; seed: number }) {
  const y = TOPS[2] - h
  const fillTop = y + h * 0.32
  const dots = Array.from({ length: 16 }, (_, i) => {
    const a = (seed * 97 + i * 53) % 100
    const b = (seed * 31 + i * 71) % 100
    return [x + 5 + (a / 100) * (w - 10), fillTop + 4 + (b / 100) * (TOPS[2] - fillTop - 8)] as const
  })
  return (
    <g>
      <Shadow cx={x + w / 2} y={TOPS[2]} rx={w / 2 + 2} />
      <rect x={x + 3} y={fillTop} width={w - 6} height={TOPS[2] - fillTop - 2} rx={4} fill={food} />
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={1.4} fill={C.ink} opacity={0.14} />
      ))}
      <rect x={x} y={y + 6} width={w} height={h - 6} rx={7} fill="#EAF1EC" fillOpacity={0.35} stroke="#9FB3A8" strokeOpacity={0.7} strokeWidth={1.2} />
      <rect x={x + 5} y={y + 12} width={3} height={h - 22} rx={1.5} fill="#FFFFFF" opacity={0.7} />
      <rect x={x + 3} y={y} width={w - 6} height={9} rx={2.5} fill={lid} />
      <rect x={x + 4} y={y + h * 0.5} width={w - 8} height={14} rx={2} fill={C.paper} stroke={C.forest} strokeOpacity={0.35} />
      <text x={x + w / 2} y={y + h * 0.5 + 10} textAnchor="middle" fontFamily={FONT} fontSize={7.5} fontWeight={800} fill={C.forest} letterSpacing={0.3}>
        {label}
      </text>
    </g>
  )
}

function Can({ x, pack, ink, accent, label }: { x: number; pack: string; ink: string; accent: string; label: string }) {
  const w = 34
  const h = 46
  const y = TOPS[1] - h
  return (
    <g>
      <Shadow cx={x + w / 2} y={TOPS[1]} rx={w / 2 + 2} />
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#C9CCC8" />
      <rect x={x} y={y + 4} width={w} height={h - 8} fill={pack} />
      <rect x={x} y={y + 4} width={w} height={3} fill={ink} opacity={0.85} />
      <rect x={x} y={y + h - 7} width={w} height={3} fill={ink} opacity={0.85} />
      <circle cx={x + w / 2} cy={y + 17} r={6} fill={accent} />
      <text x={x + w / 2} y={y + 33} textAnchor="middle" fontFamily={FONT} fontSize={6.5} fontWeight={800} fill={ink}>
        {label}
      </text>
      <rect x={x + 3} y={y + 5} width={3} height={h - 10} fill="#FFFFFF" opacity={0.22} />
      <rect x={x - 0.5} y={y} width={w + 1} height={3} rx={1.5} fill="#B5B9B4" />
      <rect x={x - 0.5} y={y + h - 3} width={w + 1} height={3} rx={1.5} fill="#B5B9B4" />
    </g>
  )
}

/** Static vector pantry shelf: crisp geometry in the PantryBridge palette. */
export function StaticPantryFallback({ className }: { className?: string }) {
  return (
    <div className={`${className || 'relative h-full w-full'} overflow-hidden bg-cream`}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Illustration of a wooden pantry shelf with jars of oats, rice and beans, labeled cans, a pasta box, a rice bag, onions, apples and bananas."
      >
        <defs>
          <linearGradient id="psf-wood" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#D8B088" />
            <stop offset="1" stopColor="#C99A6B" />
          </linearGradient>
          <linearGradient id="psf-back" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#E3C7A5" />
            <stop offset="1" stopColor="#D4B48E" />
          </linearGradient>
          <linearGradient id="psf-apple" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#D65A45" />
            <stop offset="1" stopColor="#A9352A" />
          </linearGradient>
          <radialGradient id="psf-floor" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#5A3E22" stopOpacity="0.22" />
            <stop offset="1" stopColor="#5A3E22" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* floor shadow */}
        <ellipse cx={200} cy={290} rx={190} ry={9} fill="url(#psf-floor)" />

        {/* unit */}
        <rect x={50} y={30} width={300} height={258} fill="url(#psf-back)" />
        {[0.18, 0.36, 0.52, 0.71, 0.86].map((t) => (
          <path key={t} d={`M50 ${30 + t * 258} q75 -3 150 0 t150 0`} stroke="#B98F64" strokeOpacity={0.28} strokeWidth={1} fill="none" />
        ))}
        <rect x={40} y={26} width={10} height={262} fill="url(#psf-wood)" />
        <rect x={350} y={26} width={10} height={262} fill="url(#psf-wood)" />
        <rect x={36} y={20} width={328} height={9} rx={1.5} fill="#D9B48C" />
        <rect x={36} y={28} width={328} height={2} fill="#A8794D" opacity={0.45} />

        {/* top shelf: glass jars + oil bottle */}
        <Jar x={66} w={42} h={60} food="#E3CC98" lid={C.terracotta} label="OATS" seed={3} />
        <Jar x={118} w={42} h={60} food="#F4EFE2" lid={C.forest} label="RICE" seed={7} />
        <Jar x={170} w={42} h={60} food="#C0703F" lid={C.leaf} label="BEANS" seed={11} />
        <g>
          <Shadow cx={238} y={TOPS[2]} rx={13} />
          <path d={`M228 ${TOPS[2]} v-42 q0 -8 6 -12 v-12 h8 v12 q6 4 6 12 v42 z`} fill="#E3B23C" fillOpacity={0.85} />
          <rect x={233} y={TOPS[2] - 72} width={10} height={8} rx={1.5} fill={C.forest} />
          <rect x={228} y={TOPS[2] - 32} width={20} height={16} fill={C.paper} />
          <text x={238} y={TOPS[2] - 21} textAnchor="middle" fontFamily={FONT} fontSize={6} fontWeight={800} fill={C.forest}>
            OIL
          </text>
          <rect x={231} y={TOPS[2] - 44} width={2.5} height={38} fill="#FFFFFF" opacity={0.35} />
        </g>
        <g>
          <Shadow cx={290} y={TOPS[2]} rx={28} />
          <rect x={262} y={TOPS[2] - 18} width={56} height={18} rx={3} fill="#F2B84B" />
          <rect x={270} y={TOPS[2] - 14} width={40} height={10} rx={1.5} fill={C.paper} />
          <text x={290} y={TOPS[2] - 6.5} textAnchor="middle" fontFamily={FONT} fontSize={6} fontWeight={800} fill={C.forest}>
            CHEDDAR
          </text>
        </g>

        {/* middle shelf: cans + pasta box + milk */}
        <Can x={64} pack={C.forest} ink={C.cream} accent="#2B2B2B" label="BLACK BEANS" />
        <Can x={102} pack={C.terracotta} ink={C.paper} accent="#B8392A" label="TOMATOES" />
        <Can x={140} pack={C.leaf} ink={C.forest} accent="#F2CF55" label="CORN" />
        <Can x={178} pack={C.cream} ink={C.forest} accent={C.terracotta} label="TUNA" />
        <g>
          <Shadow cx={242} y={TOPS[1]} rx={22} />
          <rect x={222} y={TOPS[1] - 66} width={40} height={66} rx={1.5} fill={C.forest} />
          <rect x={222} y={TOPS[1] - 60} width={40} height={4} fill={C.leaf} />
          <text x={242} y={TOPS[1] - 44} textAnchor="middle" fontFamily={FONT} fontSize={10} fontWeight={800} fill={C.cream} letterSpacing={0.4}>
            PASTA
          </text>
          <rect x={228} y={TOPS[1] - 34} width={28} height={22} rx={4} fill="#FFF6DE" />
          {[
            [233, -26, 25],
            [244, -20, -30],
            [236, -16, 60],
            [249, -28, 10],
          ].map(([px, py, r]) => (
            <rect key={`${px}${py}`} x={px} y={TOPS[1] + py} width={9} height={3.4} rx={1.2} fill="#F0C96A" transform={`rotate(${r} ${px + 4.5} ${TOPS[1] + py + 1.7})`} />
          ))}
        </g>
        <g>
          <Shadow cx={295} y={TOPS[1]} rx={18} />
          <rect x={279} y={TOPS[1] - 56} width={32} height={56} fill={C.paper} />
          <path d={`M279 ${TOPS[1] - 56} l16 -14 l16 14 z`} fill="#EDE8DA" />
          <rect x={293} y={TOPS[1] - 76} width={4} height={8} fill="#EDE8DA" />
          <path d={`M279 ${TOPS[1] - 16} q16 -8 32 0 v16 h-32 z`} fill={C.leaf} />
          <text x={295} y={TOPS[1] - 32} textAnchor="middle" fontFamily={FONT} fontSize={8} fontWeight={800} fill={C.forest}>
            MILK
          </text>
          <rect x={279} y={TOPS[1] - 56} width={32} height={56} fill="none" stroke="#D9D6C8" />
        </g>

        {/* bottom shelf: rice bag + produce */}
        <g>
          <Shadow cx={88} y={TOPS[0]} rx={26} />
          <path d={`M64 ${TOPS[0]} v-50 q0 -8 6 -10 h36 q6 2 6 10 v50 z`} fill={C.paper} stroke="#D9D6C8" />
          <rect x={66} y={TOPS[0] - 66} width={44} height={6} rx={2} fill="#EDE8DA" />
          <text x={88} y={TOPS[0] - 30} textAnchor="middle" fontFamily={FONT} fontSize={10} fontWeight={800} fill={C.forest}>
            RICE
          </text>
          <rect x={64} y={TOPS[0] - 16} width={48} height={8} fill={C.leaf} />
        </g>
        {/* onions */}
        {[132, 152, 142].map((cx, i) => {
          const cy = TOPS[0] - 13 - (i === 2 ? 2 : 0)
          return (
            <g key={`o${i}`}>
              <path d={`M${cx - 12} ${cy} q0 -14 12 -16 q12 2 12 16 q0 12 -12 13 q-12 -1 -12 -13 z`} fill="#C98B4A" />
              <path d={`M${cx} ${cy - 16} l-1.5 -6 h3 z`} fill="#8A5A2B" />
              <path d={`M${cx - 4} ${cy - 12} q-3 10 0 22`} stroke="#8A5A2B" strokeOpacity={0.5} fill="none" />
            </g>
          )
        })}
        <Shadow cx={142} y={TOPS[0]} rx={24} />
        {/* apples */}
        {[186, 210].map((cx) => (
          <g key={`a${cx}`}>
            <Shadow cx={cx} y={TOPS[0]} rx={12} />
            <path d={`M${cx} ${TOPS[0] - 20} q-14 -6 -13 8 q1 12 13 12 q12 0 13 -12 q1 -14 -13 -8 z`} fill="url(#psf-apple)" />
            <path d={`M${cx} ${TOPS[0] - 19} q1 -6 3 -8`} stroke="#5B3A1E" strokeWidth={1.6} fill="none" strokeLinecap="round" />
            <path d={`M${cx + 2} ${TOPS[0] - 25} q6 -3 9 1 q-5 3 -9 -1 z`} fill={C.leaf} />
            <ellipse cx={cx - 6} cy={TOPS[0] - 13} rx={2} ry={3.5} fill="#FFFFFF" opacity={0.3} />
          </g>
        ))}
        {/* bananas */}
        <g>
          <Shadow cx={258} y={TOPS[0]} rx={30} />
          {[0, 5, 10].map((dy, i) => (
            <path
              key={`b${i}`}
              d={`M230 ${TOPS[0] - 22 + dy * 0.4} q26 ${22 - dy * 0.3} 56 ${-6 + dy * 0.2} q-28 ${16 - dy * 0.2} -56 ${6 - dy * 0.2} z`}
              fill={i === 1 ? '#E9C243' : '#F1CC4E'}
              stroke="#C9A233"
              strokeOpacity={0.5}
            />
          ))}
          <path d={`M227 ${TOPS[0] - 24} l5 4`} stroke="#5B4A1E" strokeWidth={2.4} strokeLinecap="round" />
        </g>
        {/* potatoes */}
        {[310, 330].map((cx, i) => (
          <g key={`p${cx}`}>
            <Shadow cx={cx} y={TOPS[0]} rx={12} />
            <ellipse cx={cx} cy={TOPS[0] - 9 - i} rx={13} ry={9} fill="#B88A58" />
            <circle cx={cx - 4} cy={TOPS[0] - 11} r={1} fill="#8B6338" />
            <circle cx={cx + 5} cy={TOPS[0] - 7} r={1} fill="#8B6338" />
          </g>
        ))}

        {/* shelf boards with front lip (drawn last so items sit on them) */}
        {TOPS.map((t) => (
          <g key={`b${t}`}>
            <rect x={50} y={t} width={300} height={4} fill="#E6C49C" />
            <rect x={48} y={t + 4} width={304} height={7} rx={1} fill="url(#psf-wood)" />
            <rect x={48} y={t + 11} width={304} height={1.5} fill="#8E6440" opacity={0.35} />
          </g>
        ))}
        <rect x={50} y={273} width={300} height={15} fill="#BF9068" />
      </svg>
    </div>
  )
}

export default StaticPantryFallback
