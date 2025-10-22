/**
 * Simple example of using the z-index management system in your pages
 *
 * This shows practical usage in a real application scenario
 */

import { useState } from "preact/hooks";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

/**
 * Example 1: Confirmation Dialog with Nested Warning
 */
export function ConfirmationDialogExample() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);

  const handleDelete = () => {
    // First show warning dialog
    setWarningOpen(true);
  };

  const confirmDelete = () => {
    // Actual delete logic here
    console.log("Item deleted");
    setWarningOpen(false);
    setDeleteOpen(false);
  };

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Confirmation</DialogTitle>
          <DialogDescription>Are you sure you want to delete this item?</DialogDescription>
        </DialogHeader>

        <div class="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>

        {/* Nested Warning Dialog - will appear on top */}
        <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>⚠️ Warning</DialogTitle>
              <DialogDescription>This action cannot be undone. Are you absolutely sure?</DialogDescription>
            </DialogHeader>
            <div class="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWarningOpen(false)}>
                Go Back
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Yes, Delete Forever
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Example 2: Settings Dialog with Help Popover
 */
export function SettingsDialogExample() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Settings</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your application settings</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <label>Auto-save</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button class="text-grey-500 hover:text-grey-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent>
                  <div class="text-sm">
                    <strong>Auto-save</strong>
                    <p class="mt-1 text-grey-600">Automatically save your work every 5 minutes</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <input type="checkbox" />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <label>Notifications</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button class="text-grey-500 hover:text-grey-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent>
                  <div class="text-sm">
                    <strong>Notifications</strong>
                    <p class="mt-1 text-grey-600">Receive desktop notifications for important updates</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <input type="checkbox" />
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setSettingsOpen(false)}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Example 3: Multi-step Form with Confirmation
 */
export function MultiStepFormExample() {
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    // Show confirmation dialog
    setConfirmOpen(true);
  };

  const finalSubmit = () => {
    console.log("Form submitted");
    setConfirmOpen(false);
    setFormOpen(false);
    setStep(1); // Reset
  };

  return (
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogTrigger asChild>
        <Button>Create New Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Item - Step {step} of 3</DialogTitle>
          <DialogDescription>Fill in the details to create a new item</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          {step === 1 && (
            <div>
              <label>Name</label>
              <input type="text" class="w-full rounded border p-2" />
            </div>
          )}
          {step === 2 && (
            <div>
              <label>Description</label>
              <textarea class="w-full rounded border p-2" rows={4} />
            </div>
          )}
          {step === 3 && (
            <div>
              <label>Category</label>
              <select class="w-full rounded border p-2">
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          )}
        </div>

        <div class="mt-4 flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          <div class="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            {step < 3 ? <Button onClick={() => setStep(step + 1)}>Next</Button> : <Button onClick={handleSubmit}>Submit</Button>}
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>Are you ready to create this item?</DialogDescription>
            </DialogHeader>
            <div class="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Review
              </Button>
              <Button onClick={finalSubmit}>Confirm & Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Example 4: Gallery with Actions Menu
 */
export function GalleryActionsExample() {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div class="relative">
      {/* Image Card */}
      <div class="overflow-hidden rounded-lg border">
        <img src="/api/placeholder/300/200" alt="Gallery item" class="h-48 w-full object-cover" />
        <div class="flex items-center justify-between p-4">
          <h3 class="font-medium">Image Title</h3>

          {/* Actions Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <button class="rounded p-2 hover:bg-grey-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent class="w-48 p-2">
              <button class="w-full rounded px-3 py-2 text-left hover:bg-grey-100" onClick={() => setDetailsOpen(true)}>
                View Details
              </button>
              <button class="w-full rounded px-3 py-2 text-left hover:bg-grey-100">Download</button>
              <button class="w-full rounded px-3 py-2 text-left hover:bg-grey-100">Share</button>
              <hr class="my-1" />
              <button class="w-full rounded px-3 py-2 text-left text-destructive hover:bg-grey-100">Delete</button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          <div class="space-y-2">
            <div>
              <strong>Name:</strong> Image Title
            </div>
            <div>
              <strong>Size:</strong> 2.4 MB
            </div>
            <div>
              <strong>Dimensions:</strong> 1920x1080
            </div>
            <div>
              <strong>Created:</strong> Oct 22, 2025
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
