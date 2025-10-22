import { zIndexManager } from "@/lib/z-index-manager";
import { animate, createDraggable, createTimeline, type Draggable, type JSAnimation, type Timeline, utils } from "animejs";
import type { ComponentChildren } from "preact";
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

  useLayoutEffect(() => {
    if (isOpen) {
      const { zIndex: newZIndex, cleanup } = zIndexManager.register("DRAWER");
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
  }, [isOpen]);

  useLayoutEffect(() => {
    const $elem = drawerRef.current;
    if (!$elem) return;

    let scrollTop: number;
    let scrollStyles: JSAnimation | null = null;

    function blockScrolling() {
      if (scrollStyles) return;
      const $scroll = document.scrollingElement;
      if (!$scroll) return;
      scrollTop = $scroll.scrollTop;
      scrollStyles = utils.set([document.documentElement, $scroll], {
        overflow: "hidden",
        position: "sticky",
        height: `${window.innerHeight - 1}px`,
      });
    }

    function enableScrolling() {
      if (!scrollStyles) return;
      scrollStyles.revert();
      scrollStyles = null;
      window.scrollTo({ top: scrollTop, behavior: "instant" as any });
    }

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
        self.progressY < 0.95 ? blockScrolling() : enableScrolling();
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

    return () => {
      enableScrolling();
    };
  }, []);

  useLayoutEffect(() => {
    if (!drawerInstance.current) return;

    if (isOpen) {
      animate(drawerInstance.current, {
        progressY: 0,
        duration: 500,
        ease: "out(4)",
      });
      openState.current = true;
    } else {
      animate(drawerInstance.current, {
        progressY: 1,
        duration: 500,
        ease: "out(4)",
      });
      openState.current = false;
    }
  }, [isOpen]);

  return (
    <>
      {/* Drawer */}

      <div ref={drawerRef} class={`fixed right-0 bottom-0 left-0 h-[91%] w-full will-change-transform ${drawerClass}`} style={{ zIndex }} data-type="drawer">
        <div class="relative flex h-full w-full flex-col overflow-hidden rounded-t-3xl border-t border-t-line-500 bg-white">
          {/* Content */}
          <div class={className}>{children}</div>
        </div>
      </div>
    </>
  );
};
