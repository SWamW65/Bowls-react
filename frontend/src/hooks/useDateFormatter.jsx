export default function useDateFormatter() {
    const formatMonth = (dateString) => {
        if (!dateString) {
            return '';
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.error('Invalid date', dateString);
                return '';
            }

            const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
            return monthName.charAt(0).toUpperCase() + monthName.slice(1);
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return '';
        }
    };

    const formatMonthForSelect = (dateString) => {
        const monthName = formatMonth(dateString);
        const year = new Date(dateString).getFullYear();
        return { value: dateString, label: `${monthName}`};
    };

    const formatYearForSelect = (year) => {
        return {value: year.toString(), label: year.toString()};
    };

    return { formatMonth, formatMonthForSelect, formatYearForSelect };
}
