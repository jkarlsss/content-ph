/* FontAwesome is used for icons */
import "@bryntum/calendar/fontawesome/css/fontawesome.css";
import "@bryntum/calendar/fontawesome/css/solid.css";
/* Importing Calendar's structural CSS and a theme */
import "@bryntum/calendar/calendar.css";
import "@bryntum/calendar/svalbard-light.css";
import { CalendarWrapper } from "../../../features/schedules/components/calendar-wrapper";

export default function SchedulesPage() {
  return (
    <main>
      <CalendarWrapper />
    </main>
  );
}
