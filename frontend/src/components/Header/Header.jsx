import styles from './Header.module.css';
import { Link } from 'react-router-dom';

export default function Header() {

    return (
        <div className={styles.headerblock}>
            <h1 className={styles.headertext}>Подсчет изделий</h1>
            <nav className={styles.headernav}>
                <ul>
                    <li><Link to="/Form">Форма отправки</Link></li>
                    <li><Link to="/Report">Общий подсчет</Link></li>
                </ul>
            </nav>
        </div>
    )
}