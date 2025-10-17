import { SelectIcon } from "@/components/svg-icons/select-icon";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";

// Signal for header content that can be accessed anywhere
export const headerContentSignal = signal<ComponentChildren>("Gallery");

export const Header = () => {
	return (
		<header class="flex items-center gap-2 justify-between pt-4">
			<h1 class="text-black text-[2rem] text-3xl ">
				{headerContentSignal.value}
			</h1>
			<ul class="flex-1 flex items-center justify-end gap-3">
				<li>
					<button
						onClick={() => {}}
						class="p-1"
					>
						<SelectIcon class="h-4 w-4 fill-black" />
					</button>
				</li>
				<li>
					<button
						onClick={() => {}}
						class="p-1"
					>
						<Icon
							icon="iconoir:upload"
							className="h-4 w-4 text-black"
						/>
					</button>
				</li>
				<li>
					<button
						onClick={() => {}}
						class="p-1"
					>
						<Icon
							icon="bi:folder"
							className="h-4 w-4 text-black"
						/>
					</button>
				</li>
				<a href="/profile">
					<li class="rounded-full size-9 -9 w-9 overflow-hidden">
						<img
							src="https://placehold.co/36x36"
							alt=""
						/>
					</li>
				</a>
			</ul>
		</header>
	);
};

const Tabs = ["gallery", "clients", "folders"];
type Tab = (typeof Tabs)[number];

export const NavBar = () => {
	const location = useLocation();

	const [activeNavBar, setActiveNavBar] = useState("gallery");

	return (
		<ul class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-line-500 flex items-center p-0.5">
			{Tabs.map((tab) => (
				<NavbarCard
					tab={tab}
					activeNavBar={activeNavBar}
					setActiveNavBar={setActiveNavBar}
				/>
			))}
		</ul>
	);
};

const NavbarCard = (props: {
	tab: Tab;
	activeNavBar: string;
	setActiveNavBar: React.Dispatch<React.SetStateAction<string>>;
}) => {
	return (
		<a href={`/${props.tab}`}>
			<li
				class={cn(
					"capitalize bg-primary py-2.5 text-white px-4 transition-colors",
					{
						"bg-transparent text-grey-500": props.activeNavBar !== props.tab,
					}
				)}
			>
				{props.tab}
			</li>
		</a>
	);
};
