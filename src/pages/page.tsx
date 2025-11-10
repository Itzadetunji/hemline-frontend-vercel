import { Icon } from "@iconify/react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TargetedSubmitEvent } from "preact";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HeroCarousel } from "./components/HeroCarousel";
import { useWaitlist } from "@/api/http/v1/waitlist.hooks";
import { type AddToWaitlistPayload, AddToWaitlistPayloadSchema } from "@/api/http/v1/waitlist.hooks";
import { useRef } from "preact/hooks";

export const LandingPage = () => {
  const emailInputRef = useRef<HTMLInputElement>(null);

  const formMethods = useForm<AddToWaitlistPayload>({
    resolver: zodResolver(AddToWaitlistPayloadSchema),
  });

  const waitlistMutation = useWaitlist();

  const onSubmit: SubmitHandler<AddToWaitlistPayload> = async (payload) => {
    try {
      await waitlistMutation.mutateAsync(payload);
      formMethods.reset({
        email: "",
      });
      emailInputRef.current?.blur();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "An error occurred while joining the waitlist.");
    }
  };

  const handleSubmit = (e: TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  return (
    <main class="flex flex-1 flex-col bg-white px-4 pt-6 pb-10 md:min-h-[100dvh] md:px-14">
      <nav class="flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <img src="/assets/brand/logo.svg" alt="Logo" class="size-9" />
          <h1 class="text-2xl text-black">HEMLINE</h1>
        </div>
        {/* <ul class="flex items-center gap-3">
          <Button asChild class="border-line" variant="outline">
            <a href="/sign-in">Log in</a>
          </Button>
          <Button asChild class="" variant="secondary">
            <a href="/sign-up">Sign Up</a>
          </Button>
        </ul> */}
      </nav>
      <div class="flex flex-1 flex-col items-stretch justify-between gap-10 pt-10 md:pt-30">
        <div class="flex flex-[0.7] items-stretch justify-between gap-10 font-light text-4xl max-md:flex-col md:text-5xl">
          <div class="flex flex-1 flex-col items-start justify-between">
            <p>
              Everything you design <br /> and manage...
            </p>
            <p class="hidden md:block">
              in <span class="!font-instrument italic">one place.</span>
            </p>
          </div>
          <HeroCarousel />
          <p class="md:hidden">
            in <span class="!font-instrument italic">one place.</span>
          </p>
        </div>
        <div class="flex flex-[0.3] items-center justify-between gap-10 max-md:flex-col">
          <img src="/assets/hero-section/features-1.svg" alt="Features" class="min-h-58 min-w-58 max-md:hidden max-md:self-start" />
          <img src="/assets/hero-section/features-2.svg" alt="Features" class="max-h-58 w-full md:hidden" />
          <div class="flex flex-1 flex-col items-end justify-center gap-8 self-stretch border-line border-t border-l pt-10 pb-5.5 text-xl">
            <p class="px-10 max-sm:px-4 max-md:text-right">
              Save measurements, organize photos, and <br class="max-md:hidden" /> share collections — all in one simple space <br /> built for fashion designers.
            </p>
            <form class="flex flex-wrap items-center justify-end gap-2" onSubmit={handleSubmit}>
              <div class="flex flex-col gap-1">
                <Label class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3 max-md:h-8">
                  <i className="size-4.5">
                    <Icon icon="fluent:mail-16-regular" fontSize="18" />
                  </i>
                  <Controller
                    name="email"
                    control={formMethods.control}
                    render={({ field }) =>
                      (<input {...field} ref={emailInputRef} type="email" placeholder="hello@hemline.studio" class="flex-1 text-sm placeholder:text-grey-400" />) as any
                    }
                  />
                </Label>
                {formMethods.formState.errors.email && <p class="text-red-500 text-xs">{formMethods.formState.errors.email.message}</p>}
              </div>

              <Button class="h-10.5 w-fit gap-3 max-md:h-8" type="submit" disabled={waitlistMutation.isPending}>
                <p>Join Waitlist</p>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
