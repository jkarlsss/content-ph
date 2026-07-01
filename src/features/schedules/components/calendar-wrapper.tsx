'use client';

import dynamic from "next/dynamic";
import { calendarProps } from "../../../lib/calendar/config";

const Calendar = dynamic(() => import("../views/calendar-view"), {
  ssr: !!false,
  loading: () => {
    return (
      <div
        style={{
          display        : "flex",
          alignItems     : "center",
          justifyContent : "center",
          height         : "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  },
});

const CalendarWrapper = () => {
    return <Calendar {...calendarProps} />
};
export { CalendarWrapper };
