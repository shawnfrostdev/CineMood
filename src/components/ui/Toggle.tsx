'use client';

import { useState } from 'react';

type ToggleOption = {
  label: string;
  value: string;
};

type ToggleProps = {
  options: ToggleOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export default function Toggle({ 
  options, 
  defaultValue = options[0]?.value, 
  onChange 
}: ToggleProps) {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const handleChange = (value: string) => {
    setSelectedValue(value);
    onChange?.(value);
  };

  return (
    <div className="inline-flex p-1 bg-[#0C100E] rounded-md">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedValue === option.value
              ? 'bg-[#436029] text-white'
              : 'text-[#436029] hover:text-[#F0EDD1]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
} 