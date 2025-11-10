import type { ComponentChildren } from "preact";
import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { isAuthenticated } from "@/stores/authStore";

interface AuthLayoutProps {
  children: ComponentChildren;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthLayout = ({ children, redirectTo = "/sign-in" }: AuthLayoutProps) => {
  const location = useLocation();
  const isUserAuthenticated = isAuthenticated.value;

  useEffect(() => {
    if (!isUserAuthenticated) {
      // User needs to be authenticated but isn't - redirect to login
      location.route(redirectTo);
    } else if (isUserAuthenticated) {
      // User is authenticated but trying to access auth pages - redirect to home
      location.route("/gallery");
    }
  }, [isUserAuthenticated, redirectTo, location]);

  // Show loading or nothing while redirect is happening
  if (!isUserAuthenticated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isUserAuthenticated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
