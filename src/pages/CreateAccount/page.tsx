import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Icon } from "@iconify/react";

export const CreateAccount = () => {
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
			<form class="flex flex-col gap-6 flex-1">
				<label class="flex flex-col gap-4">
					<p class="text-sm font-medium">Email</p>
					<div class="flex items-center gap-3.5 border-line-700 border h-10.5 px-3">
						<Icon
							icon="fluent:mail-16-regular"
							fontSize="18"
						/>
						<input
							placeholder="john@example.com"
							class="text-sm placeholder:text-grey-400 flex-1"
						/>
					</div>
				</label>

				<div class="flex flex-col gap-3">
					<Button
						class="w-full gap-3"
						disabled
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
