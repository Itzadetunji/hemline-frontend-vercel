import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "preact";
import { Toaster } from "react-hot-toast";

import { Routes } from "./src/layout/Routes";
import { queryClient } from "./src/lib/queryClient";
import { AppInit } from "./src/components/AppInit";

const Document = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInit>
        {(<Routes />) as any}
      </AppInit>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            border: "1px solid var(--primary)",
            padding: "4px 4px",
            color: "var(--primary)",
            borderRadius: "0px",
            textAlign: "center",
          },
          icon: null,
        }}
      />
    </QueryClientProvider>
  );
};

const appElement = document.getElementById("app");
if (appElement) {
  render(<Document />, appElement);
}
