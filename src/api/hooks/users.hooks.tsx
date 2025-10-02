import { useMutation } from "@tanstack/react-query";
import { APIVersion1PatchUserProfile } from "../http/v1/users.api";

export const useJoinWaitlist = () => {
	return useMutation({
		mutationFn: APIVersion1PatchUserProfile,
	});
};
