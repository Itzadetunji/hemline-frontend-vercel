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
        toastOptions={{
          style: {
            border: "1px solid var(--primary)",
            padding: "4px 4px",
            color: "var(--primary)",
            borderRadius: "0px",
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
