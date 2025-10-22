import type { ComponentChildren } from "preact";

import { cn } from "../../lib/utils";

// Generic CheckboxGroup component
interface CheckboxGroupProps<T> {
  options: readonly T[];
  value: T[];
  onChange: (selected: T[]) => void;
  renderOption?: (option: T, isSelected: boolean) => ComponentChildren;
  className?: string;
  optionClassName?: string;
  selectedClassName?: string;
  unselectedClassName?: string;
  showCheckbox?: boolean;
  selectedOutline?: string;
  maxSelected?: number;
}

export function CheckboxGroup<T extends string | number>({
  options,
  value,
  onChange,
  renderOption,
  className,
  optionClassName,
  selectedClassName = "bg-primary border-primary text-white",
  unselectedClassName = "bg-white text-grey-400",
  maxSelected = Number.POSITIVE_INFINITY,
}: CheckboxGroupProps<T>) {
  const handleToggle = (option: T) => {
    if (value.includes(option)) {
      // If option is already selected, remove it
      const newValue = value.filter((item) => item !== option);
      onChange(newValue);
    } else {
      // If option is not selected, add it only if under the limit
      if (value.length < maxSelected) {
        const newValue = [...value, option];
        onChange(newValue);
      }
    }
  };

  return (
    <ul class={cn("flex flex-wrap items-center gap-3", className)}>
      {options.map((option) => {
        const isSelected = value.includes(option);

        // const isDisabled = !isSelected && value.length >= maxSelected;

        return (
          <label
            key={option}
            class={cn(
              "flex h-8 cursor-pointer items-center gap-3 border border-line-700 px-2 text-sm transition-colors",
              optionClassName,
              isSelected ? selectedClassName : unselectedClassName
              // isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="checkbox"
              class="hidden"
              checked={isSelected}
              // disabled={isDisabled}
              onChange={() => handleToggle(option)}
            />
            {renderOption ? renderOption(option, isSelected) : <p>{option}</p>}
          </label>
        );
      })}
    </ul>
  );
}
