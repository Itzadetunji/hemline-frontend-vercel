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
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    <main class="flex flex-1 flex-col bg-white pt-6 md:min-h-[100dvh]">
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
      <section class="mt-16 flex flex-col items-center px-4 md:px-14">
        <div class="flex w-fit flex-col items-center border-b border-b-line px-15 pb-10 text-center">
          <h1 class="font-medium font-secondary! text-5xl">
            Manage every client in <br /> one place.
          </h1>
          <img src="/assets/landing-page/one-place-clients.png" alt="All Clients" class="mt-12 max-w-sm" />
          <p class="-mt-8 text-xl">
            Keep client details, measurements, and orders beautifully <br />
            organized — so you can focus on creating, not remembering.
          </p>
        </div>
        <ul class="mt-18 flex items-stretch gap-8 max-sm:flex-col">
          {clientFeatures.map((feature) => (
            <li class="flex flex-1 flex-col items-start gap-4 border p-6 text-left" key={feature.title}>
              <figure>
                <img src={feature.src} alt="" />
                <figcaption class="flex flex-col gap-3.5">
                  <h2 class="font-medium font-secondary! text-lg">{feature.title}</h2>
                  <p class="text-base">{feature.description}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p class="mt-18 text-3xl text-grey">
          <span class="text-black">Add and</span> manage each client's measurements in one place. Record upper and lower body details, switch between inches or centimeters, and
          create custom fields when needed. Everything stays organized and easy to find whenever you need it.
        </p>
      </section>
      <img src="/assets/landing-page/fabrics.webp" class="mt-20 max-h-108 object-cover" alt="" />
      <picture>
        <source media="(min-width: 768px)" srcSet="/assets/landing-page/collection-pin-1.png" />
        <img src="/assets/landing-page/collection-pin-2.png" class="mt-20 max-h-108 object-cover" alt="" />
      </picture>

      <section class="mt-22 flex w-full flex-col items-center">
        <h1 class="text-center font-medium font-secondary! text-5xl leading-[1.25]">
          Organize your <br /> designs your way
        </h1>

        <div class="mt-12 flex flex-col items-center gap-8">
          <p class="text-center">
            Create folders, add images, and manage everything with the same <br /> simplicity as your photo gallery.
          </p>
          <Button class="h-10.5 w-fit gap-1 max-md:h-8" type="submit">
            <i class="grid size-5 place-content-center">
              <Icon icon="iconoir:arrow-right" className="h-5 w-5 text-white" />
            </i>
            <p class="text-white">Join now</p>
          </Button>
        </div>
        <div class="mt-10 grid w-full max-w-6xl grid-cols-24 gap-2.5 max-md:flex max-md:flex-col">
          {organizeFeatures.map((feature, idx) => (
            <div
              key={feature.title}
              class={cn("col-span-8 flex h-66 flex-col border border-line py-6", {
                "col-span-16": idx === 1 || idx === 2,
              })}
            >
              <i class="pl-6">
                <Icon icon={feature.icon} className="size-8 text-primary" />
              </i>
              <div class="flex flex-1 flex-col justify-end gap-4 pr-6 pl-4">
                <p class="font-medium text-lg">{feature.title}</p>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section class="mt-33.5 flex w-full flex-col items-center gap-18">
        <div class="flex flex-col gap-6">
          <h1 class="text-center font-medium font-secondary! text-5xl leading-[1.25]">FAQs</h1>
          <p class="text-center">Got any question? We've answered it for you</p>
        </div>
        <Accordion type="single" collapsible className="flex w-full max-w-4xl flex-col gap-12">
          {
            faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="group flex flex-col gap-4 border-none">
                {
                  (
                    <div className="flex items-start gap-4">
                      <i className="grid size-8 place-content-center pt-0.5">
                        <Icon icon="si:add-duotone" className="size-8 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                      </i>
                      <div className="flex flex-1 flex-col">
                        <AccordionTrigger className="rounded-none p-0 text-left text-2xl hover:no-underline" showIcon={false}>
                          {faq.question}
                        </AccordionTrigger>
                        <div class="w-full border-b border-b-line pb-8">
                          <AccordionContent className="pt-6 text-grey text-lg">{faq.answer}</AccordionContent>
                        </div>
                      </div>
                    </div>
                  ) as any
                }
              </AccordionItem>
            )) as any
          }

          <div class="flex flex-col gap-5">
            <p class="text-xl">Still have questions? We're here to help.</p>
            <Button asChild variant="secondary" class="w-fit">
              <a href="/support">
                <i>
                  <Icon icon="fluent:mail-20-regular" className="text-grey" />
                </i>
                <p class="text-grey">Contact Support</p>
              </a>
            </Button>
          </div>
        </Accordion>
      </section>
      <footer class="flex flex-1 flex-col items-stretch justify-between gap-10 bg-primary px-4 pt-14 pb-20 md:px-14 md:pt-30 xl:min-h-[calc(100dvh-16rem)]">
        <h1 class="!font-secondary text-5xl text-white">Workflow Made Simple</h1>
      </footer>
    </main>
  );
};

const clientFeatures = [
  {
    src: "/assets/landing-page/manage/manage-1.png",
    title: "Client Info",
    description: "Keep client details, notes, and project history all in one space.",
  },
  { src: "/assets/landing-page/manage/manage-2.png", title: "Measurements", description: "Save every measurement digitally — upper body, lower body, or custom fields." },
  { src: "/assets/landing-page/manage/manage-3.png", title: "Orders & Deliverables", description: "Track what's in progress, completed, or delivered, so you never lose track." },
];

const organizeFeatures = [
  {
    icon: "bi:folder",
    title: "Create and organize",
    description: "Make folders for each client, project, or collection in seconds.",
  },
  {
    icon: "material-symbols-light:add-business-outline-rounded",
    title: "Move with ease",
    description: "Drag and drop images between folders to keep everything in order.",
  },
  {
    icon: "lineicons:share-1",
    title: "Share collections",
    description: "Send a folder link to clients so they can view your work securely.",
  },
  {
    icon: "f7:square-stack-3d-down-right",
    title: "Manage your space",
    description: "Rename, delete, or recover folders anytime to stay organized.",
  },
];

const faqs = [
  {
    question: "Can I use it on my phone?",
    answer: "Yes. The workspace is built mobile-first, so you can manage clients, upload designs, and share links directly from your phone.",
  },
  {
    question: "How secure is my client information?",
    answer: "All client data, measurements, and photos are stored securely. Only you can access your workspace unless you choose to share a folder or gallery.",
  },
  {
    question: "Can I share my work with clients?",
    answer: "Yes. You can share a folder or gallery link with any client. They can view the designs but can’t edit or download anything.",
  },
  {
    question: "Can I create custom measurement fields?",
    answer: "Absolutely. You can add your own measurement types for clients who need unique or specific fitting details.",
  },
  {
    question: "Do clients need an account to view shared work?",
    answer: "No. Clients can view your shared folders or galleries directly from the link — no sign-up required.",
  },
  {
    question: "Can I export my client data?",
    answer: "Yes. You can export selected or all clients as a CSV file and have it sent to your email.",
  },
];
