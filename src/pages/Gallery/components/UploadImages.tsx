import { Icon } from "@iconify/react";
import { useRef, useState, useImperativeHandle } from "preact/hooks";
import { forwardRef } from "preact/compat";

import { AddToFolder } from "@/components/AddToFolder";
import { useUploadImages } from "@/api/http/v1/gallery/gallery.hooks";

export interface UploadImagesHandle {
  triggerUpload: () => void;
}

// biome-ignore lint/complexity/noBannedTypes: Empty props interface for forwardRef
type UploadImagesProps = {};

export const UploadImages = forwardRef<UploadImagesHandle, UploadImagesProps>((_props, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [totalFiles, setTotalFiles] = useState(0);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [addToFolder, setAddToFolder] = useState(false);
  const [showProgressSuccess, setProgressSuccess] = useState(false);

  const uploadImagesMutation = useUploadImages();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Expose triggerUpload method to parent
  useImperativeHandle(ref, () => ({
    triggerUpload: handleButtonClick,
  }));

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      setTotalFiles(files.length);

      const formData = new FormData();

      // Add all files to FormData
      for (const file of files) {
        formData.append("images[]", file);
      }

      try {
        setProgressSuccess(true);

        await uploadImagesMutation.mutateAsync(formData, {
          onError: () => setProgressSuccess(false),
        });

        setHasUploaded(true);
      } catch (error) {
        console.error("Upload failed:", error);
      }

      // Reset input
      target.value = "";
    }
  };

  // Calculate uploaded count based on progress
  const uploadedCount = Math.floor((uploadImagesMutation.progress / 100) * totalFiles);

  return (
    <>
      <li>
        <button onClick={handleButtonClick} class="min-w-5 p-1" disabled={uploadImagesMutation.isPending} type="button">
          <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple disabled={uploadImagesMutation.isPending} class="hidden" onChange={handleFileChange} />
      </li>

      <div class="-mx-4 fixed bottom-20 z-50 flex w-full flex-col items-center">
        {showProgressSuccess && (
          <div class="flex items-center gap-3 border border-t-line-500 bg-white p-2">
            {uploadImagesMutation.isPending && (
              <>
                <div class="flex items-center gap-2 border-r border-r-line-500 pr-2">
                  <p class="leading-0">Uploading</p>
                  <Icon icon="iconoir:upload" className="h-4 w-4 text-black" />
                </div>

                <div class="flex items-center gap-1.5">
                  <p class="font-medium text-sm">
                    {uploadedCount} <span class="text-grey-500">/{totalFiles}</span>
                  </p>
                  <div class="flex h-1.5 w-16 flex-1 bg-secondary">
                    <div
                      class="bg-primary transition-all duration-200 ease-in-out"
                      style={{
                        width: `${uploadImagesMutation.progress}%`,
                      }}
                    />
                  </div>
                  <p class="font-medium text-sm">{Math.round(uploadImagesMutation.progress)}%</p>
                </div>
              </>
            )}

            {hasUploaded && (
              <>
                <div class="flex items-center gap-2">
                  <button type="button" onClick={() => setHasUploaded(false)}>
                    <Icon icon="ix:cancel" fontSize={14} />
                  </button>
                  <p class="text-grey-500 text-sm">+{totalFiles} Uploaded</p>
                </div>

                <AddToFolder
                  image_ids={uploadImagesMutation.data?.data.map((img) => img.id) || []}
                  addToFolder={addToFolder}
                  setHasUploaded={setHasUploaded}
                  setProgressSuccess={setProgressSuccess}
                  setAddToFolder={setAddToFolder}
                  showAddFolderButton
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
});

UploadImages.displayName = "UploadImages";
