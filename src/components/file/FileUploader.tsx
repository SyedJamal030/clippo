import React, { useState, useRef, useCallback, type ReactNode } from "react";
import {
  formatFileSize,
  getFriendlyAcceptDescriptions,
  validateFile,
} from "./util/uploader";
import { UploadIcon, X } from "lucide-react";

export interface FileUploaderProps {
  onFilesChange?: (files: File[]) => void;
  onError?: (errors: string[]) => void;
  removeText?: ReactNode;
  accept?: string;
  maxSizeBytes?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesChange,
  onError,
  removeText,
  accept = "image/*,application/pdf",
  maxSizeBytes = 100 * 1024 * 1024,
  maxFiles = 1,
  multiple = false,
  disabled = false,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef<number>(0);

  const processFiles = useCallback(
    (incomingFiles: FileList | File[]) => {
      if (disabled) return;

      const fileList = Array.from(incomingFiles);
      const validFiles: File[] = [];
      const errors: string[] = [];

      if (!multiple && fileList.length > 1) {
        errors.push("Only a single file selection is allowed.");
      }

      const targetList = multiple ? fileList : fileList.slice(0, 1);

      targetList.forEach((file) => {
        const error = validateFile(file, maxSizeBytes, accept);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0 && onError) {
        onError(errors);
      }

      if (validFiles.length > 0) {
        setFiles((prev) => {
          const nextState = multiple ? [...prev, ...validFiles] : validFiles;
          if (maxFiles && nextState.length > maxFiles) {
            if (onError) onError([`Cannot add more than ${maxFiles} files.`]);
            const truncated = nextState.slice(0, maxFiles);
            if (onFilesChange) onFilesChange(truncated);
            return truncated;
          }
          if (onFilesChange) onFilesChange(nextState);
          return nextState;
        });
      }
    },
    [
      disabled,
      multiple,
      maxSizeBytes,
      accept,
      maxFiles,
      onError,
      onFilesChange,
    ],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
    },
    [],
  );

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [disabled, processFiles]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      e.target.value = "";
    },
    [processFiles],
  );

  const removeFile = useCallback((indexToRemove: number): void => {
    if (disabled) {
      return;
    }
    setFiles((prev) => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
      if (onFilesChange) onFilesChange(updated);
      return updated;
    });
  }, [disabled, onFilesChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [],
  );

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Upload files area"
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group mt-2 flex justify-center rounded-lg transition-all duration-200 select-none border border-dashed px-6 py-18
          ${disabled ? "opacity-50 cursor-not-allowed bg-base-200 border-base-300" : "cursor-pointer"}
          ${isDragging ? "border-primary bg-primary/10 scale-[0.99]" : "border-base-content/50 bg-base-100 hover:border-primary hover:bg-base-200/50"}
          ${maxFiles === files.length ? "hidden" : ""}`}
      >
        <div className="text-center">
          <UploadIcon
            aria-hidden="true"
            className={`mx-auto size-10 transition-colors ${isDragging ? "text-primary" : "group-hover:text-primary text-base-content/60"}`}
          />
          <div className="mt-4 flex text-sm/6 text-base-content/60">
            <span className="relative text-primary hover:text-primary/80">
              <span className="font-medium">Upload a file</span>
              <input
                type="file"
                accept={accept}
                ref={fileInputRef}
                className="sr-only"
                multiple={multiple}
                disabled={disabled}
                onChange={handleInputChange}
              />
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs/5 text-base-content/60">
            {accept ? getFriendlyAcceptDescriptions(accept) : "Any file"} up to{" "}
            {formatFileSize(maxSizeBytes)}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-1">
            Selected Files ({files.length}/{maxFiles})
          </p>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {files.map((file, index) => {
              const extension =
                file.name.split(".").pop()?.toUpperCase() ?? "FILE";
              return (
                <li
                  role="alert"
                  className="alert overflow-hidden"
                  key={`${file.name}-${file.lastModified}-${index}`}
                >
                  <div className="badge badge-soft badge-info">{extension}</div>

                  {/* Add min-w-0 and flex-1 here */}
                  <div className="min-w-0 flex-1 max-w-full">
                    <h3 className="font-bold truncate">{file.name}</h3>
                    <div className="text-xs">{formatFileSize(file.size)}</div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={disabled}
                    className={`btn btn-error btn-soft btn-xs ${removeText ? "" : "btn-circle"}`}
                  >
                    {removeText ?? (
                      <X className="size-3" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
