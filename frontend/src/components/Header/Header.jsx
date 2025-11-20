import styles from './Header.module.css';
import { Link } from 'react-router-dom';

export default function Header({ onLogout }) {

    return (
        <div className={styles.headerBlock}>
            <h1 className={styles.headerText}>Подсчет изделий</h1>
            <nav className={styles.headerNav}>
                <ul>
                    <li><Link to="/Form">Форма отправки</Link></li>
                    <li><Link to="/Report">Общий подсчет</Link></li>
                    <li><button onClick={onLogout} className={styles.logoutBtn}>Выйти</button></li>
                </ul>
            </nav>
        </div>
    )
}