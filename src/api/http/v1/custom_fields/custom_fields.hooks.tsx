import type { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { CUSTOM_FIELDS_API } from "./custom_fields.api";
import type { CustomFieldsListResponse, CustomFieldResponse, CreateCustomFieldPayload, UpdateCustomFieldPayload } from "./custom_fields.types";

export const customFieldsQueryKeys = {
  all: ["custom-fields"] as const,
} as const;

export const useGetCustomFields = () => {
  return useQuery<CustomFieldsListResponse, AxiosError>({
    queryKey: customFieldsQueryKeys.all,
    queryFn: CUSTOM_FIELDS_API.GET_ALL,
  });
};

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation<CustomFieldResponse, AxiosError, CreateCustomFieldPayload>({
    mutationFn: (payload) => CUSTOM_FIELDS_API.CREATE(payload),
    onSuccess: () => {
      toast.success("Custom Field created!");
      // Refresh list
      queryClient.invalidateQueries({ queryKey: customFieldsQueryKeys.all });
    },
    onError: (err) => {
      console.error("Error creating custom field:", err);
      toast.error("Custom Field could not be created");
    },
  });
};

export const useUpdateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation<CustomFieldResponse, AxiosError, { id: string; payload: UpdateCustomFieldPayload }>({
    mutationFn: ({ id, payload }) => CUSTOM_FIELDS_API.UPDATE(id, payload),
    onSuccess: () => {
      // toast.success("Custom field updated");
      queryClient.invalidateQueries({ queryKey: customFieldsQueryKeys.all });
    },
    onError: (err) => {
      console.error("Error updating custom field:", err);
      // toast.error("Failed to update custom field");
    },
  });
};

export const useDeactivateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, string>({
    mutationFn: (id) => CUSTOM_FIELDS_API.DEACTIVATE(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customFieldsQueryKeys.all });
    },
    onError: (err) => {
      console.error("Error deactivating custom field:", err);
    },
  });
};
