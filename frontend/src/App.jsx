import { useState, useEffect } from "react";
import Form from './components/Form/Form.jsx'
import Header from './components/Header/Header.jsx'
import Report from './components/Report/Report.jsx'
import Login from './components/Login/Login.jsx'
import styles from './css/App.module.css'
import {Route, Routes} from "react-router-dom";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Проверяем есть ли токен при загрузке
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            setIsAuthenticated(true)
        }
        setLoading(false)
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true)
    }

    const handleLogout =() => {
        localStorage.removeItem('token');
        setIsAuthenticated(false)
    }

    if (loading) {
        return <div className={styles.loading}>Загрузка</div>
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.wrapper}>
                <main className={styles.contentBox}>
                    <Login onLogin={handleLogin} />
                </main>
            </div>

        )
    }

    return (
      <div className={styles.wrapper}>
        <header className={styles.contentBox}>
            <Header onLogout={handleLogout} />
        </header>
        <main className={styles.contentBox}>
            <Routes>
                <Route path="/Form" element={<Form />} index />
                <Route path="/report" element={<Report />} />
            </Routes>
        </main>
      </div>
    )
}