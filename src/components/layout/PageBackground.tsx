'use client';

export default function PageBackground() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    size: 2 + (i % 3),
    left: `${8 + i * 11}%`,
    bottom: `${8 + (i % 4) * 7}%`,
    delay: `${i * 1.2}s`,
    duration: `${6 + i * 1.4}s`,
  }));

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

      {/* Pulsing grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,211,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,211,0,0.035) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          animation: 'grid-glow 5s ease-in-out infinite',
        }}
      />

      {/* Yellow orb — top-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: '60vw',
          height: '60vw',
          top: '-20%',
          left: '-15%',
          background: 'radial-gradient(circle, rgba(255,211,0,0.14) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'orb-drift 20s ease-in-out infinite',
        }}
      />

      {/* Cyan orb — bottom-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: '55vw',
          height: '55vw',
          bottom: '-15%',
          right: '-12%',
          background: 'radial-gradient(circle, rgba(0,240,255,0.10) 0%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'orb-drift-reverse 25s ease-in-out infinite',
        }}
      />

      {/* Pink orb — mid-right accent */}
      <div
        className="absolute rounded-full"
        style={{
          width: '35vw',
          height: '35vw',
          top: '25%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(255,184,255,0.07) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orb-drift 32s ease-in-out infinite reverse',
        }}
      />

      {/* Horizontal scan line */}
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,211,0,0.35), transparent)',
          animation: 'scan 7s linear infinite',
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            bottom: p.bottom,
            background: '#FFD300',
            boxShadow: '0 0 6px rgba(255,211,0,0.9)',
            animation: `particle-float ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* CRT scanline overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.15) 50%)',
          backgroundSize: '100% 4px',
          animation: 'pulse-soft 4s ease-in-out infinite',
          opacity: 0.4,
        }}
      />
    </div>
  );
}
