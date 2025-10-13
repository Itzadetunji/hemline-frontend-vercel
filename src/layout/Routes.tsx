import { CreateAccount } from "@/pages/CreateAccount/page";
import { Home } from "@/pages/Home/Home";
import { LocationProvider, ErrorBoundary, Router, Route } from "preact-iso";

export const Routes = () => {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<Router>
					<Route
						path="/"
						component={Home}
					/>
					<Route
						path="/sign-up"
						component={CreateAccount}
					/>
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	);
};
