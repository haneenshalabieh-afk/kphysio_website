"use client";

import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  name?: string;
  defaultValue?: string | null; // ISO string: "YYYY-MM-DD"
};

export default function BirthDateField({
  name = "birthDate",
  defaultValue = null,
}: Props) {
  const initial = useMemo(() => {
    if (!defaultValue) return null;
    const d = new Date(defaultValue);
    return isNaN(d.getTime()) ? null : d;
  }, [defaultValue]);

  const [date, setDate] = useState<Date | null>(initial);

  // نخلي اللي يتبعت للسيرفر ISO yyyy-mm-dd
  const value =
    date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`
      : "";

  return (
    <div>
      {/* ده اللي بيتبعت للـ server action */}
      <input type="hidden" name={name} value={value} />

      <DatePicker
        selected={date}
        onChange={(d: Date | null) => setDate(d)}
        dateFormat="yyyy-MM-dd"
        placeholderText="YYYY-MM-DD"
       

        /* أهم 3 سطور للي انتي عايزاها */
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"

        /* يخلي قائمة السنين كبيرة وسكرول */
        yearDropdownItemNumber={120}
        scrollableYearDropdown

        /* أيقونة الكالندر جوه الحقل */
        showIcon
        toggleCalendarOnIconClick
        showPopperArrow={false}
      />
    </div>
  );
}