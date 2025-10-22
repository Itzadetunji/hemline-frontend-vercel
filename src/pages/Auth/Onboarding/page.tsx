import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { JSX } from "preact";
import { useLocation } from "preact-iso";
import { type Dispatch, type StateUpdater, useLayoutEffect, useState } from "preact/hooks";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";

import { useUpdateUserProfile } from "@/api/http/v1/users/users.hooks";
import { type OnboardingFormData, OnboardingFormSchema, Profession, SkillChoices, ThemeChoices, type ThemeType } from "@/api/http/v1/users/users.types";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { headerContentSignal } from "@/layout/Header";

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const updateUserProfileMutation = useUpdateUserProfile();

  const formMethods = useForm<OnboardingFormData>({
    resolver: zodResolver(OnboardingFormSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      profession: "Tailors / Dressmakers",
      business_name: "",
      business_address: "",
      skills: [],
      theme: "system" as const,
      has_onboarded: true,
    },
    mode: "onChange",
  });

  const onSubmit = async (payload: OnboardingFormData) => {
    await updateUserProfileMutation.mutateAsync(payload, {
      onSuccess: () => {
        // Store theme preference locally or in user store
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", payload.theme);
        }
        // Redirect to home after successful onboarding
        location.route("/");
      },
      onError: (error) => {
        console.error("Onboarding error:", error);
      },
    });
  };

  const handleSubmit = (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  useLayoutEffect(() => {
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: false,
    };
  }, []);

  return (
    <FormProvider {...formMethods}>
      {
        (
          <form onSubmit={handleSubmit}>
            <main class="flex h-[100dvh] flex-col items-stretch gap-8 px-4 py-4">
              <div class="flex items-center justify-between gap-4">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)}>
                    <Icon icon="solar:arrow-left-linear" fontSize={24} />
                  </button>
                )}

                <div class="flex h-1.5 flex-1 bg-secondary">
                  <div
                    class="bg-primary duration-200 ease-in-out"
                    style={{
                      width: `${(step / 3) * 100}%`,
                    }}
                  />
                </div>

                <p>
                  {step} <span class="text-grey-400 text-sm">/3</span>
                </p>
              </div>
              {step === 1 && <OnboardingStep1 step={step} setStep={setStep} />}
              {step === 2 && <OnboardingStep2 step={step} setStep={setStep} />}
              {step === 3 && <OnboardingStep3 step={step} setStep={setStep} isSubmitting={updateUserProfileMutation.isPending} />}
            </main>
          </form>
        ) as any
      }
    </FormProvider>
  );
};

interface OnboardingStepProps {
  step: number;
  setStep: Dispatch<StateUpdater<number>>;
  isSubmitting?: boolean;
}

