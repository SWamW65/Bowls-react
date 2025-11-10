import React, {useEffect, useState, useRef} from "react";
import Select from "react-select";
import useDateFormatter from "../../hooks/useDateFormatter.jsx";

export default function CalendarMenu({onMonthYearChange}) {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [monthOptions, setMonthOptions] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const initialLoadRef = useRef(true);

    const {formatMonthForSelect, formatYearForSelect} = useDateFormatter();

    useEffect(()=> {
        fetchMonthYearData();
    }, []);

    //Эффект для вызова Callback при изменении месяца или года
    useEffect(() => {
        if (selectedMonth && selectedYear && onMonthYearChange) {
            if(!initialLoadRef.current) {
                onMonthYearChange({
                    month: selectedMonth.value,
                    year: selectedYear.value
                });
            }
        }
        if (initialLoadRef.current) {
            initialLoadRef.current = false;
        }
    }, [selectedMonth, selectedMonth, onMonthYearChange]);

    const fetchMonthYearData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/get-months-for-menu');
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных меню Select')
            }
            const data = await response.json();
            // форматирования месяца для Select
            const formattedMonths = data.months.map(month =>
                formatMonthForSelect(month));
            // Форматирование года для Select
            const formattedYears = data.years.map(year =>
                formatYearForSelect(year)
            );

            setMonthOptions(formattedMonths);
            setYearOptions(formattedYears);

            //Устанавливаем текущие значения по умолчанию
            const currentMonthOption = formattedMonths.find( month =>
                month.value === data.current_month
            );
            const currentYearOption = formattedYears.find( year =>
                year.value === data.current_year.toString()
            );

            setSelectedMonth(currentMonthOption || null);
            setSelectedYear(currentYearOption || null);

        } catch (error) {
            console.error('Ошибка загрузки данных месяца и года:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (selectedOption) => {
        setSelectedMonth(selectedOption);
    };
    const handleYearChange = (selectedOption) => {
        setSelectedYear(selectedOption);
    };

    const menuStyles = {
        // Основной контейнер
        control: (base, state) => ({
            ...base,
            width: '140px',
            background: '#fff',
            border: '1px solid',
            borderColor: state.isFocused ? '#dcdcdc' : '#ddd',
            color: '#dcdcdc',
            fontSize: '1em',
            padding: '.1em .1em',
            boxShadow: 'none',
            cursor: 'pointer',
            '&:hover': {
                borderColor: '#434343'
            }
        }),

        // Выпадающий список
        menu: (base) => ({
            ...base,
            border: '1px solid #dcdcdc',
            boxShadow: '0 0 35px 6px rgba(34, 60, 80, 0.2)',
        }),

        // Элементы списка
        option: (base, state) => ({
            ...base,
            background: state.isSelected ? '#434343' :
                        state.isFocused ? '#7a81e6' : 'white',
            color:  state.isSelected ? 'white' :
                state.isFocused ? 'white' : '#333',
            padding: '0.6em 1.2em',
            fontSize: '1em',
            cursor: 'pointer',
            '&:active': {
                background: '#44944a'
            }
        }),

        // Плейсхолдер
        placeholder: (base) => ({
            ...base,
            color: '#999',
            fontSize: '.71em'
        })
    };

    if(loading) {
        return (
            <div style={{display: 'flex', gap: '10px'}}>
                <div style={{maxWidth: '140px', margin: '10px 0'}}>
                    <div style={{padding: '8px', textAlign: 'center', color: '#999'}}>
                        Загрузка...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{display: 'flex', gap: '10px'}}>
            <div style={{maxWidth: '140px', margin: '10px 0'}}>
                <Select
                    options={monthOptions}
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    styles={menuStyles}
                    isLoading={loading}
                />
            </div>
            <div style={{maxWidth: '140px', margin: '10px 0'}}>
                <Select
                    options={yearOptions}
                    value={selectedYear}
                    onChange={handleYearChange}
                    styles={menuStyles}
                    isLoading={loading}
                />
            </div>
        </div>

    );
};
