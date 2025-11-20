import { useState } from "react";
import styles from './Login.module.css';

export default function Login({onLogin}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('api/',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                onLogin();
            } else {
                setError('Неверное имя пользователя или пароль')
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h2>Вход в систему</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Имя пользователя:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Пароль:</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div> }

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.loginBtn}
                    >
                        {loading ? "Вход..." : "Войти"}
                    </button>
                </form>

                <div className={styles.registerLink}>
                    Нет аккаунта? <a href="#register">Зарегистрироваться</a>
                </div>
            </div>
        </div>
    )
}
