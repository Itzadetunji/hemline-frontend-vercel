import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect } from "preact/hooks";
import toast from "react-hot-toast";
import z from "zod";

import $http from "../xhr";

export const WAITLIST_API = {
  ADD_TO_WAITLIST: async (payload: AddToWaitlistPayload): Promise<AddToWaitlistResponse> => await $http.post("waitlist", payload).then((res) => res.data),
};

export const useWaitlist = () => {
  const addToWaitlistMutation = useMutation<AddToWaitlistResponse, AxiosError<Record<string, any>>, AddToWaitlistPayload>({
    mutationFn: WAITLIST_API.ADD_TO_WAITLIST,
    onMutate: () =>
      toast.loading("Adding you to the wailist 😊", {
        id: "wailist",
      }),
  });

  useEffect(() => {
    if (addToWaitlistMutation.data) {
      toast.success("Added you to the waitlist 🎉", { id: "wailist", duration: 5000 });
    }
  }, [addToWaitlistMutation.data]);

  return addToWaitlistMutation;
};

interface AddToWaitlistResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    joined_at: string;
  };
}

export const AddToWaitlistPayloadSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

export type AddToWaitlistPayload = z.infer<typeof AddToWaitlistPayloadSchema>;
