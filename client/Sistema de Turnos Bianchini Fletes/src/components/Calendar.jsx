/* eslint-disable react/prop-types */
import { DayPicker } from 'react-day-picker'

const Calendar = ({
  selectedDay,
  handleDaySelect,
  disabledDays,
  currentMonth,
  setCurrentMonth,
}) => {
  return (
    <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={handleDaySelect}
        disabled={disabledDays}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className="border rounded-lg"
        showOutsideDays={true}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
          day_range_middle: "bg-accent text-accent-foreground",
          day_hidden: "hidden",  // Cambiado de 'invisible' a 'hidden'
          ...Array.from({ length: 7 }).reduce((acc, _, index) => ({
            ...acc,
            [`day_${index}`]: "w-9 h-9 inline-flex items-center justify-center border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          }), {}),
        }}
        modifiers={{
          outside: (date) => {
            return date.getMonth() !== currentMonth.getMonth();
          }
        }}
        modifiersClassNames={{
          outside: "opacity-50 cursor-pointer hover:bg-gray-100",
          disabled: "cursor-not-allowed opacity-50"
        }}
        components={{
          IconLeft: () => <ChevronLeftButton />,
          IconRight: () => <ChevronRightButton />,
        }}
      />
    </div>
  )
}

// Componentes de botones de navegación mejorados
const ChevronLeftButton = () => {
  return (
    <button
      type="button"
      aria-label="Mes anterior"
      className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}

const ChevronRightButton = () => {
  return (
    <button
      type="button"
      aria-label="Mes siguiente"
      className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

export default Calendar;