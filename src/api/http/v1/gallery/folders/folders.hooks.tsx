import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { FOLDERS_API } from "./folders.api";
import type {
  AddImagesToFolderPayload,
  AddImagesToFolderResponse,
  CreateFolderPayload,
  CreateFolderResponse,
  DeleteFolderResponse,
  GetFolderResponse,
  GetFoldersResponse,
  PaginationParams,
  RemoveImagesFromFolderPayload,
  RemoveImagesFromFolderResponse,
  SetFolderCoverImagePayload,
  SetFolderCoverImageResponse,
  UpdateFolderPayload,
  UpdateFolderResponse,
} from "./folders.types";
import { usersQuerykeys } from "../../users/users.hooks";

// Query keys factory
const foldersQueryKeys = {
  all: ["folders"] as const,
  lists: () => [...foldersQueryKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...foldersQueryKeys.lists(), params] as const,
  details: () => [...foldersQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...foldersQueryKeys.details(), id] as const,
  infinite: (perPage?: number) => [...foldersQueryKeys.lists(), "infinite", perPage] as const,
  infiniteFolder: (id: string, perPage?: number) => [...foldersQueryKeys.detail(id), "infinite", perPage] as const,
} as const;

// GET: Fetch all folders with pagination
export const useGetFolders = (params?: PaginationParams) => {
  return useQuery<GetFoldersResponse, AxiosError>({
    queryKey: foldersQueryKeys.list(params),
    queryFn: () => FOLDERS_API.GET_FOLDERS(params),
  });
};

// GET: Fetch folders with infinite scroll
export const useInfiniteGetFolders = (perPage = 20) => {
  return useInfiniteQuery<GetFoldersResponse, AxiosError>({
    queryKey: foldersQueryKeys.infinite(perPage),
    queryFn: ({ pageParam = 1 }) =>
      FOLDERS_API.GET_FOLDERS({
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

// GET: Fetch a single folder by ID
export const useGetFolder = (id: string, enabled = true) => {
  return useQuery<GetFolderResponse, AxiosError>({
    queryKey: foldersQueryKeys.detail(id),
    queryFn: () => FOLDERS_API.GET_FOLDER(id),
    enabled: enabled && !!id,
  });
};

// GET: Fetch a single folder with infinite scroll for images
export const useInfiniteGetFolder = (id: string, perPage = 20, enabled = true) => {
  return useInfiniteQuery<GetFolderResponse, AxiosError>({
    queryKey: foldersQueryKeys.infiniteFolder(id, perPage),
    queryFn: ({ pageParam = 1 }) =>
      FOLDERS_API.GET_FOLDER(id, {
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
    enabled: enabled && !!id,
  });
};

// POST: Create a new folder
export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateFolderResponse, AxiosError<{ error: string; errors?: string[] }>, CreateFolderPayload>({
    mutationFn: FOLDERS_API.CREATE_FOLDER,
    onSuccess: (data) => {
      console.log("Folder created successfully:", data);

      // Invalidate all folder lists to refetch with new folder
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });

      // Invalidate the detail query to refetch with correct structure
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.detail(data.data.id),
      });
    },
    onError: (error) => {
      console.error("Error creating folder:", error);
    },
  });
};

// PATCH: Update a folder
export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateFolderResponse, AxiosError<{ error: string; errors?: string[] }>, { id: string; data: UpdateFolderPayload }>({
    mutationFn: ({ id, data }) => FOLDERS_API.UPDATE_FOLDER(id, data),
    onSuccess: (response, variables) => {
      console.log("Folder updated successfully:", response);

      // Invalidate the specific folder to refetch
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.detail(variables.id),
      });

      // Invalidate lists to reflect the update
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error updating folder:", error);
    },
  });
};

// PATCH: Add images to a folder
export const useAddImagesToFolder = () => {
  const queryClient = useQueryClient();

  return useMutation<AddImagesToFolderResponse, AxiosError<{ error: string; errors?: string[] }>, { id: string; data: AddImagesToFolderPayload }>({
    mutationFn: ({ id, data }) => FOLDERS_API.ADD_IMAGES_TO_FOLDER(id, data),
    onSuccess: (response, variables) => {
      console.log("Images added to folder successfully:", response);

      // Invalidate the specific folder to refetch
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.detail(variables.id),
      });

      // Invalidate lists to reflect the update
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.lists(),
      });

      // Invalidate gallery queries as images now have updated folder_ids
      queryClient.invalidateQueries({
        queryKey: ["gallery"],
      });
    },
    onError: (error) => {
      console.error("Error adding images to folder:", error);
    },
  });
};

// PATCH: Set folder cover image
export const useSetFolderCoverImage = () => {
  const queryClient = useQueryClient();

  return useMutation<SetFolderCoverImageResponse, AxiosError<{ error: string; errors?: string[] }>, { id: string; data: SetFolderCoverImagePayload }>({
    mutationFn: ({ id, data }) => FOLDERS_API.SET_FOLDER_COVER_IMAGE(id, data),
    onSuccess: (response, variables) => {
      console.log("Folder cover image set successfully:", response);

      // Invalidate the specific folder to refetch
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.detail(variables.id),
      });

      // Invalidate lists to reflect the update
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Error setting folder cover image:", error);
    },
  });
};

// DELETE: Remove images from a folder
export const useRemoveImagesFromFolder = () => {
  const queryClient = useQueryClient();

  return useMutation<RemoveImagesFromFolderResponse, AxiosError<{ error: string; errors?: string[] }>, { id: string; data: RemoveImagesFromFolderPayload }>({
    mutationFn: ({ id, data }) => FOLDERS_API.REMOVE_IMAGES_FROM_FOLDER(id, data),
    onSuccess: (response, variables) => {
      console.log("Images removed from folder successfully:", response);

      // Invalidate the specific folder to refetch its updated state
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.detail(variables.id),
      });

      // Invalidate the infinite folder query to refetch with updated images
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.infiniteFolder(variables.id),
      });

      // Invalidate lists to reflect the update
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.lists(),
      });

      // Invalidate gallery queries as images now have updated folder_ids
      queryClient.invalidateQueries({
        queryKey: ["gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });
    },
    onError: (error) => {
      console.error("Error removing images from folder:", error);
    },
  });
};

// DELETE: Delete a folder
export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteFolderResponse, AxiosError<{ error: string; errors?: string[] }>, string>({
    mutationFn: FOLDERS_API.DELETE_FOLDER,
    onSuccess: (data, folderId) => {
      console.log("Folder deleted successfully:", data);

      // Remove deleted folder from cache
      queryClient.removeQueries({
        queryKey: foldersQueryKeys.detail(folderId),
      });

      // Invalidate all lists to refetch without deleted folder
      queryClient.invalidateQueries({
        queryKey: foldersQueryKeys.lists(),
      });

      // Invalidate gallery queries as images may have updated folder_ids
      queryClient.invalidateQueries({
        queryKey: ["gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: usersQuerykeys.all,
      });
    },
    onError: (error) => {
      console.error("Error deleting folder:", error);
    },
  });
};
