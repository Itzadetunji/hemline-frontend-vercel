import { useLayoutEffect, useState } from "preact/hooks";

import { headerContentSignal } from "@/layout/Header";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export const Folders = () => {
  useLayoutEffect(() => {
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showHeader: true,
      title: "Folders",
      tab: "folders",
    };
  }, []);

  return (
    <div class="flex flex-1 flex-col gap-10 px-4 pb-8">
      <NoFolders />
    </div>
  );
};

const NoFolders = () => {
  const [step, setStep] = useState(1);
  if (step === 1)
    return (
      <div class="flex flex-col items-center gap-24 pt-10">
        <div class="flex flex-1 flex-col gap-10">
          <h2 class="text-3xl">Benefits of uploading your works to folders</h2>
          <ul class="flex flex-col gap-8">
            {FOLDER_BENEFITS.map((benefit) => (
              <li key={benefit.icon} class="flex items-start gap-6">
                <i class="grid size-5.5 place-content-center">
                  <Icon icon={benefit.icon} className="flex-shrink-0 text-primary" fontSize={22} />
                </i>
                <div class="flex flex-col gap-2">
                  <p class="font-semibold text-base text-black">{benefit.title}</p>
                  <p class="text-grey-500 text-sm">{benefit.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={() => setStep(2)} class="px-6">
          Continue
        </Button>
      </div>
    );

  if (step === 2)
    return (
      <div class="flex flex-1 flex-col items-stretch">
        <button class="flex items-center gap-2" type="button">
          <Icon icon="material-symbols-light:help-outline-rounded" className="text-black" fontSize={16} />
          <p class="font-medium text-sm">What is a folder?</p>
        </button>
        <div class="flex flex-1 flex-col items-center justify-center gap-4">
          <div class="flex flex-col items-center gap-4">
            <h2 class="text-2xl leading-0">Folder is empty</h2>
            <p class="max-w-8/10 text-center font-medium text-grey-500 text-sm">Create a folder by selecting from your uploaded works</p>
          </div>
          <button class="flex items-center gap-2 py-2" type="button">
            <p class="font-medium text-sm">Upload</p>
            <Icon icon="si:add-duotone" className="h-5 w-5 text-black" />
          </button>
        </div>
      </div>
    );
};

const FOLDER_BENEFITS = [
  {
    icon: "f7:square-stack-3d-down-right",
    title: "Keeps works organized",
    description: "Keep related work in the same folder. This helps to keep things more organized.",
  },
  {
    icon: "lineicons:share-1",
    title: "Share to clients easily",
    description: "We generate a copy link for each folder. You can share with your clients for them to view your works relating to what they need.",
  },
  {
    icon: "solar:hand-money-linear",
    title: "Win more clients",
    description: "Your folder is your online portfolio, upload your best works and impress your clients.",
  },
];
