import type { AxiosRequestConfig } from "axios";
import $http from "../../xhr";
import type {
  DeleteImagesPayload,
  DeleteImagesResponse,
  GetGalleriesResponse,
  GetGalleryImageResponse,
  PaginationParams,
  UpdateGalleryImagePayload,
  UpdateGalleryImageResponse,
  UploadImagesResponse,
} from "./gallery.types";

const GALLERY_ENDPOINTS = {
  getGalleries: "/gallery/galleries",
  getGalleryImage: (id: string) => `/gallery/galleries/${id}`,
  uploadImages: "/gallery/galleries/upload",
  updateGalleryImage: (id: string) => `/gallery/galleries/${id}`,
  deleteImages: "/gallery/galleries",
} as const;

export const GALLERY_API = {
  GET_GALLERIES: async (params?: PaginationParams): Promise<GetGalleriesResponse> =>
    await $http
      .get(GALLERY_ENDPOINTS.getGalleries, {
        params: {
          per_page: params?.per_page ?? 20,
          page: params?.page ?? 1,
        },
      })
      .then((res) => res.data),

  GET_GALLERY_IMAGE: async (id: string): Promise<GetGalleryImageResponse> => await $http.get(GALLERY_ENDPOINTS.getGalleryImage(id)).then((res) => res.data),

  UPLOAD_IMAGES: async (formData: FormData, config?: AxiosRequestConfig): Promise<UploadImagesResponse> =>
    await $http
      .post(GALLERY_ENDPOINTS.uploadImages, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        ...config,
      })
      .then((res) => res.data),

  UPDATE_GALLERY_IMAGE: async (id: string, data: UpdateGalleryImagePayload): Promise<UpdateGalleryImageResponse> =>
    await $http.patch(GALLERY_ENDPOINTS.updateGalleryImage(id), data).then((res) => res.data),

  DELETE_IMAGES: async (data: DeleteImagesPayload): Promise<DeleteImagesResponse> => await $http.delete(GALLERY_ENDPOINTS.deleteImages, { data }).then((res) => res.data),
};
