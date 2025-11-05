import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";

import { Onboarding } from "@/pages/Auth/Onboarding/page";
import { SignIn } from "@/pages/Auth/SignIn/page";
import { SignUp } from "@/pages/Auth/SignUp/page";
import { AddClients } from "@/pages/Clients/add-clients";
import { Orders } from "@/pages/Clients/orders/page";
import { Clients } from "@/pages/Clients/page";
import { Folders } from "@/pages/Folders/page";
import { PublicFolderGallery } from "@/pages/Folders/public-single-folder";
import { SingleFolderGallery } from "@/pages/Folders/single-folder";
import { Gallery } from "@/pages/Gallery/page";
import { Profile } from "@/pages/Profile/page";
import { ProtectedRoute } from "./ProtectedRoute";
import { ViewClient } from "@/pages/Clients/view-client";

export const Routes = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        {/* Protected Routes - Require Authentication */}

        {import.meta.env.MODE === "development" ? (
          <Router>
            <ProtectedRoute path="/" component={Gallery} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/sign-in" component={SignIn} />
            <ProtectedRoute path="/onboarding" component={Onboarding} />
            <ProtectedRoute path="/gallery" component={Gallery} />
            <ProtectedRoute path="/gallery/folders" component={Folders} />
            <ProtectedRoute path="/gallery/folders/:folder_id" component={SingleFolderGallery} />
            <Route path="/folders/:public_id" component={PublicFolderGallery} />
            <ProtectedRoute path="/clients" component={Clients} />
            <ProtectedRoute path="/clients/add" component={AddClients} />
            <ProtectedRoute path="/clients/orders" component={Orders} />
            <ProtectedRoute path="/clients/:client_id" component={ViewClient} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/onboarding" component={Onboarding} />
          </Router>
        ) : (
          <Router>
            <Route path="/" component={ComingSoon} />
            <Route path="/" component={ComingSoon} />
          </Router>
        )}

        {/* Public Routes - Redirect if already authenticated */}
      </ErrorBoundary>
    </LocationProvider>
  );
};

const ComingSoon = () => {
  return (
    <div class="flex h-screen flex-1 flex-col p-4">
      <ul class="flex items-center gap-4">
        <img src="/assets/brand/logo.svg" class="size-8" alt="Brand Logo" />
        <h1 class="max-w-[10ch] truncate pr-1 text-3xl text-black">Hemline</h1>
      </ul>
      <div class="flex flex-1 flex-col items-center justify-center gap-2">
        <h2 class="text-4xl">Coming Soon</h2>
        <a href="https://x.com/hemlinestudio">
          Check us out <span class="underline">here</span>
        </a>
      </div>
    </div>
  );
};
