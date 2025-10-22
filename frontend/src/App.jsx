import Form from './components/Form/Form.jsx'
import Header from './components/Header/Header.jsx'
import Report from './components/Report/Report.jsx'
import './css/app.css'
import {Route, Routes} from "react-router-dom";

export default function App() {
      return (
          <div className="wrapper">
            <header className='content-box'>
                <Header />
            </header>
            <main className='content-box'>
                <Routes>
                    <Route path="/Form" element={<Form />} index />
                    <Route path="/report" element={<Report />} />
                </Routes>
            </main>
          </div>
      )
}