import { useState } from "react";
import styles from './Login.module.css';

export default function Login({onLogin}) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormFata] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value} = e.target;
        setFormFata(prev =>({
            ...prev,
            [name]: value
        }))
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('api/login',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
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

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    // Проверка паролей
        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return
        }
    // Проверка длины пароля
        if (formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            setLoading(false);
            return
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                onLogin();
            }
            else {
                const errorData = await response.json();
                setError(errorData.detail || 'Ошибка регистрации');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером')
        } finally {
            setLoading(false)
        }
    };

    const switchToRegister = () => {
        setIsLogin(false);
        setError('');
        setFormFata({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        })
    };

    const switchToLogin = () => {
        setIsLogin(true);
        setError('');
        setFormFata({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        })
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h2>{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>
                <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Имя пользователя:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required />
                    </div>

                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <label>Email:</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Пароль:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                        />
                    </div>

                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <label>Подтвердить пароль:</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {error && <div className={styles.errorMessage}>{error}</div> }

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.loginBtn}
                    >
                        {loading
                            ? (isLogin ? 'Вход...' : 'Регистрация...')
                            : (isLogin ? 'Войти' : 'Зарегистрироваться')
                        }
                    </button>
                </form>

                <div className={styles.authSwitch}>
                    {isLogin ? (
                        <>
                            Нет аккаунта?{' '}
                            <button
                                type="button"
                                className={styles.linkButton}
                                onClick={switchToRegister}
                            >
                                Зарегистрироваться
                            </button>
                        </>
                    ) : (
                        <>
                            Уже есть аккаунт?{' '}
                            <button
                                type="button"
                                className={styles.linkButton}
                                onClick={switchToLogin}
                            >
                                Войти
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
