import { Icon } from "@iconify/react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TargetedSubmitEvent } from "preact";
import { useLocation } from "preact-iso";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HeroCarousel } from "./components/HeroCarousel";
import { type AddToWaitlistPayload, AddToWaitlistPayloadSchema } from "@/api/http/v1/waitlist.hooks";
import { useRef } from "preact/hooks";
import { LandingNavbar } from "@/components/LandingNavbar";

export const LandingPage = () => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const formMethods = useForm<AddToWaitlistPayload>({
    resolver: zodResolver(AddToWaitlistPayloadSchema),
  });

  const onSubmit: SubmitHandler<AddToWaitlistPayload> = (payload) => {
    location.route(`/sign-in?email=${encodeURIComponent(payload.email)}`);
  };

  const handleSubmit = (e: TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  console.log(formMethods.getValues(), formMethods.formState.errors);

  return (
    <main class="flex flex-1 flex-col bg-white pt-6 pb-10 md:min-h-[100dvh]">
      <LandingNavbar />
      <section class="flex flex-1 flex-col items-stretch justify-between gap-10 px-4 pt-10 md:px-14 md:pt-30 xl:min-h-dvh">
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
                <div class="flex items-center gap-2">
                  <Label class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3 focus-within:outline focus-within:outline-primary max-md:h-8">
                    <i className="size-4.5">
                      <Icon icon="fluent:mail-16-regular" fontSize="18" />
                    </i>
                    <Controller
                      name="email"
                      control={formMethods.control}
                      render={({ field }) =>
                        (
                          <input {...field} ref={emailInputRef} type="email" placeholder="hello@hemline.studio" class="flex-1 text-sm outline-none placeholder:text-grey-400" />
                        ) as any
                      }
                    />
                  </Label>

                  <Button class="h-10.5 w-fit gap-3 max-md:h-8" type="submit">
                    Sign In
                  </Button>
                </div>
                {formMethods.formState.errors.email && <p class="text-destructive text-xs">{formMethods.formState.errors.email.message}</p>}
              </div>
            </form>
          </div>
        </div>
      </section>
      <section class="mt-38.5 flex flex-col">
        <h1 class="!font-secondary px-4 pl-25 font-medium text-5xl leading-normal md:px-14">
          Your portfolio — finally <br /> organized.
        </h1>
        <div class="h-70 w-full bg-primary-50" />

        <div class="mt-12 flex flex-col items-center gap-8 text-center">
          <p class="max-w-[55ch] text-black text-xl">Upload photos, group them into collections, and share your work with clients through a clean, private link.</p>
          <Button asChild variant="secondary" class="h-11 gap-1 text-black">
            <a href="/sign-up">
              <span class="size-5">
                <Icon icon="iconoir:upload" className="size-5 text-black" />
              </span>
              <p>Start Uploading</p>
            </a>
          </Button>
        </div>
        <img src="/assets/landing-page/thread-scissors.svg" alt="Scissors and Thread" class="mt-12 px-14" />
      </section>
      <section class="px-4 md:px-14"></section>
    </main>
  );
};
