import type { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getClients,
  getClient,
  createClient,
  updateClient,
  bulkDeleteClients,
} from "@/lib/offline/offline-clients";
import { userSignal } from "@/stores/userStore";
import type {
  ListClientsResponse,
  GetClientResponse,
  CreateClientResponse,
  UpdateClientResponse,
  DeleteClientsResponse,
  CreateClientPayload,
  UpdateClientPayload,
  DeleteClientsPayload,
  GetAllClientsParams,
} from "./clients.types";
import { createQueryKey } from "@/lib/queryClient";

export const clientsQueryKeys = {
  all: createQueryKey(["clients"]),
  lists: () => createQueryKey([...clientsQueryKeys.all, "list"]),
  list: (params?: GetAllClientsParams) => createQueryKey([...clientsQueryKeys.lists(), params]),
  details: () => createQueryKey([...clientsQueryKeys.all, "detail"]),
  detail: (id: string) => createQueryKey([...clientsQueryKeys.details(), id]),
  infinite: (params?: GetAllClientsParams) => createQueryKey([...clientsQueryKeys.lists(), "infinite", params]),
} as const;

export const useGetClients = (params?: GetAllClientsParams & { enabled?: boolean }) => {
  const userId = userSignal.value?.user?.id;
  return useQuery<ListClientsResponse, AxiosError>({
    queryKey: clientsQueryKeys.list(params),
    queryFn: () => getClients(params),
    enabled: (params?.enabled ?? true) && !!userId,
  });
};

export const useInfiniteGetClients = (params?: GetAllClientsParams & { enabled?: boolean }) => {
  const userId = userSignal.value?.user?.id;
  return useInfiniteQuery<ListClientsResponse, AxiosError>({
    queryKey: clientsQueryKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) => getClients({ ...params, page: pageParam as number }),
    enabled: (params?.enabled ?? true) && !!userId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { current_page, total_pages } = lastPage.pagination;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage.pagination) return undefined;
      const { current_page } = firstPage.pagination;
      return current_page > 1 ? current_page - 1 : undefined;
    },
  });
};

export const useGetClient = (id: string) => {
  return useQuery<GetClientResponse, AxiosError>({
    queryKey: clientsQueryKeys.detail(id),
    queryFn: () => getClient(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateClientResponse, AxiosError<{ error: string }>, CreateClientPayload>({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Client created successfully!");
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateClientResponse, AxiosError<{ error: string }>, { id: string; payload: UpdateClientPayload }>({
    mutationFn: ({ id, payload }) => updateClient(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<GetClientResponse | undefined>(clientsQueryKeys.detail(variables.id), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: { ...data.data, data: data.data } };
      });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error updating client:", error);
    },
  });
};

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteClientsResponse, AxiosError<{ error: string }>, DeleteClientsPayload>({
    mutationFn: bulkDeleteClients,
    onSuccess: () => {
      toast.success("Clients deleted successfully!");
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error deleting clients:", error);
      toast.error("Failed to delete clients");
    },
  });
};
