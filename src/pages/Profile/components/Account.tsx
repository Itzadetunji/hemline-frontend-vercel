import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import type { TargetedSubmitEvent } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useGetUserProfile, usersQuerykeys, useUpdateBusinessImage, useUpdateUserProfile } from "@/api/http/v1/users/users.hooks";
import { type OnboardingFormData, OnboardingFormSchema, Profession, SkillChoices } from "@/api/http/v1/users/users.types";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageCache } from "@/hooks/useImageCache";
import { headerContentSignal } from "@/layout/Header";
import { cn, getInitials } from "@/lib/utils";

export const Account = () => {
  const updateUserProfileMutation = useUpdateUserProfile();
  const getUserProfile = useGetUserProfile();

  const [isEditing, setIsEditing] = useState(false);

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

  const handleSubmit = (e: TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  const onSubmit = async (payload: OnboardingFormData) => {
    await updateUserProfileMutation.mutateAsync(payload, {
      onSuccess: () => {
        // Store theme preference locally or in user store
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        profileNavbarSignal.value = {
          showNavbar: false,
        };
        headerContentSignal.value = {
          ...headerContentSignal.value,
          showNavbar: true,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", payload.theme);
        }
      },
      onError: (error) => {
        toast.error("Profile could not be updated");
        console.error("Onboarding error:", error);
      },
    });
  };

  const onEdit = () => {
    setIsEditing(true);
    profileNavbarSignal.value = {
      showNavbar: true,
    };
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showNavbar: false,
    };
  };

  const cancelEditing = () => {
    if (!getUserProfile.data) return;
    const resetData = {
      first_name: getUserProfile.data.data.user.first_name || "",
      last_name: getUserProfile.data.data.user.last_name || "",
      profession: getUserProfile.data.data.user.profession || "Tailors / Dressmakers",
      business_name: getUserProfile.data.data.user.business_name || "",
      business_address: getUserProfile.data.data.user.business_address || "",
      skills: getUserProfile.data.data.user.skills || [],
    };

    formMethods.reset(resetData);
    setIsEditing(false);
    profileNavbarSignal.value = {
      showNavbar: false,
    };
    headerContentSignal.value = {
      ...headerContentSignal.value,
      showNavbar: true,
    };
  };

  const updateTheme = () => {
    // if (typeof window !== "undefined") {
    //   localStorage.setItem("theme", payload.theme);
    // }
  };

  useLayoutEffect(() => {
    if (getUserProfile.data) {
      const resetData = {
        first_name: getUserProfile.data.data.user.first_name || "",
        last_name: getUserProfile.data.data.user.last_name || "",
        profession: getUserProfile.data.data.user.profession || "Tailors / Dressmakers",
        business_name: getUserProfile.data.data.user.business_name || "",
        business_address: getUserProfile.data.data.user.business_address || "",
        skills: getUserProfile.data.data.user.skills || [],
      };

      formMethods.reset(resetData);
    }
  }, [getUserProfile.data]);

  useEffect(() => {
    if (isEditing)
      headerContentSignal.value = {
        ...headerContentSignal.value,
        showHeader: true,
      };
  }, [isEditing]);

  return (
    <>
      <ProfileNavBar cancelEditing={cancelEditing} onSubmit={() => onSubmit(formMethods.getValues())} />
      <div class="flex flex-col gap-8 pt-8 pb-20">
        <UploadLogo />
        <form class="flex flex-col items-stretch gap-8" onSubmit={handleSubmit}>
          <div class="flex flex-col items-stretch gap-6">
            <div class="flex flex-col gap-2">
              <p class="font-medium text-base leading-none">Profile and Business info</p>
              <p class="font-medium text-grey-500 text-sm leading-none">Edit your saved account and business info below</p>
            </div>
            <div class="flex w-full flex-1 flex-col gap-6">
              {/* Full Name - Split into first and last */}
              <div class="flex w-full items-start justify-between gap-4">
                <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-1">First name</p>
                  <Controller
                    name="first_name"
                    control={formMethods.control}
                    render={({ field }) =>
                      (
                        <div class="flex flex-col gap-2">
                          <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                            <Icon icon="hugeicons:user-02" fontSize="18" className="flex-shrink-0" />
                            <input {...field} placeholder="John" class="min-w-0 flex-1 text-sm placeholder:text-grey-400" disabled={!isEditing} />
                            {!isEditing && (
                              <button type="button" onClick={onEdit}>
                                <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                              </button>
                            )}
                          </div>
                          {formMethods.formState.errors.first_name && <p class="text-red-500 text-xs">{formMethods.formState.errors.first_name.message}</p>}
                        </div>
                      ) as any
                    }
                  />
                </Label>
                <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-1">Last name</p>
                  <Controller
                    name="last_name"
                    control={formMethods.control}
                    render={({ field }) =>
                      (
                        <div class="flex flex-col gap-2">
                          <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                            <Icon icon="hugeicons:user-02" fontSize="18" className="flex-shrink-0" />
                            <input {...field} placeholder="Doe" class="min-w-0 flex-1 text-sm placeholder:text-grey-400" disabled={!isEditing} />
                            {!isEditing && (
                              <button type="button" onClick={onEdit}>
                                <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                              </button>
                            )}
                          </div>
                          {formMethods.formState.errors.last_name && <p class="text-red-500 text-xs">{formMethods.formState.errors.last_name.message}</p>}
                        </div>
                      ) as any
                    }
                  />
                </Label>
              </div>

              {/* Profession */}
              <Label class="flex flex-col items-stretch gap-4">
                <p class="font-medium text-sm leading-1">Profession</p>
                <Controller
                  name="profession"
                  control={formMethods.control}
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
                          disabled={!isEditing}
                        />
                        {formMethods.formState.errors.profession && <p class="text-red-500 text-xs">{formMethods.formState.errors.profession.message}</p>}
                      </div>
                    ) as any
                  }
                />
              </Label>

              {/* Business Name */}
              <Label class="flex flex-col items-stretch gap-4">
                <p class="font-medium text-sm leading-1">Business name</p>
                <Controller
                  name="business_name"
                  control={formMethods.control}
                  render={({ field }) =>
                    (
                      <div class="flex flex-col gap-2">
                        <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                          <Icon icon="material-symbols-light:add-business-outline-rounded" fontSize="18" />
                          <input {...field} placeholder="John's Tailoring" class="flex-1 text-sm placeholder:text-grey-400" disabled={!isEditing} />
                          {!isEditing && (
                            <button type="button" onClick={onEdit}>
                              <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                            </button>
                          )}
                        </div>
                        {formMethods.formState.errors.business_name && <p class="text-red-500 text-xs">{formMethods.formState.errors.business_name.message}</p>}
                      </div>
                    ) as any
                  }
                />
              </Label>

              {/* Business Address */}
              <Label class="flex flex-col items-stretch gap-4">
                <p class="font-medium text-sm leading-1">Business address</p>
                <Controller
                  name="business_address"
                  control={formMethods.control}
                  render={({ field }) =>
                    (
                      <div class="flex flex-col gap-2">
                        <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                          <Icon icon="hugeicons:maps-location-02" fontSize="18" />
                          <input {...field} placeholder="123 Main St, City, State" class="flex-1 text-sm placeholder:text-grey-400" disabled={!isEditing} />
                          {!isEditing && (
                            <button type="button" onClick={onEdit}>
                              <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                            </button>
                          )}
                        </div>
                        {formMethods.formState.errors.business_address && <p class="text-red-500 text-xs">{formMethods.formState.errors.business_address.message}</p>}
                      </div>
                    ) as any
                  }
                />
              </Label>

              {/* Phone Number */}
              <Label class="flex flex-col items-stretch gap-4">
                <p class="font-medium text-sm leading-1">Phone Number</p>
                <Controller
                  name="phone_number"
                  control={formMethods.control}
                  render={({ field }) =>
                    (
                      <div class="flex flex-col gap-2">
                        <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3">
                          <Icon icon="solar:phone-linear" fontSize="18" />
                          <input {...field} placeholder="070896043564" class="flex-1 text-sm placeholder:text-grey-400" disabled={!isEditing} />
                          {!isEditing && (
                            <button type="button" onClick={onEdit}>
                              <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                            </button>
                          )}
                        </div>
                        {formMethods.formState.errors.phone_number && <p class="text-red-500 text-xs">{formMethods.formState.errors.phone_number.message}</p>}
                      </div>
                    ) as any
                  }
                />
              </Label>
            </div>
          </div>

          <div class="flex flex-1 flex-col gap-6">
            <div class="flex justify-between">
              <div class="flex flex-col gap-2">
                <p class="font-medium text-base leading-none">Skills</p>
                <p class="font-medium text-grey-500 text-sm leading-none">Edit or remove your saved skills below</p>
              </div>
              {!isEditing && (
                <button class="self-end" type="button" onClick={onEdit}>
                  <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                </button>
              )}
            </div>
            <div class="flex-1">
              <Controller
                name="skills"
                control={formMethods.control}
                render={({ field }) =>
                  (
                    <div class="flex flex-col gap-4">
                      <CheckboxGroup options={SkillChoices as any} value={field.value} onChange={field.onChange} isDisabled={!isEditing} />
                      {formMethods.formState.errors.skills && <p class="text-red-500 text-xs">{formMethods.formState.errors.skills.message}</p>}
                    </div>
                  ) as any
                }
              />
            </div>
          </div>
        </form>

        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <p class="font-medium text-base leading-none">Appearance</p>
            <p class="font-medium text-grey-500 text-sm leading-none">Choose your default appearance</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateTheme();
            }}
          >
            <p class="font-medium text-sm">Dark Mode</p>
          </form>
        </div>
      </div>
    </>
  );
};

