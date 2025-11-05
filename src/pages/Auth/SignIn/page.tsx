import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { TargetedSubmitEvent } from "preact";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type RequestMagicLinkPayload, RequestMagicLinkPayloadSchema } from "@/api/http/v1/users/users.types";
import { useGetMagicLink } from "@/api/http/v1/users/users.hooks";
import { emailSignal, setEmail } from "@/stores/authStore";
import { VerifyEmail } from "../components/VerifyEmail";
import toast from "react-hot-toast";

export const SignIn = () => {
  const formMethods = useForm<RequestMagicLinkPayload>({
    resolver: zodResolver(RequestMagicLinkPayloadSchema),
  });

  const getMagicLinkMutation = useGetMagicLink();

  const onSubmit: SubmitHandler<RequestMagicLinkPayload> = async (payload) => {
    await getMagicLinkMutation.mutateAsync(payload, {
      onSuccess: () => {
        setEmail(payload.email);
      },
      onError: (error) => {
        toast.error(error.response?.data.errors?.[0] ?? "An error occurred while requesting the magic link.");
      },
    });
  };

  const handleSubmit = (e: TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };
  console.log(formMethods.getValues());
  if (emailSignal.value.length) return <VerifyEmail />;

  return (
    <main class="flex h-[100dvh] flex-col items-stretch gap-6 px-4 py-4">
      <div class="flex flex-col gap-10">
        <img src="/assets/brand/logo.svg" class="size-9" alt="Brand Logo" />
        <div class="flex flex-col gap-6">
          <h1 class="text-5xl leading-10.5">Welcome back</h1>
          <p class="text-grey-400 text-sm">Sign in to see your saved works and measurements.</p>
        </div>
      </div>
      <form class="flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
        <Label class="flex flex-col items-stretch gap-4">
          <p class="font-medium text-sm leading-0">Email</p>
          <div class="flex flex-col gap-1.5">
            <div class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3">
              <i className="size-4.5">
                <Icon icon="fluent:mail-16-regular" fontSize="18" />
              </i>
              <Controller
                name="email"
                control={formMethods.control}
                render={({ field }) => (<input {...field} type="email" placeholder="hello@hemline.studio" class="flex-1 text-sm placeholder:text-grey-400" />) as any}
              />
            </div>
            {formMethods.formState.errors.email && <p class="text-red-500 text-xs">{formMethods.formState.errors.email.message}</p>}
          </div>
        </Label>

        <div class="flex flex-col gap-3">
          <Button class="w-full gap-3" type="submit" disabled={!formMethods.formState.isValid || getMagicLinkMutation.isPending}>
            <Icon icon="solar:arrow-right-linear" fontSize="14" />
            <p>Join with magic link</p>
          </Button>
          <p class="self-center text-center text-grey-400 text-sm">
            Don't have an account?{" "}
            <a href="/sign-up" class="text-black underline">
              Create an account
            </a>
          </p>
        </div>
      </form>
      <p class="text-center text-grey-400 text-sm">
        By continuing, you agree to our <br /> Terms of Service and Privacy Policy.
      </p>
    </main>
  );
};
