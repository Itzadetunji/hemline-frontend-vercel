import $http from "../../../xhr";
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

const FOLDERS_ENDPOINTS = {
	getFolders: "/gallery/folders",
	getFolder: (id: string) => `/gallery/folders/${id}`,
	createFolder: "/gallery/folders",
	updateFolder: (id: string) => `/gallery/folders/${id}`,
	addImagesToFolder: (id: string) => `/gallery/folders/${id}/add_image`,
	setCoverImage: (id: string) => `/gallery/folders/${id}/set_cover_image`,
	removeImagesFromFolder: (id: string) =>
		`/gallery/folders/${id}/remove_images`,
	deleteFolder: (id: string) => `/gallery/folders/${id}`,
} as const;

export const FOLDERS_API = {
	GET_FOLDERS: async (params?: PaginationParams): Promise<GetFoldersResponse> =>
		await $http
			.get(FOLDERS_ENDPOINTS.getFolders, {
				params: {
					per_page: params?.per_page ?? 20,
					page: params?.page ?? 1,
				},
			})
			.then((res) => res.data),

	GET_FOLDER: async (
		id: string,
		params?: PaginationParams
	): Promise<GetFolderResponse> =>
		await $http
			.get(FOLDERS_ENDPOINTS.getFolder(id), {
				params: {
					per_page: params?.per_page ?? 20,
					page: params?.page ?? 1,
				},
			})
			.then((res) => res.data),

	CREATE_FOLDER: async (
		data: CreateFolderPayload
	): Promise<CreateFolderResponse> =>
		await $http
			.post(FOLDERS_ENDPOINTS.createFolder, data)
			.then((res) => res.data),

	UPDATE_FOLDER: async (
		id: string,
		data: UpdateFolderPayload
	): Promise<UpdateFolderResponse> =>
		await $http
			.patch(FOLDERS_ENDPOINTS.updateFolder(id), data)
			.then((res) => res.data),

	ADD_IMAGES_TO_FOLDER: async (
		id: string,
		data: AddImagesToFolderPayload
	): Promise<AddImagesToFolderResponse> =>
		await $http
			.post(FOLDERS_ENDPOINTS.addImagesToFolder(id), data)
			.then((res) => res.data),

	SET_FOLDER_COVER_IMAGE: async (
		id: string,
		data: SetFolderCoverImagePayload
	): Promise<SetFolderCoverImageResponse> =>
		await $http
			.patch(FOLDERS_ENDPOINTS.setCoverImage(id), data)
			.then((res) => res.data),

	REMOVE_IMAGES_FROM_FOLDER: async (
		id: string,
		data: RemoveImagesFromFolderPayload
	): Promise<RemoveImagesFromFolderResponse> =>
		await $http
			.delete(FOLDERS_ENDPOINTS.removeImagesFromFolder(id), { data })
			.then((res) => res.data),

	DELETE_FOLDER: async (id: string): Promise<DeleteFolderResponse> =>
		await $http
			.delete(FOLDERS_ENDPOINTS.deleteFolder(id))
			.then((res) => res.data),
};
