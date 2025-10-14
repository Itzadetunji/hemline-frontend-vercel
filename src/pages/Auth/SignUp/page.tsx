import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { JSX } from "preact";

import { Button } from "@/components/button";
import { Label } from "@/components/label";
import {
	type RequestMagicLinkPayload,
	RequestMagicLinkPayloadSchema,
} from "@/api/http/v1/users/users.types";
import { useGetMagicLink } from "@/api/http/v1/users/users.hooks";
import { emailSignal, setEmail } from "@/stores/authStore";
import { VerifyEmail } from "../components/VerifyEmail";

export const SignUp = () => {
	const formMethods = useForm<RequestMagicLinkPayload>({
		resolver: zodResolver(RequestMagicLinkPayloadSchema),
	});

	const getMagicLinkMutation = useGetMagicLink();

	const onSubmit: SubmitHandler<RequestMagicLinkPayload> = async (payload) => {
		await getMagicLinkMutation.mutateAsync(payload, {
			onSuccess: () => {
				setEmail(payload.email);
			},
		});
	};

	const handleSubmit = (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		formMethods.handleSubmit(onSubmit)(e as any);
	};

	if (emailSignal.value.length) return <VerifyEmail />;
	// console.log(formMethods.formState.);
	return (
		<main class="flex flex-col h-[100dvh] px-4 py-4 gap-6 items-stretch">
			<div class="flex flex-col gap-10">
				<img
					src="/assets/logo.svg"
					class="size-9"
					alt="Brand Logo"
				/>
				<div class="flex flex-col gap-6">
					<h1 class="text-5xl leading-10.5">Create an account on Tailor</h1>
					<p class="text-grey-400 text-sm">
						Upload your work, share with clients and keep clients measurement
						organized.
					</p>
				</div>
			</div>
			<form
				class="flex flex-col gap-6 flex-1"
				onSubmit={handleSubmit}
			>
				<Label class="flex flex-col gap-4 items-stretch">
					<p class="text-sm font-medium leading-0">Email</p>
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center gap-3.5 border-line-700 border h-10.5 px-3">
							<Icon
								icon="fluent:mail-16-regular"
								fontSize="18"
							/>
							<Controller
								name="email"
								control={formMethods.control}
								render={({ field }) =>
									(
										<input
											{...field}
											type="email"
											placeholder="hello@hemline.app"
											class="text-sm placeholder:text-grey-400 flex-1"
										/>
									) as any
								}
							/>
						</div>
						{formMethods.formState.errors.email && (
							<p class="text-xs text-red-500">
								{formMethods.formState.errors.email.message}
							</p>
						)}
					</div>
				</Label>

				<div class="flex flex-col gap-3">
					<Button
						class="w-full gap-3"
						disabled={
							!formMethods.formState.isValid || getMagicLinkMutation.isPending
						}
					>
						<Icon
							icon="solar:arrow-right-linear"
							fontSize="14"
						/>
						<p>Join with magic link</p>
					</Button>
					<p class="text-sm self-center text-center text-grey-400">
						Have an account?{" "}
						<a
							href="/sign-in"
							class="underline text-black"
						>
							Sign in to account
						</a>
					</p>
				</div>
			</form>
			<p class="text-center text-grey-400 text-sm">
				By continuing, you agree to our <br /> Terms of Service and Privacy
				Policy.
			</p>
		</main>
	);
};
