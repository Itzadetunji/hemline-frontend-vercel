import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { signal } from "@preact/signals";
import type { TargetedSubmitEvent } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useGetUserProfile, usersQuerykeys, useUpdateBusinessImage, useUpdateUserProfile, useDeleteAccount } from "@/api/http/v1/users/users.hooks";
import { type NotMarkedForDeletionProfile, type OnboardingFormData, OnboardingFormSchema, Profession, SkillChoices } from "@/api/http/v1/users/users.types";
import { Button } from "@/components/ui/button";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
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
      first_name: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.first_name || "",
      last_name: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.last_name || "",
      profession: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.profession || "Tailors / Dressmakers",
      business_name: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.business_name || "",
      business_address: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.business_address || "",
      skills: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.skills || [],
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

  // const updateTheme = () => {
  //   // if (typeof window !== "undefined") {
  //   //   localStorage.setItem("theme", payload.theme);
  //   // }
  // };

  useLayoutEffect(() => {
    if (getUserProfile.data) {
      const resetData = {
        first_name: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.first_name || "",
        last_name: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.last_name || "",
        profession: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.profession || "Tailors / Dressmakers",
        business_name: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.business_name || "",
        business_address: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.business_address || "",
        skills: (getUserProfile.data.data as NotMarkedForDeletionProfile).user.skills || [],
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
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
                    <p class="font-medium text-sm leading-1">First name</p>
                    <Controller
                      name="first_name"
                      control={formMethods.control}
                      render={({ field }) =>
                        (
                          <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3 focus-within:outline focus-within:outline-primary">
                            <i className="size-4.5">
                              <Icon icon="hugeicons:user-02" fontSize="18" className="flex-shrink-0" />
                            </i>
                            <input {...field} placeholder="John" class="min-w-0 flex-1 text-sm outline-none placeholder:text-grey-400" disabled={!isEditing} />
                            {!isEditing && (
                              <button type="button" onClick={onEdit}>
                                <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                              </button>
                            )}
                          </div>
                        ) as any
                      }
                    />
                  </Label>
                  {formMethods.formState.errors.first_name && <p class="text-destructive text-xs">{formMethods.formState.errors.first_name.message}</p>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label class="flex min-w-0 flex-1 flex-col items-stretch gap-4">
                    <p class="font-medium text-sm leading-1">Last name</p>
                    <Controller
                      name="last_name"
                      control={formMethods.control}
                      render={({ field }) =>
                        (
                          <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3 focus-within:outline focus-within:outline-primary">
                            <i className="size-4.5">
                              <Icon icon="hugeicons:user-02" fontSize="18" className="flex-shrink-0" />
                            </i>
                            <input {...field} placeholder="Doe" class="min-w-0 flex-1 text-sm outline-none placeholder:text-grey-400" disabled={!isEditing} />
                            {!isEditing && (
                              <button type="button" onClick={onEdit}>
                                <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                              </button>
                            )}
                          </div>
                        ) as any
                      }
                    />
                  </Label>
                  {formMethods.formState.errors.last_name && <p class="text-destructive text-xs">{formMethods.formState.errors.last_name.message}</p>}
                </div>
              </div>

              {/* Profession */}
              <div class="flex flex-col gap-1">
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
                        </div>
                      ) as any
                    }
                  />
                </Label>
                {formMethods.formState.errors.profession && <p class="text-destructive text-xs">{formMethods.formState.errors.profession.message}</p>}
              </div>

              {/* Business Name */}
              <div class="flex flex-col gap-1">
                <Label class="flex flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-1">Business name</p>
                  <Controller
                    name="business_name"
                    control={formMethods.control}
                    render={({ field }) =>
                      (
                        <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3 focus-within:outline focus-within:outline-primary">
                          <i className="size-4.5">
                            <Icon icon="material-symbols-light:add-business-outline-rounded" fontSize="18" />
                          </i>
                          <input {...field} placeholder="John's Tailoring" class="flex-1 text-sm outline-none placeholder:text-grey-400" disabled={!isEditing} />
                          {!isEditing && (
                            <button type="button" onClick={onEdit}>
                              <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                            </button>
                          )}
                        </div>
                      ) as any
                    }
                  />
                </Label>
                {formMethods.formState.errors.business_name && <p class="text-destructive text-xs">{formMethods.formState.errors.business_name.message}</p>}
              </div>

              {/* Business Address */}
              <div class="flex flex-col gap-1">
                <Label class="flex flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-1">Business address</p>
                  <Controller
                    name="business_address"
                    control={formMethods.control}
                    render={({ field }) =>
                      (
                        <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3 focus-within:outline focus-within:outline-primary">
                          <i className="size-4.5">
                            <Icon icon="hugeicons:maps-location-02" fontSize="18" />
                          </i>
                          <input {...field} placeholder="123 Main St, City, State" class="flex-1 text-sm outline-none placeholder:text-grey-400" disabled={!isEditing} />
                          {!isEditing && (
                            <button type="button" onClick={onEdit}>
                              <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                            </button>
                          )}
                        </div>
                      ) as any
                    }
                  />
                </Label>
                {formMethods.formState.errors.business_address && <p class="text-destructive text-xs">{formMethods.formState.errors.business_address.message}</p>}
              </div>

              {/* Phone Number */}
              <div class="flex flex-col gap-1">
                <Label class="flex flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-1">Phone Number</p>
                  <Controller
                    name="phone_number"
                    control={formMethods.control}
                    render={({ field }) =>
                      (
                        <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3 focus-within:outline focus-within:outline-primary">
                          <i className="size-4.5">
                            <Icon icon="solar:phone-linear" fontSize="18" />
                          </i>
                          <input {...field} placeholder="070896043564" class="flex-1 text-sm outline-none placeholder:text-grey-400" disabled={!isEditing} />
                          {!isEditing && (
                            <button type="button" onClick={onEdit}>
                              <Icon icon="iconoir:edit" fontSize="18" className="flex-shrink-0" />
                            </button>
                          )}
                        </div>
                      ) as any
                    }
                  />
                </Label>
                {formMethods.formState.errors.phone_number && <p class="text-destructive text-xs">{formMethods.formState.errors.phone_number.message}</p>}
              </div>

              {/* Email */}
              <div class="flex flex-col gap-1">
                <Label class="flex flex-col items-stretch gap-4">
                  <p class="font-medium text-sm leading-1">Phone Number</p>
                  <div class="flex h-10.5 items-center gap-2 border border-line-700 px-3 focus-within:outline focus-within:outline-primary">
                    <i className="size-4.5">
                      <Icon icon="fluent:mail-16-regular" fontSize="18" />
                    </i>
                    <input
                      value={(getUserProfile?.data?.data as NotMarkedForDeletionProfile).user?.email}
                      readOnly
                      class="flex-1 text-sm outline-none placeholder:text-grey-400"
                      disabled
                    />
                  </div>
                </Label>
              </div>
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
                      {formMethods.formState.errors.skills && <p class="text-destructive text-xs">{formMethods.formState.errors.skills.message}</p>}
                    </div>
                  ) as any
                }
              />
            </div>
          </div>
        </form>

        <DeleteAccount />

        {/* <div class="flex flex-col gap-6">
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
        </div> */}
      </div>
    </>
  );
};

