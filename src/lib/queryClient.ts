import { userSignal } from "@/stores/userStore";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const createQueryKey = (data: any) => {
  const userId = userSignal.value?.user?.id;

  return [userId, data] as const;
};
