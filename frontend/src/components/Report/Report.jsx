import styles from './Report.module.css';
import {useEffect, useState} from "react";

export default function Report() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadingProducts = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('api/get-current-month', {
                method: 'GET'});
            if (!response.ok) throw new Error('Ощибка при загрузке изделий');
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

    const renderProducts = () => {
        if (products.length === 0) {
            return (
                <tr>
                    <td colSpan="3">Нет данных для отображения</td>
                </tr>
            );
        }

        return products.map(product => (
            <tr key={product.date}>
                <td>{product.date}</td>
                <td>{product.total_quantity} шт.</td>
                <td>{product.total_amount.toFixed(2)} руб.</td>
            </tr>
        ))
    }

    return (
        <section className={styles.reportcontainer}>
            <div className={styles.dateblock}>
                Настройка диапазона времени
            </div>
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
                    ) : (
                        renderProducts()
                    )}
                </tbody>
            </table>
        </section>
    );
}