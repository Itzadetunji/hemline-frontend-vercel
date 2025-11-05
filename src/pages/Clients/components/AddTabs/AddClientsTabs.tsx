import { forwardRef, type Ref } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

import { cn } from "@/lib/utils";
import { useLocation, useRoute } from "preact-iso";

export const ClientTabs = ["details", "orders", "measurements"] as const;
export type AddClientsTab = (typeof ClientTabs)[number];

type AddClientsTabProps = {
  tab: AddClientsTab;
  activeTab: AddClientsTab;
  setActiveTab: (tab: AddClientsTab) => void;
};

export const AddClientsTabs = (props: { activeTab: AddClientsTab; setActiveTab: (tab: AddClientsTab) => void; editTabs?: (typeof ClientTabs)[number] }) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!indicatorRef.current || tabRefs.current.length === 0) return;
    const activeIndex = ClientTabs.indexOf(props.activeTab);
    const activeTabEl = tabRefs.current[activeIndex];
    if (!activeTabEl) return;

    indicatorRef.current.style.width = `${activeTabEl.offsetWidth}px`;
    indicatorRef.current.style.left = `${activeTabEl.offsetLeft}px`;
  }, [props.activeTab]);

  return (
    <div class="relative border-b-2 border-b-line-700">
      <ul class="flex items-center gap-4">
        {ClientTabs.map((tab, index) => (
          <ClientsTab
            key={tab}
            tab={tab}
            activeTab={props.activeTab}
            setActiveTab={props.setActiveTab}
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

export const ClientsTab = forwardRef(({ tab, activeTab, setActiveTab }: AddClientsTabProps, ref: Ref<HTMLButtonElement>) => {
  const location = useLocation();
  const { params } = useRoute();

  const changeRoute = () => {
    setActiveTab(tab);

    if (location.path !== "/clients/add") {
      location.route(`/clients/${params.client_id}?tab=${tab}`, true);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      class={cn("flex items-center gap-2 border-transparent border-b-2 px-2 py-2.5 text-grey-500 capitalize transition-colors", {
        "text-black": activeTab === tab,
      })}
      onClick={changeRoute}
    >
      <p class="leading-1">{tab.split("_").join(" ")}</p>
    </button>
  );
});
