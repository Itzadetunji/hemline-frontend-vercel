import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";

import { ORDERS_API } from "./orders.api";
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  DeleteOrderResponse,
  DeleteOrdersResponse,
  DeleteOrdersPayload,
  GetOrderResponse,
  ListOrdersResponse,
  UpdateOrderPayload,
  UpdateOrderResponse,
} from "./orders.types";

export const ordersQueryKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersQueryKeys.all, "list"] as const,
  list: (clientId: string, params?: { page?: number; per_page?: number }) => [...ordersQueryKeys.lists(), clientId, params] as const,
  details: () => [...ordersQueryKeys.all, "detail"] as const,
  detail: (orderId: string) => [...ordersQueryKeys.details(), orderId] as const,
} as const;

export const useGetOrders = (
  clientId: string,
  params?: {
    page?: number;
    per_page?: number;
  }
) => {
  return useQuery<ListOrdersResponse, AxiosError>({
    queryKey: ordersQueryKeys.list(clientId, params),
    queryFn: () => ORDERS_API.GET_ALL(params),
    enabled: !!clientId,
  });
};

export const useInfiniteGetOrders = (perPage = 20) => {
  return useInfiniteQuery<ListOrdersResponse, AxiosError>({
    queryKey: [...ordersQueryKeys.lists(), perPage],
    queryFn: ({ pageParam = 1 }) => ORDERS_API.GET_ALL({ page: pageParam as number, per_page: perPage }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.pagination.current_page;
      const totalPages = lastPage.data.pagination.total_pages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useGetOrder = (clientId: string, orderId: string) => {
  return useQuery<GetOrderResponse, AxiosError>({
    queryKey: ordersQueryKeys.detail(orderId),
    queryFn: () => ORDERS_API.GET(clientId, orderId),
    enabled: !!clientId && !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, AxiosError<{ error: string }>, { clientId: string; payload: CreateOrderPayload }>({
    mutationFn: ({ clientId, payload }) => ORDERS_API.CREATE(clientId, payload),
    onSuccess: () => {
      toast.success("Order created successfully!");

      // Invalidate and refetch orders list for this client
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrderResponse, AxiosError<{ error: string }>, { clientId: string; orderId: string; payload: UpdateOrderPayload }>({
    mutationFn: ({ clientId, orderId, payload }) => ORDERS_API.UPDATE(clientId, orderId, payload),
    onSuccess: (data, variables) => {
      toast.success("Order updated successfully!");

      // Update the specific order detail in cache
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            order: data.data,
          },
        };
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrderResponse, AxiosError<{ error: string }>, { order_ids: string[] }>({
    mutationFn: ORDERS_API.BULK_DELETE,
    onSuccess: () => {
      toast.success("Order deleted successfully!");

      // Invalidate and refetch orders list
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    },
  });
};

export const useBulkDeleteOrders = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrdersResponse, AxiosError<{ error: string }>, DeleteOrdersPayload>({
    mutationFn: (payload) => ORDERS_API.BULK_DELETE(payload),
    onSuccess: () => {
      toast.success("Orders deleted successfully!");

      // Invalidate and refetch orders list
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error deleting orders:", error);
      toast.error("Failed to delete orders");
    },
  });
};

export const useCreateGeneralOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, AxiosError<{ error: string }>, CreateOrderPayload>({
    mutationFn: (payload) => ORDERS_API.CREATE_GENERAL(payload),
    onSuccess: () => {
      toast.success("Order created successfully!");

      // Invalidate and refetch orders list
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    },
  });
};

export const useMarkOrderAsDone = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrderResponse, AxiosError<{ error: string }>, { clientId: string; orderId: string }>({
    mutationFn: ({ orderId }) => ORDERS_API.MARK_AS_DONE(orderId),
    onSuccess: (data, variables) => {
      toast.success("Order marked as done!");

      // Update the specific order detail in cache
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            order: data.data,
          },
        };
      });

      // Update infinite query cache
      queryClient.setQueriesData<InfiniteData<ListOrdersResponse>>({ queryKey: ordersQueryKeys.lists(), exact: false }, (oldData) => {
        if (!oldData) return oldData;
        console.log(oldData);
        const newdata = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              orders: page.data.orders.map((order) => (order.id === variables.orderId ? data.data : order)),
            },
          })),
        };
        console.log(newdata);
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
    },
    onError: (error) => {
      console.error("Error marking order as done:", error);
      toast.error("Failed to mark order as done");
    },
  });
};

export const useMarkOrderAsPending = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrderResponse, AxiosError<{ error: string }>, { orderId: string }>({
    mutationFn: ({ orderId }) => ORDERS_API.MARK_AS_PENDING(orderId),
    onSuccess: (data, variables) => {
      toast.success("Order marked as pending!");

      // Update the specific order detail in cache
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            order: data.data,
          },
        };
      });

      // Update infinite query cache
      queryClient.setQueriesData<InfiniteData<ListOrdersResponse>>({ queryKey: ordersQueryKeys.lists(), exact: false }, (oldData) => {
        if (!oldData) return oldData;
        console.log(oldData);
        const newdata = {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              orders: page.data.orders.map((order) => (order.id === variables.orderId ? data.data : order)),
            },
          })),
        };
        console.log(newdata);
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(variables.orderId),
      });
    },
    onError: (error) => {
      console.error("Error marking order as pending:", error);
      toast.error("Failed to mark order as pending");
    },
  });
};
