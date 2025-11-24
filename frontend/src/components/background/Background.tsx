import styles from "./Background.module.css";
import { Noise } from "./Noise";

export function Background() {
  return (
    <>
      <div className={styles["gradient-background"]} />
      <Noise />
    </>
  );
}
