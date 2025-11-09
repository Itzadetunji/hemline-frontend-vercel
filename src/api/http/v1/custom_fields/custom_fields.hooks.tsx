import type { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { CUSTOM_FIELDS_API } from "./custom_fields.api";
import type { CustomFieldsListResponse, CustomFieldResponse, CreateCustomFieldPayload, UpdateCustomFieldPayload } from "./custom_fields.types";
import { createQueryKey } from "@/lib/queryClient";

export const customFieldsQueryKeys = {
  all: createQueryKey(["custom-fields"]),
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
    onSuccess: (data) => {
      toast.success("Custom Field created!");

      // Update query data before invalidating
      queryClient.setQueryData<CustomFieldsListResponse | undefined>(customFieldsQueryKeys.all, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [...oldData.data, data.data],
        } as CustomFieldsListResponse;
      });

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
    onSuccess: (data, vars) => {
      // Update query data before invalidation
      queryClient.setQueryData<CustomFieldsListResponse | undefined>(customFieldsQueryKeys.all, (oldData) => {
        if (!oldData) return oldData;
        // console.log("OLD DATA", oldData);
        const updatedData = oldData.data.map((item) => {
          return item.data.id === vars.id ? { ...data.data } : item;
        });

        console.log(oldData, { data: updatedData });
        return {
          ...oldData,
          data: updatedData,
        } as CustomFieldsListResponse;
      });

      // toast.success("Custom field updated");

      // Refresh list
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
    onSuccess: (_, id) => {
      // Update query data before invalidation
      queryClient.setQueryData<CustomFieldsListResponse>(customFieldsQueryKeys.all, (oldData) => {
        if (!oldData) return oldData;
        const updatedData = oldData.data.map((item) => (item.data.id === id ? { ...item, is_active: false } : item));
        return {
          ...oldData,
          data: updatedData,
        };
      });

      // Referesh List
      queryClient.invalidateQueries({ queryKey: customFieldsQueryKeys.all });
    },
    onError: (err) => {
      console.error("Error deactivating custom field:", err);
    },
  });
};
