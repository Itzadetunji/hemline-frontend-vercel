import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";

import { Onboarding } from "@/pages/Auth/Onboarding/page";
import { SignIn } from "@/pages/Auth/SignIn/page";
import { SignUp } from "@/pages/Auth/SignUp/page";
import { Home } from "@/pages/Home/Home";

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
						component={SignUp}
					/>
					<Route
						path="/sign-in"
						component={SignIn}
					/>
					<Route
						path="/onboarding"
						component={Onboarding}
					/>
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	);
};