const UploadLogo = () => {
  const getUserProfile = useGetUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateBusinessImagesMutation = useUpdateBusinessImage();

  const { cachedUrl, isLoading: loading } = useImageCache((getUserProfile.data?.data as NotMarkedForDeletionProfile).user.business_image);

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
            {(getUserProfile.data?.data as NotMarkedForDeletionProfile).user.business_image && (
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
              {!(getUserProfile.data?.data as NotMarkedForDeletionProfile).user.business_image &&
                ((getUserProfile.data?.data as NotMarkedForDeletionProfile).user.full_name
                  ? getInitials((getUserProfile.data?.data as NotMarkedForDeletionProfile).user.full_name, true)
                  : getInitials((getUserProfile.data?.data as NotMarkedForDeletionProfile).user.email as string))}
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

const DeleteAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  const handleDelete = async () => {
    await deleteAccountMutation.mutateAsync(undefined, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  return (
    <div class="flex flex-col gap-6 border-t border-t-line-700 pt-6">
      <div class="flex flex-col gap-2">
        <p class="font-medium text-base leading-none">Delete Account</p>
        <p class="font-medium text-grey-500 text-sm leading-none">Permanently delete your account and all data</p>
      </div>

      <Button variant="destructive" class="w-fit" type="button" onClick={() => setIsOpen(true)}>
        Delete Account
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
          <DialogHeader class="p-0">
            <div class="flex items-center gap-2">
              <DialogClose class="size-4">
                <Icon icon="ix:cancel" fontSize={16} />
              </DialogClose>
              <p class="font-medium text-sm">Delete Account</p>
            </div>
          </DialogHeader>
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-4">
              <p class="!font-primary text-2xl leading-0">Are you sure?</p>
              <p class="font-medium text-sm">This is permanent, your account and all associated data will be deleted.</p>
            </div>
            <DialogFooter class="flex flex-row-reverse justify-stretch gap-3">
              <Button class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={() => setIsOpen(false)} disabled={deleteAccountMutation.isPending}>
                Keep Account
              </Button>

              <Button
                variant="outline"
                class="flex-1 py-3.5 font-medium text-destructive text-sm hover:text-destructive"
                type="button"
                onClick={handleDelete}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
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
