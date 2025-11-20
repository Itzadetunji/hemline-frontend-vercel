import { LandingNavbar } from "@/components/LandingNavbar";

export const Support = () => {
  return (
    <main class="flex flex-1 flex-col bg-white px-4 pt-6 pb-10 md:min-h-[100dvh] md:px-14">
      <LandingNavbar />
      <div class="flex flex-1 flex-col items-center justify-center gap-6 pt-10 md:pt-30">
        <h1 class="font-light text-4xl md:text-5xl">Contact Support</h1>
        <p class="text-center text-gray-600 text-xl">
          Need help with something? We're here for you.
          <br />
          Reach out to us at{" "}
          <a href="mailto:hello@hemline.studio" class="font-medium text-black underline">
            hello@hemline.studio
          </a>
        </p>
      </div>
    </main>
  );
};
