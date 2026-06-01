// src/components/DocumentUpload.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export function DocumentUpload({
  onFileSelect,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`);
          return false;
        }
        return true;
      });

      if (!multiple && validFiles.length > 0) {
        setFiles([validFiles[0]]);
        onFileSelect([validFiles[0]]);
      } else {
        const newFiles = multiple ? [...files, ...validFiles] : validFiles;
        setFiles(newFiles);
        onFileSelect(newFiles);
      }
    },
    [maxSize, multiple, files, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, ext) => {
      acc[ext] = [];
      return acc;
    }, {} as Record<string, any>),
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">
          Drag and drop files here, or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supported: PDF, DOC, DOCX, JPG, PNG (Max {maxSize / 1024 / 1024}MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Selected Files:</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
