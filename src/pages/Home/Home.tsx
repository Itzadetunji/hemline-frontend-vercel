import { useState } from "preact/hooks";

export const Home = () => {
	const [count, setCount] = useState(0);

	return (
		<>
			<div>
				<a
					href="https://vite.dev"
					target="_blank"
				>
					<img
						src="/assets/favicon.ico"
						class="logo"
						alt="Vite logo"
					/>
				</a>
			</div>
			<h1>Vite + Preact</h1>
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
			<p class="bg-gray-200">
				Check out{" "}
				<a
					href="https://preactjs.com/guide/v10/getting-started#create-a-vite-powered-preact-app"
					target="_blank"
				>
					create-preact
				</a>
				, the official Preact + Vite starter
			</p>
			<p class="read-the-docs">
				Click on the Vite and Preact logos to learn more
			</p>
		</>
	);
};
