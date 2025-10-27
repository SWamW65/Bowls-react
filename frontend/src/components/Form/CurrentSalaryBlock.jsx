import styles from "./CurrentSalaryBlock.module.css";
import { useState } from "react";

export default function CurrentSalaryBlock() {
  return (
    <div className={styles.salaryBlock}>
      <div className={styles.salaryHeader}>
        <h2>Месяц</h2>
      </div>
      <div className={styles.salaryContent}>
        <div className={styles.salaryMonth}>
          <h3>За месяц:</h3>
          <span>29500 руб.</span>
        </div>
        <div className={styles.salaryToday}>
          <h4>За сегодня</h4>
          <span>3440 руб.</span>
        </div>
      </div>
    </div>
  );
}
