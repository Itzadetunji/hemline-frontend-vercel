import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Icon } from "@iconify/react";
import { JSX } from "preact";
import { useRef, useState } from "preact/hooks";

export const VerifyEmail = () => {
	return (
		<main class="flex flex-col h-[100dvh] px-4 py-4 gap-9.5 items-stretch">
			<div class="flex flex-col gap-10">
				<img
					src="/assets/logo.svg"
					class="size-9"
					alt="Brand Logo"
				/>
				<div class="flex flex-col gap-6">
					<h1 class="text-5xl leading-10.5">Verify your email</h1>
					<p class="text-grey-400 text-sm">
						We sent a login link to step***@srotimi.design. Click on the link to
						login into your account.
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<hr class="border-line-700 flex-1" /> <p>Or</p>
			</div>
			<form class="flex flex-col gap-6 flex-1">
				<Label class="flex flex-col gap-4 items-stretch">
					<div class="flex flex-col gap-4">
						<h2 class="text-2xl leading-0">Login with Otp</h2>
						<p class="text-sm font-medium text-grey-400">
							Enter the six digit code we sent with the link below.
						</p>
					</div>
					<div class="flex items-center gap-3 w-full px-4">
						<InputOTPGroup />
					</div>
				</Label>

				<div class="flex flex-col gap-3">
					<Button
						class="w-full gap-3"
						disabled
					>
						Verify
					</Button>
					<p class="text-sm self-center text-center text-grey-400">
						Didn't get the link? Click resend in 60s.{" "}
						<a
							href="/sign-in"
							class="underline text-black"
						>
							Resend
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

export const InputOTPGroup = () => {
	const length = 6;
	const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
	const inputs = useRef<(HTMLInputElement | null)[]>([]);

	// Handler when a user types a digit
	const handleChange = (value: string, index: number) => {
		if (!/^\d?$/.test(value)) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Move to next input if valid entry
		if (value && index < length - 1) {
			inputs.current[index + 1]?.focus();
		}
	};

	// Handler for pasting into any input
	const handlePaste = (
		event: JSX.TargetedClipboardEvent<HTMLInputElement>,
		index: number
	) => {
		const pasteValue =
			event.clipboardData?.getData("text").replace(/\D/g, "") || "";
		if (!pasteValue) return event.preventDefault();

		const pasteArray = pasteValue.split("").slice(0, length - index);
		const newOtp = [...otp];
		pasteArray.forEach((char: string, i: number) => {
			newOtp[index + i] = char;
		});
		setOtp(newOtp);

		// Focus last filled or next input
		const nextIndex = Math.min(index + pasteArray.length - 1, length - 1);
		setTimeout(() => inputs.current[nextIndex]?.focus(), 0);
		event.preventDefault();
	};

	// Handler for delete/backspace
	const handleKeyDown = (
		event: JSX.TargetedKeyboardEvent<HTMLInputElement>,
		index: number
	) => {
		if (event.key === "Backspace" && !otp[index] && index > 0) {
			inputs.current[index - 1]?.focus();
		}
	};

	return (
		<>
			{otp.map((value, i) => (
				<input
					key={i}
					ref={(el) => {
						inputs.current[i] = el;
					}}
					type="text"
					inputMode="numeric"
					maxLength={1}
					value={value}
					onChange={(e) =>
						handleChange((e.target as HTMLInputElement).value, i)
					}
					onPaste={(e) => handlePaste(e, i)}
					onKeyDown={(e) => handleKeyDown(e, i)}
					class="text-sm placeholder:text-grey-400 flex-1 border-line-700 border text-center w-full h-10"
				/>
			))}
		</>
	);
};
