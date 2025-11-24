import { Noise } from "./Noise";

function generateRandomGradient() {
  const gradients = [
    { color: "#fbc2eb", stop: 50 }, // pink
    { color: "#a6c1ee", stop: 50 }, // blue
    { color: "#c2e9fb", stop: 60 }, // light blue
    { color: "#ffeaa7", stop: 50 }, // yellow
    { color: "#fdcbf1", stop: 50 }, // light pink
  ];

  const radialGradients = gradients
    .map(({ color, stop }) => {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${stop}%)`;
    })
    .join(", ");

  return `${radialGradients}, #f5f0ea`;
}

const gradient = generateRandomGradient();

export function Background() {
  return (
    <>
      <div
        className="absolute inset-0 -z-10"
        style={{ background: gradient }}
      />
      <Noise />
    </>
  );
}
