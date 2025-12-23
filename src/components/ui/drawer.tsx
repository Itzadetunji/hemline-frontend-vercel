import { cn } from "@/lib/utils";
import { zIndexManager } from "@/lib/z-index-manager";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { animate, createDraggable, createTimeline, type Draggable, type Timeline } from "animejs";
import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { useLayoutEffect, useRef, useState } from "preact/hooks";

interface DrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ComponentChildren;
  className?: string;
  drawerClass?: string;
}

export const Drawer = ({ isOpen, onClose, children, className = "", drawerClass = "" }: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerInstance = useRef<Draggable>();
  const timeline = useRef<Timeline>();
  const openState = useRef(isOpen);
  const [zIndex, setZIndex] = useState(60);
  const cleanupRef = useRef<(() => void) | null>(null);

  const isNative = Capacitor.isNativePlatform();

  useLayoutEffect(() => {
    if (isOpen) {
      const { zIndex: newZIndex, cleanup } = zIndexManager.register("DRAWER");
      setZIndex(newZIndex);
      cleanupRef.current = cleanup;
      // document.body.style.overflow = "hidden";
    } else {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      // document.body.style.overflow = "";
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      // document.body.style.overflow = "";
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    const $elem = drawerRef.current;
    if (!$elem) return;

    timeline.current = createTimeline({
      autoplay: false,
      defaults: { ease: "linear" },
    });

    drawerInstance.current = createDraggable($elem, {
      container: () => [0, $elem.offsetWidth, $elem.offsetHeight, 0],
      y: { snap: ({ $target }) => $target.offsetHeight },
      x: false,
      velocityMultiplier: 1,
      onUpdate: (self) => {
        if (timeline.current) {
          timeline.current.progress = self.progressY;
        }
      },
      onRelease: (self) => {
        // The drawer is going to closed state
        if (self.destY !== 0) onClose?.();
      },
      onResize: (self) => {
        self.progressY = self.progressY > 0.5 ? 1 : 0;
      },
    });

    drawerInstance.current.progressY = 100;
    if (!isOpen && isNative) {
      $elem.style.visibility = "hidden";
    }
  }, []);

  useLayoutEffect(() => {
    if (!drawerInstance.current) return;

    if (isOpen) {
      if (drawerRef.current && isNative) drawerRef.current.style.visibility = "visible";
      animate(drawerInstance.current, {
        progressY: 0,
        duration: 500,
        ease: "out(4)",
      });
      openState.current = true;
    } else {
      if (isNative) {
        Keyboard.hide();
      }
      animate(drawerInstance.current, {
        progressY: 1,
        duration: 500,
        ease: "out(4)",
        complete: () => {
          if (drawerRef.current && !openState.current && isNative) {
            drawerRef.current.style.visibility = "hidden";
          }
        },
      });
      openState.current = false;
    }
  }, [isOpen, isNative]);

  return createPortal(
    <>
      {/* Drawer */}

      <div ref={drawerRef} class={cn("fixed right-0 bottom-0 left-0 h-9/10 w-full will-change-transform", drawerClass)} style={{ zIndex }} data-type="drawer">
        <div class="relative flex h-full w-full flex-col overflow-hidden rounded-t-3xl border-t border-t-line-500 bg-white">
          {/* Content */}
          <div class={cn("flex-1 overflow-y-auto", className)}>{children}</div>
        </div>
      </div>
    </>,
    document.body
  );
};
