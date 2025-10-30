import { Icon } from "@iconify/react";
import { forwardRef, type Ref } from "preact/compat";
import { type Dispatch, type StateUpdater, useEffect, useRef, useState } from "preact/hooks";

import { cn } from "@/lib/utils";

const Tabs = ["profile", "custom_fields"] as const;
type Tab = (typeof Tabs)[number];

type ProfileTabProps = {
  tab: Tab;
  activeTab: Tab;
  setActiveTab: Dispatch<StateUpdater<Tab>>;
  icon: string;
};

export const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!indicatorRef.current || tabRefs.current.length === 0) return;
    const activeIndex = Tabs.indexOf(activeTab);
    const activeTabEl = tabRefs.current[activeIndex];
    if (!activeTabEl) return;

    indicatorRef.current.style.width = `${activeTabEl.offsetWidth}px`;
    indicatorRef.current.style.left = `${activeTabEl.offsetLeft}px`;
  }, [activeTab]);

  return (
    <div class="relative border-b-2 border-b-line-700">
      <ul class="flex items-center gap-4">
        {Tabs.map((tab, index) => (
          <ProfileTab
            key={tab}
            tab={tab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            icon={tab === "profile" ? "hugeicons:user-02" : "material-symbols-light:draw-outline-rounded"}
            ref={(el: any) => {
              tabRefs.current[index] = el;
            }}
          />
        ))}
      </ul>
      <div ref={indicatorRef} class="-bottom-0.5 absolute h-0.5 bg-black transition-all duration-300" style={{ left: 0, width: 0 }} />
    </div>
  );
};

const ProfileTab = forwardRef(({ tab, activeTab, setActiveTab, icon }: ProfileTabProps, ref: Ref<HTMLButtonElement>) => (
  <button
    ref={ref}
    type="button"
    class={cn("flex items-center gap-2 border-transparent border-b-2 text-grey-500 capitalize transition-colors", {
      "text-black": activeTab === tab,
    })}
    onClick={() => setActiveTab(tab)}
  >
    <div class="min-h-6 min-w-7 p-1">
      <Icon icon={icon} className="h-5 w-5" />
    </div>
    <p class="leading-1">{tab.split("_").join(" ")}</p>
  </button>
));
