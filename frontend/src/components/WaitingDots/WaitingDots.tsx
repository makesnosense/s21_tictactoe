import waitingDotsStyles from "./WaitingDots.module.css";

export default function WaitingDots() {
  const dotClass = `${waitingDotsStyles["animate-pulse-scan"]} scale-80 opacity-30`;
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 text-nowrap">
      <span className="inline-flex gap-1">
        <span className={dotClass} style={{ animationDelay: "0ms" }}>
          •
        </span>
        <span className={dotClass} style={{ animationDelay: "150ms" }}>
          •
        </span>
        <span className={dotClass} style={{ animationDelay: "300ms" }}>
          •
        </span>
      </span>
    </div>
  );
}
