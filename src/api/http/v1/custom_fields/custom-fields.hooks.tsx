import type { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getCustomFields,
  createCustomField,
  updateCustomField,
  deactivateCustomField,
} from "@/lib/offline/offline-custom-fields";
import { userSignal } from "@/stores/userStore";
import type {
  CustomFieldsListResponse,
  CustomFieldResponse,
  CreateCustomFieldPayload,
  UpdateCustomFieldPayload,
} from "./custom-fields.types";
import { createQueryKey } from "@/lib/queryClient";

export const customFieldsQueryKeys = {
  all: createQueryKey(["custom-fields"]),
} as const;

export const useGetCustomFields = () => {
  const userId = userSignal.value?.user?.id;
  return useQuery<CustomFieldsListResponse, AxiosError>({
    queryKey: customFieldsQueryKeys.all,
    queryFn: getCustomFields,
    enabled: !!userId,
  });
};

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation<CustomFieldResponse, AxiosError, CreateCustomFieldPayload>({
    mutationFn: createCustomField,
    onSuccess: (data) => {
      toast.success("Custom Field created!");
      queryClient.setQueryData<CustomFieldsListResponse | undefined>(customFieldsQueryKeys.all, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: [...oldData.data, data.data] } as CustomFieldsListResponse;
      });
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
    mutationFn: ({ id, payload }) => updateCustomField(id, payload),
    onSuccess: (data, vars) => {
      queryClient.setQueryData<CustomFieldsListResponse | undefined>(customFieldsQueryKeys.all, (oldData) => {
        if (!oldData) return oldData;
        const updatedData = oldData.data.map((item) =>
          item.data.id === vars.id ? { ...data.data } : item
        );
        return { ...oldData, data: updatedData } as CustomFieldsListResponse;
      });
      queryClient.invalidateQueries({ queryKey: customFieldsQueryKeys.all });
    },
    onError: (err) => {
      console.error("Error updating custom field:", err);
    },
  });
};

export const useDeactivateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, string>({
    mutationFn: deactivateCustomField,
    onSuccess: (_, id) => {
      queryClient.setQueryData<CustomFieldsListResponse>(customFieldsQueryKeys.all, (oldData) => {
        if (!oldData) return oldData;
        const updatedData = oldData.data.map((item) =>
          item.data.id === id ? { ...item, is_active: false } : item
        );
        return { ...oldData, data: updatedData };
      });
      queryClient.invalidateQueries({ queryKey: customFieldsQueryKeys.all });
    },
    onError: (err) => {
      console.error("Error deactivating custom field:", err);
    },
  });
};
