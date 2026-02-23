import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";

import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  bulkDeleteOrders,
  markOrderAsDone,
  markOrderAsPending,
} from "@/lib/offline/offline-orders";
import { ORDERS_API } from "./orders.api";
import { userSignal } from "@/stores/userStore";
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
  GetAllOrdersParams,
} from "./orders.types";
import { createQueryKey } from "@/lib/queryClient";

export const ordersQueryKeys = {
  all: createQueryKey(["orders"]),
  lists: () => createQueryKey([...ordersQueryKeys.all, "list"]),
  list: (clientId: string, params?: { page?: number; per_page?: number }) => createQueryKey([...ordersQueryKeys.lists(), clientId, params]),
  details: () => createQueryKey([...ordersQueryKeys.all, "detail"]),
  detail: (orderId: string) => createQueryKey([...ordersQueryKeys.details(), orderId]),
  infinite: (params?: GetAllOrdersParams) => createQueryKey([...ordersQueryKeys.lists(), "infinite", params]),
} as const;

export const useGetOrders = (clientId: string, params?: GetAllOrdersParams & { enabled?: boolean }) => {
  const userId = userSignal.value?.user?.id;
  return useQuery<ListOrdersResponse, AxiosError>({
    queryKey: ordersQueryKeys.list(clientId, params),
    queryFn: () => getOrders(params),
    enabled: !!clientId && !!userId,
  });
};

export const useInfiniteGetOrders = (params?: GetAllOrdersParams & { enabled?: boolean }) => {
  const userId = userSignal.value?.user?.id;
  return useInfiniteQuery<ListOrdersResponse, AxiosError>({
    queryKey: [...ordersQueryKeys.lists(), params],
    queryFn: ({ pageParam = 1 }) => getOrders({ ...params, page: pageParam as number }),
    enabled: (params?.enabled ?? true) && !!userId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.pagination.current_page;
      const totalPages = lastPage.data.pagination.total_pages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const useGetOrder = (clientId: string, orderId: string) => {
  return useQuery<GetOrderResponse, AxiosError>({
    queryKey: ordersQueryKeys.detail(orderId),
    queryFn: () => getOrder(clientId, orderId),
    enabled: !!clientId && !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, AxiosError<{ error: string }>, { clientId: string; payload: CreateOrderPayload }>({
    mutationFn: ({ clientId, payload }) => createOrder(clientId, payload),
    onSuccess: () => {
      toast.success("Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateOrderResponse, AxiosError<{ error: string }>, { orderId: string; payload: UpdateOrderPayload }>({
    mutationFn: ({ orderId, payload }) => updateOrder(orderId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: { order: data.data } };
      });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error updating order:", error);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrderResponse, AxiosError<{ error: string }>, { order_ids: string[] }>({
    mutationFn: (payload) => bulkDeleteOrders({ order_ids: payload.order_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error deleting order:", error);
    },
  });
};

export const useBulkDeleteOrders = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteOrdersResponse, AxiosError<{ error: string }>, DeleteOrdersPayload>({
    mutationFn: bulkDeleteOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error deleting orders:", error);
    },
  });
};

export const useCreateGeneralOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, AxiosError<{ error: string }>, CreateOrderPayload>({
    mutationFn: (payload) => ORDERS_API.CREATE_GENERAL(payload),
    onSuccess: () => {
      toast.success("Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.infinite(), exact: false });
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
    mutationFn: ({ orderId }) => markOrderAsDone(orderId),
    onSuccess: (data, variables) => {
      toast.success("Order marked as done!");
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: { order: data.data } };
      });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.infinite(), exact: false });
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
    mutationFn: ({ orderId }) => markOrderAsPending(orderId),
    onSuccess: (data, variables) => {
      toast.success("Order marked as pending!");
      queryClient.setQueryData<GetOrderResponse>(ordersQueryKeys.detail(variables.orderId), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, data: { order: data.data } };
      });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.infinite(), exact: false });
    },
    onError: (error) => {
      console.error("Error marking order as pending:", error);
      toast.error("Failed to mark order as pending");
    },
  });
};
