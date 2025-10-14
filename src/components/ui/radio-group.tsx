import type { ComponentChildren } from "preact";

import { cn } from "../../lib/utils";

// Generic RadioGroup component
interface RadioGroupProps<T> {
	options: readonly T[];
	value: T | null;
	onChange: (selected: T) => void;
	renderOption?: (option: T, isSelected: boolean) => ComponentChildren;
	className?: string;
	optionClassName?: string;
	selectedClassName?: string;
	unselectedClassName?: string;
	name?: string; // For accessibility
}

export function RadioGroup<T extends string | number>({
	options,
	value,
	onChange,
	renderOption,
	className,
	optionClassName,
	selectedClassName = "bg-primary border-primary text-white",
	unselectedClassName = "bg-white text-grey-400",
	name = "radio-group",
}: RadioGroupProps<T>) {
	const handleSelect = (option: T) => {
		onChange(option);
	};

	return (
		<ul class={cn("flex items-center flex-wrap gap-3", className)}>
			{options.map((option) => {
				const isSelected = value === option;

				return (
					<label
						key={option}
						class={cn(
							"flex items-center gap-3 px-2 h-8 cursor-pointer border border-line-700 transition-colors text-sm",
							optionClassName,
							isSelected ? selectedClassName : unselectedClassName
						)}
					>
						<input
							type="radio"
							class="hidden"
							name={name}
							checked={isSelected}
							onChange={() => handleSelect(option)}
						/>
						{renderOption ? renderOption(option, isSelected) : <p>{option}</p>}
					</label>
				);
			})}
		</ul>
	);
}
