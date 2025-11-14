import waitingDotsStyles from "./WaitingDots.module.css";

export default function WaitingDots() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 text-nowrap">
      <span className="inline-flex gap-1">
        <span
          className={`${waitingDotsStyles["animate-pulse-scan"]} opacity-30`}
          style={{ animationDelay: "0ms" }}
        >
          .
        </span>
        <span
          className="animate-pulse-scan opacity-30"
          style={{ animationDelay: "150ms" }}
        >
          .
        </span>
        <span
          className="animate-pulse-scan opacity-30"
          style={{ animationDelay: "300ms" }}
        >
          .
        </span>
      </span>
    </div>
  );
}
