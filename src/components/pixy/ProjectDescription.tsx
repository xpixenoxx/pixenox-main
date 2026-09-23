"use client";

import { FormEvent, useState, useRef } from "react";
import { Paperclip } from "lucide-react";
import { BackButton } from "./BackButton";

interface UploadedFile {
  name: string;
  url?: string;
}

interface ProjectDescriptionProps {
  label: string;
  placeholder: string;
  initialValue?: string;
  initialFile?: UploadedFile | null;
  onSubmit: (value: string, file: UploadedFile | null) => void;
  onBack?: () => void;
}

export function ProjectDescription({
  label,
  placeholder,
  initialValue = "",
  initialFile = null,
  onSubmit,
  onBack,
}: ProjectDescriptionProps) {
  const [value, setValue] = useState(initialValue);
  const [file, setFile] = useState<UploadedFile | null>(initialFile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = value.trim().length > 0 || file !== null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(value.trim(), file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // In a real app, you would upload to a server or cloud storage here.
      // For this prototype, we'll store a mock reference or data URL.
      const mockUrl = URL.createObjectURL(selectedFile);
      setFile({ name: selectedFile.name, url: mockUrl });
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex w-full flex-col border-b-2 border-white/20 pb-2 transition-colors focus-within:border-white/60">
          <textarea
            id="pixy-textarea"
            autoFocus
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent px-2 py-2 text-xl text-text-primary placeholder:text-white/30 outline-none focus:outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
          />
          
          <div className="mt-2 flex w-full items-center justify-between px-2 pb-1">
            <div className="flex items-center">
              {file ? (
                <div className="flex max-w-[200px] items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="flex shrink-0 items-center justify-center rounded-full hover:bg-white/20 p-1 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Paperclip className="h-5 w-5" />
                    <span className="text-sm font-medium hidden sm:inline">Attach file</span>
                  </button>
                </>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white hover:text-[#1A1A24] active:scale-95 disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
              aria-label="Submit"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex w-full items-center justify-between px-4">
          {onBack ? <BackButton onClick={onBack} /> : <span />}
        </div>
      </form>
    </div>
  );
}
