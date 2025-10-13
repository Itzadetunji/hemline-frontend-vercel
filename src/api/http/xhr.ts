import { CONFIGS } from "@/configs";
import axios, { type AxiosInstance } from "axios";

const baseURL = CONFIGS.URL.API_BASE_URL;

// Create new axios instance
const $http: AxiosInstance = axios.create({
	baseURL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

export default $http;
