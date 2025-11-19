import { accountDeletionPendingSignal, useCancelDeleteAccount } from "@/api/http/v1/users/users.hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { clearEmail } from "@/stores/authStore";
import { userStore } from "@/stores/userStore";
import { Icon } from "@iconify/react";
import { useLocation } from "preact-iso";

export const AccountDeletionPendingModal = () => {
  const cancelDeleteAccountMutation = useCancelDeleteAccount();
  const location = useLocation();

  const handleCancelDeletion = async () => {
    await cancelDeleteAccountMutation.mutateAsync();
  };

  const handleClose = () => {
    accountDeletionPendingSignal.value = {
      isOpen: false,
      userData: null,
      date_requested_for_deletion: undefined,
    };
    clearEmail();
    userStore.logout();
    localStorage.clear();
    location.route("/sign-in", true);
  };

  const target = accountDeletionPendingSignal.value.date_requested_for_deletion
    ? new Date(accountDeletionPendingSignal.value.date_requested_for_deletion as string).getTime()
    : Date.now();
  const now = Date.now();

  // Days from now until target
  const diffMs = target - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const daysToMake = Math.round(7 - diffDays);

  return (
    <Dialog open={accountDeletionPendingSignal.value.isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showClose={false} class="flex flex-col gap-8 rounded-none">
        <DialogHeader class="p-0">
          <div class="flex items-center gap-2">
            <DialogClose class="size-4" onClick={handleClose}>
              <Icon icon="ix:cancel" fontSize={16} />
            </DialogClose>
            <p class="font-medium text-sm">Account Deletion Pending</p>
          </div>
        </DialogHeader>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4">
            <p class="!font-primary text-2xl leading-0">Account scheduled for deletion</p>
            <p class="font-medium text-sm">
              Your account is scheduled to be deleted in {daysToMake} day{daysToMake !== 1 ? "s" : ""}. Do you want to cancel the deletion and log in?
            </p>
          </div>
          <DialogFooter class="flex flex-row-reverse justify-stretch gap-3">
            <Button class="flex-1 py-3.5 font-medium text-sm" type="button" onClick={handleCancelDeletion} disabled={cancelDeleteAccountMutation.isPending}>
              {cancelDeleteAccountMutation.isPending ? "Cancelling..." : "Cancel Deletion"}
            </Button>

            <Button
              variant="outline"
              class="flex-1 py-3.5 font-medium text-destructive text-sm hover:text-destructive"
              type="button"
              onClick={handleClose}
              disabled={cancelDeleteAccountMutation.isPending}
            >
              No
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
