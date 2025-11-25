const NOISE_SVG = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export function Noise() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[-1] opacity-40"
      style={{
        backgroundImage: NOISE_SVG,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
