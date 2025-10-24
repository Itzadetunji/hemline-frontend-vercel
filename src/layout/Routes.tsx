import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";

import { Onboarding } from "@/pages/Auth/Onboarding/page";
import { SignIn } from "@/pages/Auth/SignIn/page";
import { SignUp } from "@/pages/Auth/SignUp/page";
import { Folders } from "@/pages/Folders/page";
import { Gallery } from "@/pages/Gallery/page";
import { ProtectedRoute } from "./ProtectedRoute";
import { SingleFolderGallery } from "@/pages/Folders/single-folder";

export const Routes = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          {/* Protected Routes - Require Authentication */}

          <ProtectedRoute path="/" component={Gallery} />
          <ProtectedRoute path="/onboarding" component={Onboarding} />

          {/* Public Routes - Redirect if already authenticated */}
          <Route path="/sign-up" component={SignUp} />
          <Route path="/sign-in" component={SignIn} />
          <ProtectedRoute path="/onboarding" component={Onboarding} />
          <ProtectedRoute path="/gallery" component={Gallery} />
          <ProtectedRoute path="/gallery/folders" component={Folders} />
          <ProtectedRoute path="/gallery/folders/:id" component={SingleFolderGallery} />
          <ProtectedRoute path="/clients" component={Gallery} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
};
