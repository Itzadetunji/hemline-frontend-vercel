import { Icon } from "@iconify/react";
import { type Dispatch, type StateUpdater, useState } from "preact/hooks";

import {
	SkillChoices,
	type SkillChoicesType,
} from "@/api/http/v1/users/users.types";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Label } from "@/components/ui/label";
import { cn } from "../../../lib/utils";

export const Onboarding = () => {
	const [step, setStep] = useState(1);

	return (
		<main class="flex flex-col h-[100dvh] px-4 py-4 gap-8 items-stretch">
			<div class="flex justify-between items-center gap-4">
				{step > 1 && (
					<button
						type="button"
						onClick={() => setStep(step - 1)}
					>
						<Icon
							icon="solar:arrow-left-linear"
							fontSize={24}
						/>
					</button>
				)}

				<div class="flex-1 bg-secondary flex h-1.5">
					<div
						class="bg-primary"
						style={{
							width: `${(step / 3) * 100}%`,
						}}
					/>
				</div>

				<p>
					{step} <span class="text-grey-400 text-sm">/3</span>
				</p>
			</div>
			{step === 1 && (
				<OnboardingStep1
					step={step}
					setStep={setStep}
				/>
			)}
			{step === 2 && (
				<OnboardingStep2
					step={step}
					setStep={setStep}
				/>
			)}
			{step === 3 && (
				<OnboardingStep3
					step={step}
					setStep={setStep}
				/>
			)}
		</main>
	);
};

interface OnboardingStepProps {
	step: number;
	setStep: Dispatch<StateUpdater<number>>;
}

const OnboardingStep1 = (props: OnboardingStepProps) => {
	return (
		<div class="flex flex-col flex-1 gap-10">
			<div class="flex flex-col gap-10 items-stretch">
				<div class="flex flex-col gap-6">
					<h1 class="text-5xl leading-10.5">Set up your profile</h1>
					<p class="text-grey-400 text-sm">
						Welcome to Tailor, complete your profile creation by answering these
						few questions.
					</p>
				</div>
			</div>
			<form class="flex flex-col gap-6 flex-1">
				<Label class="flex flex-col gap-4 items-stretch">
					<p class="text-sm font-medium leading-0">Full name</p>
					<div class="flex items-center gap-2 border-line-700 border h-10.5 px-3">
						<Icon
							icon="hugeicons:user-02"
							fontSize="18"
						/>
						<input
							placeholder="John Doe"
							class="text-sm placeholder:text-grey-400 flex-1"
						/>
					</div>
				</Label>
				<Label class="flex flex-col gap-4 items-stretch">
					<p class="text-sm font-medium leading-0">Profession</p>
					<div class="flex items-center gap-2 border-line-700 border h-10.5 px-3">
						<Icon
							icon="material-symbols-light:work-outline"
							fontSize="18"
						/>
						<input
							placeholder="fashion designer"
							class="text-sm placeholder:text-grey-400 flex-1"
						/>
					</div>
				</Label>
				<Label class="flex flex-col gap-4 items-stretch">
					<p class="text-sm font-medium leading-0">Business name</p>
					<div class="flex items-center gap-2 border-line-700 border h-10.5 px-3">
						<Icon
							icon="material-symbols-light:add-business-outline-rounded"
							fontSize="18"
						/>
						<input
							placeholder="srotimi"
							class="text-sm placeholder:text-grey-400 flex-1"
						/>
					</div>
				</Label>
				<Label class="flex flex-col gap-4 items-stretch">
					<p class="text-sm font-medium leading-0">Business address</p>
					<div class="flex items-center gap-2 border-line-700 border h-10.5 px-3">
						<Icon
							icon="hugeicons:maps-location-02"
							fontSize="18"
						/>
						<input
							placeholder="lagos"
							class="text-sm placeholder:text-grey-400 flex-1"
						/>
					</div>
				</Label>
			</form>
			<Button
				class="w-full gap-3"
				type="button"
				onClick={() => {
					props.setStep(2);
				}}
			>
				Continue
			</Button>
		</div>
	);
};

const OnboardingStep2 = (props: OnboardingStepProps) => {
	const [selected, setSelected] = useState<SkillChoicesType[]>([]);

	return (
		<div class="flex flex-col flex-1 gap-10">
			<div class="flex flex-col gap-10 items-stretch">
				<div class="flex flex-col gap-6">
					<h1 class="text-5xl leading-10.5">What are your skills</h1>
					<p class="text-grey-400 text-sm">
						Select as many that relates to you.
					</p>
				</div>
			</div>
			<form class="flex-1">
				<CheckboxGroup
					options={SkillChoices}
					value={selected}
					onChange={setSelected}
				/>
			</form>
			<Button
				class="w-full gap-3"
				type="button"
				onClick={() => {
					props.setStep(3);
				}}
			>
				Continue
			</Button>
		</div>
	);
};

export type ColorType = "light" | "dark" | "system";

const colors: ColorType[] = ["light", "dark", "system"];

const OnboardingStep3 = (props: OnboardingStepProps) => {
	const [selected, setSelected] = useState<ColorType[]>([]);

	return (
		<div class="flex flex-col flex-1 gap-10">
			<div class="flex flex-col gap-10 items-stretch">
				<div class="flex flex-col gap-6">
					<h1 class="text-5xl leading-10.5">Select your default appearance</h1>
					<p class="text-grey-400 text-sm">
						Choose your preferred look to get started.
					</p>
				</div>
			</div>
			<form class="flex-1">
				<ul class="flex items-center gap-6">
					<CheckboxGroup
						options={colors}
						value={selected}
						onChange={setSelected}
						maxSelected={1}
						className="flex gap-4"
						optionClassName="flex-col gap-2 items-center p-0 h-auto border-0"
						selectedOutline="ring-2 ring-primary ring-offset-2"
						showCheckbox={true}
						selectedClassName=""
						unselectedClassName=""
						renderOption={(color, isSelected) => (
							<>
								<figure
									class={cn("size-22 transition-all", {
										"border border-line-500 bg-white": color === "light",
										"bg-dark": color === "dark",
										"bg-secondary-500": color === "system",
										"ring-2 ring-primary ring-offset-2": isSelected,
									})}
								/>
								<p class="capitalize text-sm text-center text-grey-400 font-medium">
									{color === "system" ? "Automatic" : color}{" "}
									{color !== "system" && "mode"}
								</p>
							</>
						)}
					/>
				</ul>
			</form>
			<Button
				class="w-full gap-3"
				type="button"
				onClick={() => {
					props.setStep(3);
				}}
			>
				Continue
			</Button>
		</div>
	);
};
