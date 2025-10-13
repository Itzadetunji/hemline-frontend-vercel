import { useMutation } from "@tanstack/react-query";
import { APIVersion1PatchUserProfile } from "./users.api";

export const useJoinWaitlist = () => {
	return useMutation({
		mutationFn: APIVersion1PatchUserProfile,
	});
};
