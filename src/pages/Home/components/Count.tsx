import { userStore, userSignal } from "@/stores/userStore";

export const Count = () => {
	return (
		<div>
			<button
				type="button"
				onClick={() =>
					userSignal.value && userStore.increment(userSignal.value?.count + 1)
				}
				class="font-primary"
			>
				count is {userSignal.value?.count}
			</button>
			<p class="font-bold">
				Edit <code>src/app.tsx</code> and save to test HMR
			</p>
		</div>
	);
};
