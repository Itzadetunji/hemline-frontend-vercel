import type { ComponentChildren } from "preact";

/** Mobile layout with safe area insets for notch/home indicator */
export const NativeLayout = ({ children }: { children: ComponentChildren }) => {
  return (
    <div
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      class="flex min-h-[100dvh] flex-col"
    >
      {children}
    </div>
  );
};
