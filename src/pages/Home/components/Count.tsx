import { useState } from "preact/hooks";
import React from "react";

export const Count = () => {
	const [count, setCount] = useState(0);

	return (
		<div>
			<button
				onClick={() => setCount((count) => count + 1)}
				class="font-primary"
			>
				count is {count}
			</button>
			<p class=" font-bold">
				Edit <code>src/app.tsx</code> and save to test HMR
			</p>
		</div>
	);
};
