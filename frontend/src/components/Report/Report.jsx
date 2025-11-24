import styles from './Report.module.css';
import {useEffect, useState, useCallback} from "react";
import DayDetailsModal from "./DayDetailsModal.jsx";
import CalendarMenu from './CalendarMenu.jsx';
import { fetchWithAuth } from '../../utils/api';

export default function Report() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMonthYear, setSelectedMonthYear] = useState(null);

    // Состояние для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState('');

    const handleMonthYearChange = useCallback((monthYear) => {
        setSelectedMonthYear(monthYear);
    }, []);

    const loadingProducts = useCallback(async (month = null, year = null) => {
        setIsLoading(true);

        try {
            let url = 'api/get-current-month'

            // Если указаны месяц и год, добавляем их в параметры запроса
            if (month && year) {
                const monthDate = new Date(month);
                const monthNumber = monthDate.getMonth() + 1;
                url = `api/get-products-by-month?year=${year}&month=${monthNumber}`;
            }

            const response = await fetchWithAuth(url, {
                    method: 'GET'
                });
            if (!response.ok) throw new Error('Ошибка при загрузке изделий');
            const productData = await response.json();
            setProducts(productData);
        } catch(error){
            console.error('Ошибка:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

        // Загрузка продуктов при монтировании и при изменении выбранного месяца/года
    useEffect(() => {
        if (selectedMonthYear) {
            loadingProducts(selectedMonthYear.month, selectedMonthYear.year);
        } else {
            // Загрузка по умолчанию (текущий месяц и год)
            loadingProducts();
        }
    }, [selectedMonthYear, loadingProducts]);

    const hadleDateClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDate('');
    };

    return (
        <section className={styles.reportContainer}>
            <CalendarMenu onMonthYearChange={handleMonthYearChange} />
            <div className={styles.reportContent}>
                <table>
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Кол-во</th>
                            <th>Сумма за день</th>
                        </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="3">Загрузка...</td>
                        </tr>
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan="3">Нет данных для отображения</td>
                        </tr>
                    ) : (
                        products.map(product => (
                            <tr key={product.date}>
                                <td>
                                    <button onClick={() => hadleDateClick(product.date)}
                                            className={styles.dateButton}
                                    >
                                        {product.date}
                                    </button>
                                </td>
                                <td>{product.total_quantity} шт.</td>
                                <td>{product.total_amount.toFixed(2)} руб.</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            <DayDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedDate={selectedDate}
            />
        </section>
    );
}