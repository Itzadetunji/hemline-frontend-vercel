import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";

import { NativeLayout } from "./NativeLayout";
import { Onboarding } from "@/pages/Auth/Onboarding/page";
import { SignIn } from "@/pages/Auth/SignIn/page";
import { SignUp } from "@/pages/Auth/SignUp/page";
import { AddClients } from "@/pages/Clients/add-clients";
import { Orders } from "@/pages/Clients/orders/page";
import { Clients } from "@/pages/Clients/page";
import { ViewClient } from "@/pages/Clients/view-client";
import { Folders } from "@/pages/Folders/page";
import { PublicFolderGallery } from "@/pages/Folders/public-single-folder";
import { SingleFolderGallery } from "@/pages/Folders/single-folder";
import { Gallery } from "@/pages/Gallery/page";
import { Profile } from "@/pages/Profile/page";
import { ProtectedRoute } from "./ProtectedRoute";
import { TermsAndConditions } from "@/pages/TermsAndConditions/page";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy/page";
import { Support } from "@/pages/Support/page";
import { VerifyMagicLink } from "@/pages/VerifyMagicLink/page";

export const Routes = () => {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <NativeLayout>
          <Router>
            <ProtectedRoute path="/" component={Gallery} />
            <ProtectedRoute path="/gallery" component={Gallery} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/sign-in" component={SignIn} />
            <Route path="/verify-magic-link" component={VerifyMagicLink} />
            <ProtectedRoute path="/onboarding" component={Onboarding} />
            <ProtectedRoute path="/gallery/folders" component={Folders} />
            <ProtectedRoute path="/gallery/folders/:folder_id" component={SingleFolderGallery} />
            <Route path="/folders/:public_id" component={PublicFolderGallery} />
            <ProtectedRoute path="/clients" component={Clients} />
            <ProtectedRoute path="/clients/add" component={AddClients} />
            <ProtectedRoute path="/clients/orders" component={Orders} />
            <ProtectedRoute path="/clients/:client_id" component={ViewClient} />
            <ProtectedRoute path="/profile" component={Profile} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms-and-conditions" component={TermsAndConditions} />
            <Route path="/support" component={Support} />
          </Router>
        </NativeLayout>
      </ErrorBoundary>
    </LocationProvider>
  );
};
