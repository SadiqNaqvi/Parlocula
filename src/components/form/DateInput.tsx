import React, { useRef, useState, useEffect } from "react";

type DateInputValue = {
  day: string;
  month: string;
  year: string;
};

interface DateInputProps {
  value?: DateInputValue;
  onChange?: (value: DateInputValue) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChange }) => {
  const [date, setDate] = useState<DateInputValue>(
    value ?? { day: "", month: "", year: "" }
  );

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) setDate(value);
  }, [value]);

  const update = (update: Partial<DateInputValue>) => {
    const newDate = { ...date, ...update };
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof DateInputValue,
    maxLength: number,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, maxLength);

    update({ [field]: value });

    // Auto-move to next field
    if (value.length === maxLength && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: keyof DateInputValue,
    prevRef?: React.RefObject<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && date[field] === "" && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  return (
    <div className="flex gap-3 items-center">
      {/* Day */}
      <input
        ref={dayRef}
        value={date.day}
        onChange={(e) => handleInput(e, "day", 2, monthRef)}
        onKeyDown={(e) => handleBackspace(e, "day")}
        className="w-14 h-12 text-center text-lg border border-gray-300 rounded-md 
                   focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="DD"
        inputMode="numeric"
      />

      <span className="text-gray-500">/</span>

      {/* Month */}
      <input
        ref={monthRef}
        value={date.month}
        onChange={(e) => handleInput(e, "month", 2, yearRef)}
        onKeyDown={(e) => handleBackspace(e, "month", dayRef)}
        className="w-14 h-12 text-center text-lg border border-gray-300 rounded-md 
                   focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="MM"
        inputMode="numeric"
      />

      <span className="text-gray-500">/</span>

      {/* Year */}
      <input
        ref={yearRef}
        value={date.year}
        onChange={(e) => handleInput(e, "year", 4)}
        onKeyDown={(e) => handleBackspace(e, "year", monthRef)}
        className="w-20 h-12 text-center text-lg border border-gray-300 rounded-md 
                   focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="YYYY"
        inputMode="numeric"
      />
    </div>
  );
};
