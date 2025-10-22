import { useState } from 'react';
import styles from './Form.module.css';

export default function Form() {
    const [formData, setFormData] = useState({
        price: '',
        quantity: '',
        name: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || 'Ошибка сервера');
            }
            console.log('Данные о продукте успешно записаны в базу данных');

            setFormData({
                price: '',
                quantity: '',
                name: ''
            });
        } catch (error) {
            console.error('Ошибка:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <form action="/submit" method="post" className={styles.formsubmit} onSubmit={handleSubmit}>
            <input className={styles.price} id="price" name="price" type="text" placeholder="Стоимость" disabled={isLoading} onChange={handleChange} value={formData.price} />
            <input className={styles.quantity} id="quantity" name="quantity" type="text" placeholder="Количество" disabled={isLoading} onChange={handleChange} value={formData.quantity} />
            <input className={styles.product} id="name" name="name" type="text" placeholder="Изделие" disabled={isLoading} onChange={handleChange} value={formData.name} />
            <button type="submit" className={styles.submitbtn}>{isLoading ? 'Отправка...' : 'Отправить'}</button>
        </form>
    );
}