const OnboardingStep1 = (props: OnboardingStepProps) => {
  const {
    control,
    formState: { errors },
    trigger,
  } = useFormContext<OnboardingFormData>();

  const handleNext = async () => {
    // Validate only step 1 fields
    const isValid = await trigger(["first_name", "last_name", "profession", "business_name", "business_address"]);
    if (isValid) {
      props.setStep(2);
    }
  };

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div class="flex flex-col items-stretch gap-10">
        <div class="flex flex-col gap-6">
          <h1 class="text-5xl leading-10.5">Set up your profile</h1>
          <p class="text-grey-400 text-sm">Welcome to Tailor, complete your profile creation by answering these few questions.</p>
        </div>
      </div>
      <div class="flex w-full flex-1 flex-col gap-6">
        {/* Full Name - Split into first and last */}
        <div class="flex w-full items-start justify-between gap-4">
          <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
            <p class="font-medium text-sm leading-0">First name</p>
            <Controller
              name="first_name"
              control={control}
              render={({ field }) =>
                (
                  <div class="flex flex-col gap-2">
                    <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                      <Icon icon="hugeicons:user-02" fontSize="18" className="flex-shrink-0" />
                      <input {...field} placeholder="John" class="min-w-0 flex-1 text-sm placeholder:text-grey-400" />
                    </div>
                    {errors.first_name && <p class="text-red-500 text-xs">{errors.first_name.message}</p>}
                  </div>
                ) as any
              }
            />
          </Label>
          <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
            <p class="font-medium text-sm leading-0">Last name</p>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) =>
                (
                  <div class="flex flex-col gap-2">
                    <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                      <Icon icon="hugeicons:user-02" fontSize="18" className="flex-shrink-0" />
                      <input {...field} placeholder="Doe" class="min-w-0 flex-1 text-sm placeholder:text-grey-400" />
                    </div>
                    {errors.last_name && <p class="text-red-500 text-xs">{errors.last_name.message}</p>}
                  </div>
                ) as any
              }
            />
          </Label>
        </div>

        {/* Profession */}
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Profession</p>
          <Controller
            name="profession"
            control={control}
            render={({ field }) =>
              (
                <div class="flex flex-col gap-2">
                  <Select
                    options={Profession.map((prof) => ({
                      label: prof,
                      value: prof,
                    }))}
                    value={field.value ? [field.value] : []}
                    onChange={(selected) => field.onChange(selected[0] || "")}
                    placeholder="Select your profession"
                    icon="material-symbols-light:work-outline"
                    maxItems={1}
                  />
                  {errors.profession && <p class="text-red-500 text-xs">{errors.profession.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>

        {/* Business Name */}
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Business name</p>
          <Controller
            name="business_name"
            control={control}
            render={({ field }) =>
              (
                <div class="flex flex-col gap-2">
                  <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                    <Icon icon="material-symbols-light:add-business-outline-rounded" fontSize="18" />
                    <input {...field} placeholder="John's Tailoring" class="flex-1 text-sm placeholder:text-grey-400" />
                  </div>
                  {errors.business_name && <p class="text-red-500 text-xs">{errors.business_name.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>

        {/* Business Address */}
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Business address</p>
          <Controller
            name="business_address"
            control={control}
            render={({ field }) =>
              (
                <div class="flex flex-col gap-2">
                  <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                    <Icon icon="hugeicons:maps-location-02" fontSize="18" />
                    <input {...field} placeholder="123 Main St, City, State" class="flex-1 text-sm placeholder:text-grey-400" />
                  </div>
                  {errors.business_address && <p class="text-red-500 text-xs">{errors.business_address.message}</p>}
                </div>
              ) as any
            }
          />
        </Label>
      </div>
      <Button class="w-full gap-3" type="button" onClick={handleNext}>
        Continue
      </Button>
    </div>
  );
};

const OnboardingStep2 = (props: OnboardingStepProps) => {
  const {
    control,
    formState: { errors },
    trigger,
  } = useFormContext<OnboardingFormData>();

  const handleNext = async () => {
    // Validate skills field
    const isValid = await trigger(["skills"]);
    if (isValid) {
      props.setStep(3);
    }
  };

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div class="flex flex-col items-stretch gap-10">
        <div class="flex flex-col gap-6">
          <h1 class="text-5xl leading-10.5">What are your skills</h1>
          <p class="text-grey-400 text-sm">Select as many that relates to you.</p>
        </div>
      </div>
      <div class="flex-1">
        <Controller
          name="skills"
          control={control}
          render={({ field }) =>
            (
              <div class="flex flex-col gap-4">
                <CheckboxGroup options={SkillChoices as any} value={field.value} onChange={field.onChange} />
                {errors.skills && <p class="text-red-500 text-xs">{errors.skills.message}</p>}
              </div>
            ) as any
          }
        />
      </div>
      <Button class="w-full gap-3" type="button" onClick={handleNext}>
        Continue
      </Button>
    </div>
  );
};

const OnboardingStep3 = (props: OnboardingStepProps) => {
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();
  console.log(getValues());
  return (
    <div class="flex flex-1 flex-col gap-10">
      <div class="flex flex-col items-stretch gap-10">
        <div class="flex flex-col gap-6">
          <h1 class="text-5xl leading-10.5">Select your default appearance</h1>
          <p class="text-grey-400 text-sm">Choose your preferred look to get started.</p>
        </div>
      </div>
      <div class="flex-1">
        <Controller
          name="theme"
          control={control}
          render={({ field }) =>
            (
              <ul class="flex items-center gap-6">
                <RadioGroup
                  options={ThemeChoices as any}
                  value={field.value}
                  onChange={(selected) => field.onChange(selected)}
                  className="flex gap-4"
                  optionClassName="flex-col gap-2 items-stretch p-0 h-auto border-0"
                  selectedClassName=""
                  unselectedClassName=""
                  name="theme-selector"
                  renderOption={(color: ThemeType, isSelected) => (
                    <>
                      <figure
                        class={cn("size-22 cursor-pointer transition-all", {
                          "border border-line-500 bg-white": color === "light",
                          "bg-dark": color === "dark",
                          "bg-secondary-500": color === "system",
                          "ring-2 ring-primary ring-offset-2": isSelected,
                        })}
                      />
                      <p class="text-center font-medium text-grey-400 text-sm capitalize">
                        {color === "system" ? "Automatic" : color} {color !== "system" && "mode"}
                      </p>
                    </>
                  )}
                />
              </ul>
            ) as any
          }
        />
        {errors.theme && <p class="mt-2 text-red-500 text-xs">{errors.theme.message}</p>}
      </div>
      <Button class="w-full gap-3" type="submit" disabled={props.isSubmitting}>
        {props.isSubmitting ? "Submitting..." : "Complete Setup"}
      </Button>
    </div>
  );
};
