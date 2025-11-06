import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "preact/hooks";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  icon?: string | null;
  maxItems?: number;
  className?: string;
  itemClassName?: string;
  valueClassName?: string;
  disabled?: boolean;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  icon = "fluent:chevron-down-24-regular",
  maxItems = Number.POSITIVE_INFINITY,
  className,
  itemClassName,
  valueClassName,
  disabled = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);

    if (isSelected) {
      // Remove from selection
      onChange(value.filter((v) => v !== optionValue));
    } else {
      // Add to selection if under maxItems limit
      if (value.length < maxItems) {
        onChange([...value, optionValue]);
      }
    }
  };

  // Get display text for the button
  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder;
    }

    const selectedLabels = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);

    if (selectedLabels.length === 1) {
      return selectedLabels[0];
    }

    return `${selectedLabels.length} selected`;
  };

  return (
    <div ref={containerRef} class={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        class={cn("flex h-10.5 w-full items-center gap-2 border border-line-700 px-3 transition-colors", {
          "cursor-not-allowed opacity-50": disabled,
          "hover:border-line-500": !disabled && !isOpen,
          "border-primary": isOpen,
        })}
      >
        {icon && <Icon icon={icon} fontSize="18" />}
        <p
          class={cn(
            "flex-1 text-left text-sm",
            {
              "text-grey-400": value.length === 0,
            },
            valueClassName
          )}
        >
          {getDisplayText()}
        </p>

        <Icon
          icon="fluent:chevron-down-24-regular"
          fontSize="18"
          className={cn("transition-transform", {
            "rotate-180": isOpen,
          })}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          class="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border border-line-500 bg-white p-2 shadow-sm dark:bg-dark"
          style={{ top: "calc(100% + 4px)" }}
        >
          {options.length === 0 ? (
            <div class="px-3 py-2 text-grey-400 text-sm">No options available</div>
          ) : (
            <ul>
              {maxItems === 1
                ? options.map((option) => {
                    const isSelected = value.includes(option.value);
                    const isDisabled = !isSelected && value.length >= maxItems;

                    return (
                      <li key={option.value}>
                        <label
                          class={cn(
                            "flex cursor-pointer items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-secondary",
                            {
                              "cursor-not-allowed opacity-50": isDisabled,
                              "bg-secondary/50": isSelected,
                            },
                            itemClassName
                          )}
                        >
                          <span class="flex-1 text-sm">{option.label}</span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              onChange([option.value]);
                            }}
                            class="size-4 cursor-pointer accent-primary"
                          />
                        </label>
                      </li>
                    );
                  })
                : options.map((option) => {
                    const isSelected = value.includes(option.value);
                    const isDisabled = !isSelected && value.length >= maxItems;

                    return (
                      <li key={option.value}>
                        <label
                          class={cn(
                            "flex cursor-pointer items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-secondary",
                            {
                              "cursor-not-allowed opacity-50": isDisabled,
                              "bg-secondary/50": isSelected,
                            },
                            itemClassName
                          )}
                        >
                          <span class="flex-1 text-sm">{option.label}</span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleOptionToggle(option.value)}
                            disabled={isDisabled}
                            class="size-4 cursor-pointer accent-primary"
                          />
                        </label>
                      </li>
                    );
                  })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
