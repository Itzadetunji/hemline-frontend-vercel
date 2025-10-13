import { render } from "preact";
import { Router, Route, LocationProvider, ErrorBoundary } from "preact-iso";

import { Home } from "./src/pages/Home/Home";
import { queryClient } from "./src/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

const Routes = () => {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<Router>
					<Route
						path="/"
						component={Home}
					/>
					<Route
						path="/33"
						component={Home}
					/>
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	);
};

const Document = () => {
	return (
		<QueryClientProvider client={queryClient}>
			{Routes() as any}
		</QueryClientProvider>
	);
};

const appElement = document.getElementById("app");
if (appElement) {
	render(<Document />, appElement);
}
