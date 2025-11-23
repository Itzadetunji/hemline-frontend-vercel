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
import { CollectionCarousel } from "./components/LandingPageCarousel";

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
                  <Label class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3 focus-within:outline focus-within:outline-primary max-sm:max-w-46 max-md:h-8">
                    <i className="size-4.5">
                      <Icon icon="fluent:mail-16-regular" fontSize="18" />
                    </i>
                    <Controller
                      name="email"
                      control={formMethods.control}
                      render={({ field }) =>
                        (<input {...field} ref={emailInputRef} type="email" placeholder="Enter email" class="flex-1 text-sm outline-none placeholder:text-grey-400" />) as any
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
        <h1 class="!font-secondary px-4 font-medium text-3xl leading-normal sm:pl-25 sm:text-5xl md:px-14">
          Your portfolio — finally <br /> organized.
        </h1>

        <CollectionCarousel />

        <div class="mt-6 flex flex-col items-center gap-6 px-4 text-center sm:mt-12 sm:gap-8">
          <p class="max-w-[55ch] text-black text-sm sm:text-xl">Upload photos, group them into collections, and share your work with clients through a clean, private link.</p>
          <Button asChild variant="secondary" class="h-10 gap-1 text-black sm:h-11">
            <a href="/sign-up">
              <span class="size-5">
                <Icon icon="iconoir:upload" className="size-5 text-black" />
              </span>
              <p class="text-sm">Start Uploading</p>
            </a>
          </Button>
        </div>
        <picture class="mt-12 flex w-full justify-center px-4 sm:px-14">
          <source media="(min-width: 768px)" srcSet="/assets/landing-page/threads-scissors-1.svg" />
          <img src="/assets/landing-page/threads-scissors-2.svg" alt="Scissors and Thread" />
        </picture>
      </section>
      <section class="mt-12 flex flex-col items-center px-4 sm:mt-16 md:px-14">
        <div class="flex w-fit flex-col items-center border-b-line text-center sm:border-b sm:px-15 sm:pb-10">
          <h1 class="font-medium font-secondary! text-3xl sm:text-5xl">
            Manage every client in <br /> one place.
          </h1>
          <img src="/assets/landing-page/one-place-clients.png" alt="All Clients" class="mt-10 w-full max-w-sm sm:mt-12" />
          <p class="sm:-mt-8 mt-1 text-sm sm:text-xl">
            Keep client details, measurements, and orders beautifully <br />
            organized — so you can focus on creating, not remembering.
          </p>
        </div>
        <ul class="mt-14 flex items-stretch gap-5 max-sm:flex-col sm:mt-18 sm:gap-8">
          {clientFeatures.map((feature) => (
            <li class="flex flex-1 flex-col items-start gap-4 border p-4 text-left sm:p-6" key={feature.title}>
              <figure>
                <img src={feature.src} alt="" />
                <figcaption class="flex flex-col gap-3 sm:gap-3.5">
                  <h2 class="font-medium font-secondary! text-lg">{feature.title}</h2>
                  <p class="text-base">{feature.description}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p class="mt-18 font-medium text-grey text-xl sm:text-3xl">
          <span class="text-black">Add and</span> manage each client's measurements in one place. Record upper and lower body details, switch between inches or centimeters, and
          create custom fields when needed. Everything stays organized and easy to find whenever you need it.
        </p>
      </section>
      <img src="/assets/landing-page/fabrics.webp" class="mt-10 max-h-108 object-cover sm:mt-20" alt="" />
      <picture class="mt-12 h-28 object-cover sm:mt-20 sm:max-h-108">
        <source media="(min-width: 768px)" srcSet="/assets/landing-page/collection-pin-1.png" />
        <img src="/assets/landing-page/collection-pin-2.png" alt="" />
      </picture>

      <section class="mt-16 flex w-full flex-col items-center px-4 sm:mt-22">
        <h1 class="text-center font-medium font-secondary! text-3xl leading-[1.25] sm:text-5xl">
          Organize your <br /> designs your way
        </h1>

        <div class="mt-10 flex flex-col items-center gap-6 sm:mt-12 sm:gap-8">
          <p class="text-center">
            Create folders, add images, and manage everything with the same <br class="max-sm:hidden" /> simplicity as your photo gallery.
          </p>
          <Button class="h-10.5 w-fit gap-2 px-2.5 max-md:h-9" asChild>
            <a href="/sign-up">
              <i class="grid size-5 place-content-center">
                <Icon icon="iconoir:arrow-right" className="h-5 w-5 text-white" />
              </i>
              <p class="text-white">Join now</p>
            </a>
          </Button>
        </div>
        <div class="mt-10 grid w-full max-w-6xl grid-cols-24 gap-4 max-md:flex max-md:flex-col sm:gap-2.5">
          {organizeFeatures.map((feature, idx) => (
            <div
              key={feature.title}
              class={cn("col-span-8 flex min-h-41 flex-col gap-10 border border-line py-6 sm:h-66", {
                "col-span-16": idx === 1 || idx === 2,
              })}
            >
              <i class="pl-6">
                <Icon icon={feature.icon} className="size-7 text-primary sm:size-8" />
              </i>
              <div class="flex flex-1 flex-col justify-end gap-3 pr-6 pl-4 sm:gap-4">
                <p class="font-medium text-lg">{feature.title}</p>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section class="mt-14 flex w-full flex-col items-center gap-10 sm:mt-33.5 sm:gap-18" id="faqs">
        <div class="flex flex-col gap-4 text-left sm:gap-6 sm:text-center">
          <h1 class="font-medium font-secondary! text-3xl leading-[1.25] sm:text-5xl">FAQs</h1>
          <p class="">Got any question? We've answered it for you</p>
        </div>
        <Accordion type="single" collapsible className="flex w-full max-w-4xl flex-col gap-8 px-8 sm:gap-12">
          {
            faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="group flex flex-col gap-4 border-none">
                {
                  (
                    <div className="flex items-start gap-4">
                      <i className="grid size-5 place-content-center">
                        <Icon icon="si:add-duotone" className="size-5 transition-transform duration-300 group-data-[state=open]:rotate-45 sm:size-8" />
                      </i>
                      <div className="flex flex-1 flex-col">
                        <AccordionTrigger className="rounded-none p-0 text-left text-sm tracking-normal hover:no-underline sm:text-2xl" showIcon={false}>
                          {faq.question}
                        </AccordionTrigger>
                        <div class="w-full border-b border-b-line pb-4 sm:pb-8">
                          <AccordionContent className="pt-6 text-grey text-sm sm:text-lg">{faq.answer}</AccordionContent>
                        </div>
                      </div>
                    </div>
                  ) as any
                }
              </AccordionItem>
            )) as any
          }

          <div class="flex flex-col items-center gap-4 text-center sm:items-start sm:gap-5 sm:text-left">
            <p class="text-sm sm:text-xl">Still have questions? We're here to help.</p>
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
      <footer class="mt-16 flex flex-1 flex-col items-stretch justify-between bg-primary px-4 pt-10 pb-16 sm:mt-30 sm:pt-14 sm:pb-20 md:px-14 md:pt-30 xl:min-h-[calc(100dvh-16rem)]">
        <h1 class="!font-secondary !tracking-normal text-3xl text-white sm:text-5xl">Your Workflow Made Simple</h1>
        <div class="mt-8 flex items-center justify-between gap-6 border-b border-b-line pb-10 max-md:flex-col sm:mt-11 sm:gap-10 sm:pb-12">
          <picture class="flex max-h-58 max-md:w-full max-md:justify-center max-md:self-start md:min-h-58 md:min-w-58">
            <source media="(min-width: 768px)" srcSet="/assets/landing-page/footer-features-1.svg" />
            <img src="/assets/landing-page/footer-features-2.svg" alt="Features" class="max-sm:min-h-58" />
          </picture>
          <div class="flex flex-1 flex-col items-end gap-8 border-line border-t border-l pt-3.5 pl-10 text-xl sm:pt-10 sm:pb-13.5">
            <p class="pr-10 text-sm text-white max-sm:px-4 max-md:text-right sm:text-base">
              Save measurements, organize photos, and share collections — all in one simple space built for fashion designers.
            </p>
            <form class="flex flex-wrap items-center justify-end gap-2" onSubmit={handleSubmit}>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <Label class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3 focus-within:outline focus-within:outline-primary max-sm:max-w-46 max-md:h-8">
                    <i className="size-4.5">
                      <Icon icon="fluent:mail-16-regular" className="size-4.5 text-white" />
                    </i>
                    <Controller
                      name="email"
                      control={formMethods.control}
                      render={({ field }) =>
                        (<input {...field} ref={emailInputRef} type="email" placeholder="Enter email" class="text-sm outline-none placeholder:text-white sm:flex-1" />) as any
                      }
                    />
                  </Label>

                  <Button class="h-10.5 w-fit gap-1 px-3 max-md:h-8" variant="secondary" type="submit">
                    {/* <i class="grid size-5 place-content-center">
                      <Icon icon="iconoir:arrow-right" className="h-5 w-5" />
                    </i> */}
                    <p>Join Now</p>
                  </Button>
                </div>
                {formMethods.formState.errors.email && <p class="text-destructive text-xs">{formMethods.formState.errors.email.message}</p>}
              </div>
            </form>
          </div>
        </div>

        <picture class="mt-10 flex w-full justify-center sm:mt-20">
          <source media="(min-width: 768px)" srcSet="/assets/landing-page/threads-scissors-1.svg" />
          <img src="/assets/landing-page/threads-scissors-2.svg" alt="Scissors and Thread" />
        </picture>

        <div class="mt-28 grid grid-cols-1 max-sm:gap-8 sm:grid-cols-24">
          <div class="flex items-start gap-3 sm:col-span-9">
            <img src="/assets/brand/logo-small-white.svg" alt="Logo" class="size-9" />
            <h1 class="text-2xl text-white">HEMLINE</h1>
          </div>
          <div class="flex flex-col gap-4 sm:col-span-5 sm:gap-8">
            <h2 class="!font-secondary font-medium text-white text-xl">Company</h2>
            <ul class="flex flex-col gap-3 text-white">
              <li>
                <a href="#faqs">FAQs</a>
              </li>
            </ul>
          </div>
          <div class="flex flex-col gap-4 sm:col-span-5 sm:gap-8">
            <h2 class="!font-secondary font-medium text-white text-xl">Features</h2>
            <ul class="flex flex-col gap-3 text-white">
              <li>Clients</li>
              <li>Gallery</li>
              <li>Orders</li>
              <li>Collections</li>
            </ul>
          </div>
          <div class="flex flex-col gap-4 sm:col-span-5 sm:gap-8">
            <h2 class="!font-secondary font-medium text-white text-xl">Support</h2>
            <ul class="flex flex-col gap-3 text-white">
              <li>
                <a href="/support">Contact Support</a>
              </li>
            </ul>
          </div>
        </div>
        <picture class="mt-16 w-full">
          <source media="(min-width: 768px)" srcSet="/assets/landing-page/footer-lines-1.svg" />
          <img src="/assets/landing-page/footer-lines-2.svg" alt="Footer Lines" class="w-full" />
        </picture>

        <div class="mt-8 flex flex-wrap justify-between gap-6 max-sm:flex-col sm:items-center">
          <ul class="flex items-center gap-3 text-white">
            <li>
              <a href="/terms-and-conditions">Terms and Conditions</a>
            </li>
            <li>
              <a href="/privacy-policy">Privacy Policy</a>
            </li>
          </ul>
          <p class="text-white">© {new Date().getFullYear()} Hemline. All rights reserved.</p>
        </div>
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