const UploadLogo = () => {
  const getUserProfile = useGetUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateBusinessImagesMutation = useUpdateBusinessImage();

  const { cachedUrl, isLoading: loading } = useImageCache(getUserProfile.data?.data.user.business_image);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const formData = new FormData();

      // Add all files to FormData
      for (const file of files) {
        formData.append("image", file);
      }

      try {
        toast.loading("Uploading logo...", {
          id: `${usersQuerykeys.all[0]}-update`,
        });
        await updateBusinessImagesMutation.mutateAsync(formData, {});
      } catch (error) {
        console.error("Upload failed:", error);
      }

      // Reset input
      target.value = "";
    }
  };

  return (
    <div class="flex flex-col gap-6 border-b border-b-line-700 pb-6">
      <div class="flex flex-col gap-4.5">
        <p class="font-medium text-base leading-1">Business logo</p>
        <p class="font-medium text-grey-500 text-sm leading-1">Edit or upload your business logo</p>
      </div>
      <div>
        <figure class="flex gap-3">
          <div class="relative size-16 overflow-hidden rounded-none">
            {getUserProfile.data?.data.user.business_image && (
              <>
                {loading && <Skeleton class="absolute inset-0 size-16 h-full w-full rounded-none" />}

                <img
                  src={cachedUrl}
                  alt="Business Logo"
                  class={cn("size-16 h-full w-full object-cover transition-opacity duration-300", loading ? "opacity-0" : "opacity-100")}
                  crossOrigin="anonymous"
                />
              </>
            )}
            <div class="flex size-full items-center justify-center bg-muted">
              {!getUserProfile.data?.data.user.business_image &&
                (getUserProfile.data?.data.user.full_name
                  ? getInitials(getUserProfile.data?.data.user.full_name, true)
                  : getInitials(getUserProfile.data?.data.user.email as string))}
            </div>
          </div>

          <figcaption class="self-end">
            <button type="button" class="flex items-center gap-2 border-r border-r-line-500 pr-2" onClick={handleButtonClick}>
              <p class="text-sm leading-1">Upload logo</p>
              <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple disabled={updateBusinessImagesMutation.isPending} class="hidden" onChange={handleFileChange} />
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

interface ProfileNavBarProps {
  cancelEditing: () => void;
  onSubmit: () => void;
}

export const profileNavbarSignal = signal<{
  showNavbar: boolean;
}>({
  showNavbar: false,
});

export const ProfileNavBar = (props: ProfileNavBarProps) => {
  if (!profileNavbarSignal.value.showNavbar) return null;

  return (
    <ul class="-translate-x-1/2 fixed bottom-6 left-1/2 z-50 flex items-center border border-line-500 bg-white p-0.5">
      <Button type="button" class="px-4 py-2.5 font-medium text-black capitalize transition-colors" variant="secondary" onClick={props.onSubmit}>
        Save Changes
      </Button>
      <Button type="button" class="px-4 py-2.5 font-medium text-destructive capitalize transition-colors" variant="ghost" onClick={() => props.cancelEditing()}>
        Cancel Edit
      </Button>
    </ul>
  );
};
