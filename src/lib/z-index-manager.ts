/**
 * Z-Index Management System
 *
 * This system manages z-index values dynamically to ensure proper stacking
 * of overlays (popovers, dialogs, drawers) when multiple are open simultaneously.
 */

// Base z-index values for different UI layers
export const Z_INDEX_BASE = {
  POPOVER: 50,
  DIALOG: 60,
  DRAWER: 60, // Same as dialog since they're similar overlay types
  TOAST: 70,
  TOOLTIP: 80,
} as const;

// Stack increment - how much to increment for each stacked overlay
const STACK_INCREMENT = 10;

// Track active overlays and their z-index values
class ZIndexManager {
  private overlayStack: Map<string, number> = new Map();
  private nextId = 0;

  /**
   * Register a new overlay and get its z-index value
   * @param type - The type of overlay (popover, dialog, drawer)
   * @returns An object with the z-index value and a cleanup function
   */
  register(type: keyof typeof Z_INDEX_BASE): {
    zIndex: number;
    id: string;
    cleanup: () => void;
  } {
    const id = `${type}-${this.nextId++}`;
    const baseZIndex = Z_INDEX_BASE[type];

    // Calculate z-index based on how many overlays are already open
    const stackPosition = this.overlayStack.size;
    const zIndex = baseZIndex + stackPosition * STACK_INCREMENT;

    this.overlayStack.set(id, zIndex);

    const cleanup = () => {
      this.overlayStack.delete(id);
    };

    return { zIndex, id, cleanup };
  }

  /**
   * Get the current highest z-index
   */
  getHighestZIndex(): number {
    if (this.overlayStack.size === 0) {
      return Math.max(...Object.values(Z_INDEX_BASE));
    }
    return Math.max(...this.overlayStack.values());
  }

  /**
   * Check if an overlay is the topmost one
   */
  isTopmost(id: string): boolean {
    const zIndex = this.overlayStack.get(id);
    if (zIndex === undefined) return false;
    return zIndex === this.getHighestZIndex();
  }

  /**
   * Get the number of active overlays
   */
  getStackSize(): number {
    return this.overlayStack.size;
  }

  /**
   * Clear all overlays (useful for testing or reset scenarios)
   */
  clear(): void {
    this.overlayStack.clear();
  }
}

// Singleton instance
export const zIndexManager = new ZIndexManager();

/**
 * Hook-like function to use z-index management in components
 * Call this when the overlay opens and call the cleanup function when it closes
 */
export function useZIndex(type: keyof typeof Z_INDEX_BASE, isOpen: boolean): number {
  // This will be enhanced in the component implementations
  // For now, return base z-index
  return Z_INDEX_BASE[type];
}
