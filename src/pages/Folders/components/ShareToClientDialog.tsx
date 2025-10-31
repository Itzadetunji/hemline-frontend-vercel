import { useShareFolder } from "@/api/http/v1/gallery/folders/folders.hooks";
import { type ShareFolderPayload, ShareFolderSchema, type Folder } from "@/api/http/v1/gallery/folders/folders.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { type SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ShareToClientDialogProps {
  folder: Folder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareToClientDialog = (props: ShareToClientDialogProps) => {
  const [isFolderPublic, setIsFolderPublic] = useState(props.folder.is_public ?? false);
  const [publicFolderUrl, setPublicFolderUrl] = useState(props.folder.public_url ?? "");
  const shareFolderMutation = useShareFolder();

  const formMethods = useForm<ShareFolderPayload>({
    resolver: zodResolver(ShareFolderSchema),
    defaultValues: {
      is_public: isFolderPublic,
    },
  });
  console.log(formMethods.formState.errors);
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!props.open) {
      formMethods.reset();
    }
  }, [props.open, formMethods.reset]);

  const onSubmit: SubmitHandler<ShareFolderPayload> = async (data) => {
    try {
      const payload = {
        share_type: data.share_type,
        is_public: data.is_public,
        client_id: data.share_type === "client" ? data.client_id : undefined,
        email: data.share_type === "email" ? data.email : undefined,
      } as ShareFolderPayload;

      await shareFolderMutation.mutateAsync(
        {
          id: props.folder.id,
          data: payload,
        },
        {
          onSuccess: (data, variables) => {
            setIsFolderPublic(data.data.is_public);
            if (data.data.is_public) {
              if (variables.data.share_type === "link") toast.success("Folder is now public! Link generated.");

              if (variables.data.share_type === "email") toast.success(`Link sent to ${variables.data.email}`);
            } else {
              toast.success("Folder is now private.");
            }

            setPublicFolderUrl(data.data.public_url);
          },
        }
      );
    } catch (error) {
      toast.error("Failed to update folder sharing settings");
      console.error("Error sharing folder:", error);
    }
  };
  const handleCopyLink = async () => {
    if (publicFolderUrl) {
      try {
        await navigator.clipboard.writeText(publicFolderUrl);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link to clipboard");
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  const handleSubmit = (e: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    formMethods.handleSubmit(onSubmit)(e as any);
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (shareFolderMutation.isPending) return;
        props.onOpenChange(open);
      }}
    >
      <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose class="size-6">
              <Icon icon="solar:arrow-left-linear" fontSize={24} />
            </DialogClose>
            <p class="font-medium text-base">Share to Client</p>
          </div>
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3">
            <p class="!font-primary text-2xl leading-none">Share your works to clients</p>
            <p class="text-grey-500 text-sm">Clients can view your works when you share them this link.</p>
          </div>

          {/* Future: Existing Clients Section */}
          {/* <div class="flex flex-col gap-2">
            <Label htmlFor="existing-clients" class="font-medium text-sm">
              Existing Clients
            </Label>
            <Button type="button" class="">
              <p>Share with Clients</p>
              <Icon icon="solar:arrow-right-linear" fontSize={24} />
            </Button>
          </div> */}

          {/* <div class="flex items-center gap-2">
            <hr class="flex-1 border-line-700" /> <p>Or</p>
          </div> */}

          {/* Email Section */}
          <form onSubmit={handleSubmit} class="flex flex-col gap-4">
            <p class="font-medium text-grey-500 text-sm">Share it to their email or copy the link below</p>
            <div class="flex flex-col gap-2">
              <Label htmlFor="client-email" class="font-medium text-sm">
                Client's email
              </Label>
              <div class="flex h-10.5 items-center gap-3.5 border border-line-700 px-3">
                <input
                  {...formMethods.register("email", {
                    onChange: () => {
                      formMethods.setValue("share_type", "email");
                      formMethods.setValue("is_public", true);
                    },
                  })}
                  id="client-email"
                  placeholder="hello@hemline.app"
                  class="flex-1 text-sm placeholder:text-grey-400 disabled:opacity-50"
                />
                <Button type="submit" class="!px-1 !py-1 h-fit gap-0" variant="outline" disabled={shareFolderMutation.isPending}>
                  <Icon icon="solar:arrow-up-linear" fontSize={16} />
                  <p class="ml-1 text-sm">Send</p>
                </Button>
              </div>
              {(formMethods.formState.errors as any).email && <p class="text-red-500 text-sm">{(formMethods.formState.errors as any).message}</p>}
            </div>
          </form>

          <div class="flex flex-col gap-3">
            {/* Make Public Button */}
            {!isFolderPublic && (
              <Button
                type="button"
                disabled={shareFolderMutation.isPending}
                class="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  onSubmit({
                    share_type: "link",
                    is_public: true,
                  });
                }}
              >
                {shareFolderMutation.isPending ? "Generating..." : "Get Public Link"}
              </Button>
            )}

            {/* Public Link Display */}
            {isFolderPublic && (
              <>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  class="flex h-10.5 w-full items-center justify-between gap-3.5 border border-line-700 px-3 transition-colors hover:bg-secondary"
                >
                  <i class="size-4.5 flex-shrink-0">
                    <Icon icon="mynaui:copy" fontSize="18" />
                  </i>
                  <p class="flex-1 truncate text-left text-black text-sm">{publicFolderUrl}</p>
                </button>

                {/* Make Private Button */}
                <Button
                  type="button"
                  onClick={() => {
                    onSubmit({
                      share_type: "link",
                      is_public: false,
                    });
                  }}
                  disabled={shareFolderMutation.isPending}
                  variant="outline"
                  class="w-full"
                >
                  {shareFolderMutation.isPending ? "Updating..." : "Make Private"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
