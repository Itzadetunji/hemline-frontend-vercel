import type { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { CLIENTS_API } from "./clients.api";
import type {
  ListClientsResponse,
  GetClientResponse,
  CreateClientResponse,
  UpdateClientResponse,
  DeleteClientsResponse,
  CreateClientPayload,
  UpdateClientPayload,
  DeleteClientsPayload,
} from "./clients.types";

export const clientsQueryKeys = {
  all: ["clients"] as const,
  lists: () => [...clientsQueryKeys.all, "list"] as const,
  list: (params?: { page?: number; per_page?: number }) => [...clientsQueryKeys.lists(), params] as const,
  details: () => [...clientsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...clientsQueryKeys.details(), id] as const,
  infinite: (perPage?: number) => [...clientsQueryKeys.lists(), "infinite", perPage] as const,
} as const;

export const useGetClients = (params?: { page?: number; per_page?: number }) => {
  return useQuery<ListClientsResponse, AxiosError>({
    queryKey: clientsQueryKeys.list(params),
    queryFn: () => CLIENTS_API.GET_ALL(params),
  });
};

export const useInfiniteGetClients = (perPage = 20) => {
  return useInfiniteQuery<ListClientsResponse, AxiosError>({
    queryKey: clientsQueryKeys.infinite(perPage),
    queryFn: ({ pageParam = 1 }) =>
      CLIENTS_API.GET_ALL({
        per_page: perPage,
        page: pageParam as number,
      }),
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
    queryFn: () => CLIENTS_API.GET(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateClientResponse, AxiosError<{ error: string }>, CreateClientPayload>({
    mutationFn: CLIENTS_API.CREATE,
    onSuccess: () => {
      toast.success("Client created successfully!");

      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
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
    mutationFn: ({ id, payload }) => CLIENTS_API.UPDATE(id, payload),
    onSuccess: (data, variables) => {
      toast.success("Client updated successfully!");

      // Update the specific client detail in cache
      queryClient.setQueryData<GetClientResponse>(clientsQueryKeys.detail(variables.id), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            client: data.data.client,
          },
        };
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: clientsQueryKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
    },
  });
};

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteClientsResponse, AxiosError<{ error: string }>, DeleteClientsPayload>({
    mutationFn: CLIENTS_API.BULK_DELETE,
    onSuccess: () => {
      toast.success("Clients deleted successfully!");

      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Error deleting clients:", error);
      toast.error("Failed to delete clients");
    },
  });
};
