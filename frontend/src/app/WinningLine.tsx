import styles from "./WinningLine.module.css";
import type { WinningLine as WinningLineType } from "../../../shared/types/game";

interface WinningLineProps {
  line: WinningLineType;
}

export function WinningLine({ line }: WinningLineProps) {
  const cellSize = 40;
  const gap = 1;

  const getCellCenterCoordinates = (pos: { row: number; col: number }) => ({
    x: pos.col * (cellSize + gap) + cellSize / 2,
    y: pos.row * (cellSize + gap) + cellSize / 2,
  });

  const start = getCellCenterCoordinates(line.start);
  const end = getCellCenterCoordinates(line.end);

  // calculate actual line length for responsive dashing
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  const lineLength = Math.ceil(Math.sqrt(deltaX ** 2 + deltaY ** 2));

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      viewBox="0 0 123 123" // 3 cells * 40px + 2 gaps * 1px = 122px
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={lineLength}
        className={`${styles["animate-draw"]} animate-draw text-zinc-900 dark:text-zinc-100`}
        style={{ "--line-length": lineLength } as React.CSSProperties}
      />
    </svg>
  );
}
