"use client";

import { BryntumCalendar } from "@bryntum/calendar-react";
import { useEffect, useRef } from "react";

export default function Calendar({ ...props }) {
  const calendarRef = useRef<BryntumCalendar>(null);

  useEffect(() => {
    // Bryntum Calendar instance
    const calendar = calendarRef?.current?.instance;
  }, []);

  return <BryntumCalendar {...props} ref={calendarRef} />;
}
