import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { cn } from "@/lib/utils";
import { zIndexManager } from "@/lib/z-index-manager";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zIndex: number;
}

let dialogContext: DialogContextValue | null = null;

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: JSX.Element | JSX.Element[];
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [zIndex, setZIndex] = useState(60);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (open) {
      const { zIndex: newZIndex, cleanup } = zIndexManager.register("DIALOG");
      setZIndex(newZIndex);
      cleanupRef.current = cleanup;
    } else {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [open]);

  dialogContext = {
    open,
    onOpenChange:
      onOpenChange ||
      (() => {
        //
      }),
    zIndex,
  };

  return <>{children}</>;
}

interface DialogTriggerProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DialogTrigger({ children, asChild, onClick, ...props }: DialogTriggerProps) {
  const handleClick = (e: MouseEvent) => {
    if (dialogContext) {
      dialogContext.onOpenChange(true);
    }
    onClick?.(e as any);
  };

  if (asChild && children && typeof children === "object" && "props" in children) {
    // Clone child element and add onClick
    const child = children as any;
    return {
      ...child,
      props: {
        ...child.props,
        onClick: (e: MouseEvent) => {
          handleClick(e);
          child.props?.onClick?.(e);
        },
      },
    } as JSX.Element;
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

interface DialogPortalProps {
  children: JSX.Element | JSX.Element[];
}

export function DialogPortal({ children }: DialogPortalProps) {
  if (!dialogContext?.open) return null;

  return <>{children}</>;
}

interface DialogOverlayProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const handleClick = () => {
    if (dialogContext) {
      dialogContext.onOpenChange(false);
    }
  };

  if (!dialogContext) return null;

  return (
    <div
      className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm", "data-[state=closed]:animate-out data-[state=open]:animate-in", "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
      style={{ zIndex: dialogContext.zIndex }}
      data-state={dialogContext?.open ? "open" : "closed"}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Close dialog"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      {...props}
    />
  );
}

interface DialogContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onPointerDownOutside?: (e: PointerEvent) => void;
}

export function DialogContent({ class: className, children, showClose = true, onEscapeKeyDown, onPointerDownOutside, ...props }: DialogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dialogContext?.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeKeyDown?.(e);
        if (!e.defaultPrevented && dialogContext) {
          dialogContext.onOpenChange(false);
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onPointerDownOutside?.(e as any);
        if (!e.defaultPrevented && dialogContext) {
          dialogContext.onOpenChange(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [dialogContext?.open, onEscapeKeyDown, onPointerDownOutside]);

  if (!dialogContext?.open) return null;

  return (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: dialogContext.zIndex }}>
        <div
          ref={contentRef}
          className={cn(
            "relative z-10 grid w-full max-w-lg gap-4 border border-line-500 bg-white p-4 shadow-lg",
            "duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-top-1/2",
            "data-[state=open]:slide-in-from-top-1/2",
            "sm:rounded-lg",
            className
          )}
          data-state={dialogContext?.open ? "open" : "closed"}
          {...props}
        >
          {children}
          {showClose && (
            <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6l-12 12M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </div>
      </div>
    </>
  );
}

interface DialogHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ class: className, ...props }: DialogHeaderProps) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
}

interface DialogFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ class: className, ...props }: DialogFooterProps) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
}

interface DialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {}

export function DialogTitle({ class: className, ...props }: DialogTitleProps) {
  return <h2 className={cn("font-semibold text-black text-lg leading-none tracking-tight", className)} {...props} />;
}

interface DialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {}

export function DialogDescription({ class: className, ...props }: DialogDescriptionProps) {
  return <p className={cn("text-grey-500 text-sm", className)} {...props} />;
}

interface DialogCloseProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DialogClose({ children, asChild, onClick, ...props }: DialogCloseProps) {
  const handleClick = (e: MouseEvent) => {
    if (dialogContext) {
      dialogContext.onOpenChange(false);
    }
    onClick?.(e as any);
  };

  if (asChild && children && typeof children === "object" && "props" in children) {
    const child = children as any;
    return {
      ...child,
      props: {
        ...child.props,
        onClick: (e: MouseEvent) => {
          handleClick(e);
          child.props?.onClick?.(e);
        },
      },
    } as JSX.Element;
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
