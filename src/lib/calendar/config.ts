import { BryntumCalendarProps } from '@bryntum/calendar-react';

const calendarProps: BryntumCalendarProps = {
    date : new Date(2026, 5, 7),

    crudManager : {
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        autoLoad : true
    }
};

export { calendarProps };
