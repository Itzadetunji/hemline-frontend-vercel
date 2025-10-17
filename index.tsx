import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "preact";
import { Toaster } from "react-hot-toast";

import { Routes } from "./src/layout/Routes";
import { queryClient } from "./src/lib/queryClient";

const Document = () => {
	return (
		<QueryClientProvider client={queryClient}>
			{(<Routes />) as any}
			<Toaster
				position="bottom-center"
				reverseOrder={false}
			/>
		</QueryClientProvider>
	);
};

const appElement = document.getElementById("app");
if (appElement) {
	render(<Document />, appElement);
}
