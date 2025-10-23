import { useState, useEffect, useRef} from "react";
import  styles from './DayDetailsModal.module.css';

export default function DayDetailsModal ({ isOpen, onClose, selectedDate}) {
    const [dayDetails, setDayDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const dialogRef = useRef(null);

    // Управление открытием/закрытием dialog
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            dialogRef.current.showModal();
        } else if (dialogRef.current) {
            dialogRef.current.close();
        }
    }, [isOpen]);

    // Загрузка деталей по выбранной дате
    useEffect(() => {
        if (isOpen && selectedDate) {
            loadDayDetails(selectedDate);
        }
    }, [isOpen, selectedDate]);

    const loadDayDetails = async (date) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/get-for-day/${date}`);
            if (!response.ok) throw new Error('Ошибка при загрузке данных');
            const dataDay = await response.json();
            setDayDetails(dataDay);
        } catch (error) {
            console.error('Ощибка:', error);
        } finally {
            setIsLoading(false);
        }
    };
    // Закрытие по клику на overlay (фон)
    const handleBackdropClick = (e) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    return (
        <dialog ref={dialogRef} className={styles.dialog} onClose={onClose} onClick={handleBackdropClick} aria-labelledby="dialog-title">
            <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                    <h2 id="dialog-title">Изделия за {selectedDate}</h2>
                    <button onClick={onClose} className={styles.closeBtn} aria-label="Закрыть"></button>
                </div>
            </div>
            <div className={styles.dialogBody}>
                {isLoading ? (
                    <div>Загрузка...</div>
                ): (
                    <table className={styles.detailsTable}>
                        <thead>
                        <tr>
                            <th>Изделие</th>
                            <th>Количество</th>
                            <th>Стоимость</th>
                            <th>Сумма</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dayDetails.map((item, index) =>(
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity} шт.</td>
                                <td>{item.price} руб.</td>
                                <td>{(item.quantity * item.price).toFixed(2)} руб.</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                        )}

            </div>
        </dialog>
    );
}