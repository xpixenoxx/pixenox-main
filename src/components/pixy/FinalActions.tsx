"use client";

interface FinalActionsProps {
  options: string[];
  onSelect: (option: string) => void;
}

export function FinalActions({ options, onSelect }: FinalActionsProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className="w-full rounded-full bg-white px-8 py-3 text-sm font-medium text-[#1A1A24] transition-transform hover:scale-105 active:scale-95 sm:w-auto"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
