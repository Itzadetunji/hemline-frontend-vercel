import { cn } from "@/lib/utils";
import type { ComponentChildren, JSX, RefObject } from "preact";
import { createContext } from "preact";
import {
	useContext,
	useEffect,
	useRef,
	useState,
	type StateUpdater,
} from "preact/hooks";

// Popover Context
interface PopoverContextValue {
	open: boolean;
	setOpen: (value: boolean) => void;
	triggerRef: RefObject<HTMLButtonElement>;
	contentRef: RefObject<HTMLDivElement>;
}

const PopoverContext = createContext<PopoverContextValue | undefined>(
	undefined
);

const usePopoverContext = () => {
	const context = useContext(PopoverContext);
	if (!context) {
		throw new Error("Popover components must be used within a Popover");
	}
	return context;
};

// Popover Root Component
interface PopoverProps {
	children: ComponentChildren;
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function Popover({
	children,
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
}: PopoverProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const setOpen = (value: boolean) => {
		if (!isControlled) {
			setUncontrolledOpen(value);
		}

		onOpenChange?.(value);
	};

	// Close on outside click
	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				contentRef.current &&
				!contentRef.current.contains(target) &&
				triggerRef.current &&
				!triggerRef.current.contains(target)
			) {
				setOpen(false);
			}
		};

		// Small delay to prevent immediate closing on trigger click
		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	// Close on escape key
	useEffect(() => {
		if (!open) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open]);

	// Close on scroll
	useEffect(() => {
		if (!open) return;

		const handleScroll = () => {
			setOpen(false);
		};

		// Listen to scroll events on window and all scrollable ancestors
		window.addEventListener("scroll", handleScroll, true);

		return () => {
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [open]);

	return (
		<PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
			{children}
		</PopoverContext.Provider>
	);
}

// Popover Trigger Component
interface PopoverTriggerProps extends JSX.HTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
	children: ComponentChildren;
}

export function PopoverTrigger({
	asChild,
	children,
	className,
	...props
}: PopoverTriggerProps) {
	const { open, setOpen, triggerRef } = usePopoverContext();

	const handleClick = (e: MouseEvent) => {
		e.preventDefault();
		setOpen(!open);
		props.onClick?.(e as any);
	};

	// If asChild is true, clone the child and add props
	if (asChild && typeof children === "object" && children !== null) {
		const child = Array.isArray(children) ? children[0] : children;
		if (child && typeof child === "object" && "props" in child) {
			return (
				<child.type
					{...child.props}
					{...props}
					ref={triggerRef}
					onClick={handleClick}
					aria-expanded={open}
					aria-haspopup="dialog"
					className={cn(child.props.className, className)}
				/>
			);
		}
	}

	return (
		<button
			ref={triggerRef}
			type="button"
			onClick={handleClick}
			aria-expanded={open}
			aria-haspopup="dialog"
			className={className}
			{...props}
		>
			{children}
		</button>
	);
}

// Popover Content Component
interface PopoverContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	children: ComponentChildren;
	align?: "start" | "center" | "end";
	side?: "top" | "bottom" | "left" | "right";
	sideOffset?: number;
	alignOffset?: number;
}

export function PopoverContent({
	children,
	className,
	align = "center",
	side = "bottom",
	sideOffset = 8,
	alignOffset = 0,
	...props
}: PopoverContentProps) {
	const { open, contentRef, triggerRef } = usePopoverContext();
	const [position, setPosition] = useState({ top: 0, left: 0 });

	// Calculate position
	useEffect(() => {
		if (!open || !triggerRef.current || !contentRef.current) return;

		const trigger = triggerRef.current;
		const content = contentRef.current;
		const triggerRect = trigger.getBoundingClientRect();
		const contentRect = content.getBoundingClientRect();

		let top = 0;
		let left = 0;

		// Calculate based on side
		switch (side) {
			case "bottom":
				top = triggerRect.bottom + sideOffset;
				break;
			case "top":
				top = triggerRect.top - contentRect.height - sideOffset;
				break;
			case "left":
				left = triggerRect.left - contentRect.width - sideOffset;
				break;
			case "right":
				left = triggerRect.right + sideOffset;
				break;
		}

		// Calculate based on alignment
		if (side === "top" || side === "bottom") {
			switch (align) {
				case "start":
					left = triggerRect.left + alignOffset;
					break;
				case "center":
					left =
						triggerRect.left +
						triggerRect.width / 2 -
						contentRect.width / 2 +
						alignOffset;
					break;
				case "end":
					left = triggerRect.right - contentRect.width - alignOffset;
					break;
			}
		} else {
			switch (align) {
				case "start":
					top = triggerRect.top + alignOffset;
					break;
				case "center":
					top =
						triggerRect.top +
						triggerRect.height / 2 -
						contentRect.height / 2 +
						alignOffset;
					break;
				case "end":
					top = triggerRect.bottom - contentRect.height - alignOffset;
					break;
			}
		}

		// Ensure content stays within viewport
		const padding = 8;
		const maxLeft = window.innerWidth - contentRect.width - padding;
		const maxTop = window.innerHeight - contentRect.height - padding;

		left = Math.max(padding, Math.min(left, maxLeft));
		top = Math.max(padding, Math.min(top, maxTop));

		setPosition({ top, left });
	}, [open, side, align, sideOffset, alignOffset]);

	if (!open) return null;

	return (
		<div
			ref={contentRef}
			role="dialog"
			aria-modal="false"
			className={cn(
				"fixed z-50 rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none",
				"data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				{
					"data-[side=bottom]:slide-in-from-top-2": side === "bottom",
					"data-[side=left]:slide-in-from-right-2": side === "left",
					"data-[side=right]:slide-in-from-left-2": side === "right",
					"data-[side=top]:slide-in-from-bottom-2": side === "top",
				},
				className
			)}
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
			}}
			data-state={open ? "open" : "closed"}
			data-side={side}
			{...props}
		>
			{children}
		</div>
	);
}
