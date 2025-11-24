export function Noise() {
  return (
    <svg
      className="mix-blend-mode-overlay pointer-events-none absolute inset-0 z-[-1] h-full w-full opacity-[0.4]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="4"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  );
}
