import styles from './Report.module.css';
import {useEffect, useState} from "react";
import DayDetailsModal from "./DayDetailsModal.jsx";

export default function Report() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Состояние для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState('');

    const loadingProducts = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('api/get-current-month', {
                method: 'GET'});
            if (!response.ok) throw new Error('Ошибка при загрузке изделий');
            const productData = await response.json();
            setProducts(productData);
        } catch(error){
            console.error('Ошибка:', error);
        }
        finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        loadingProducts();
    }, []);

    const hadleDateClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDate('');
    };

    return (
        <section className={styles.reportcontainer}>
            <div className={styles.dateblock}>
                Настройка диапазона времени
            </div>
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