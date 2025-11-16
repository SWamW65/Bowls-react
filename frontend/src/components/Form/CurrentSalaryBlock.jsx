import styles from "./CurrentSalaryBlock.module.css";
import { useState, useEffect } from "react";
import useDateFormatter from '../../hooks/useDateFormatter.jsx';

export default function CurrentSalaryBlock({ refreshTrigger }) {
    const [salaryData, setSalaryData] = useState({
        current_month: '',
        month_total: 0,
        today_total: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const {formatMonth} = useDateFormatter();

    useEffect(() => {
        const fetchSalaryData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/get-current-salary');

                if (!response.ok) throw new Error('Ошибка загрузки данных');

                const data = await response.json();
                setSalaryData(data);
            } catch (err){
                setError(err.message);
                console.error('Ошибка:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSalaryData();
    }, [refreshTrigger]);

    if(isLoading) {
        return <div className={styles.salaryBlock}>Загрузка...</div>;
    }

    if (error) {
        return <div className={styles.salaryBlock}>Ошибка: {error}</div>;
    }

    const formattedMonth = formatMonth(salaryData.current_month);

    return (
        <div className={styles.salaryBlock}>
          <div className={styles.salaryHeader}>
            <h2>{formattedMonth || 'Загрузка...'}</h2>
          </div>
          <div className={styles.salaryContent}>
            <div className={styles.salaryMonth}>
              <h3>За месяц:</h3>
              <span>{salaryData.month_total.toFixed(2)} руб.</span>
            </div>
            <div className={styles.salaryToday}>
              <h3>За сегодня</h3>
              <span>{salaryData.today_total.toFixed(2)} руб.</span>
            </div>
          </div>
        </div>
  );
}
