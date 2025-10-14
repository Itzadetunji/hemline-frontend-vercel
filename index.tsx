import { render } from "preact";
import { Router, Route, LocationProvider, ErrorBoundary } from "preact-iso";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./src/lib/queryClient";
import { Routes } from "./src/layout/Routes";

const Document = () => {
	return (
		<QueryClientProvider client={queryClient}>
			{(<Routes />) as any}
		</QueryClientProvider>
	);
};

const appElement = document.getElementById("app");
if (appElement) {
	render(<Document />, appElement);
}
