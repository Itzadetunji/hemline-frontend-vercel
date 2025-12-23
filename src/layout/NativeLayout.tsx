import { Capacitor } from "@capacitor/core";
import { ComponentChildren } from "preact";

export const NativeLayout = ({ children }: { children: ComponentChildren }) => {
  const isNative = Capacitor.isNativePlatform();

  return (
    <div
      style={
        isNative
          ? {
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              paddingLeft: "env(safe-area-inset-left)",
              paddingRight: "env(safe-area-inset-right)",
            }
          : {}
      }
      class="flex min-h-[100dvh] flex-col"
    >
      {children}
    </div>
  );
};
