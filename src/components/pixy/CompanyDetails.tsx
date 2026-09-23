"use client";

import { FormEvent, useState } from "react";
import { BackButton } from "./BackButton";

interface CompanyDetailsProps {
  initialCompany?: string;
  initialJobTitle?: string;
  onSubmit: (company: string, jobTitle: string) => void;
  onBack?: () => void;
}

export function CompanyDetails({
  initialCompany = "",
  initialJobTitle = "",
  onSubmit,
  onBack,
}: CompanyDetailsProps) {
  const [company, setCompany] = useState(initialCompany);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const canSubmit = company.trim().length > 0 && jobTitle.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(company.trim(), jobTitle.trim());
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex w-full items-end border-b-2 border-white/20 pb-2 transition-colors focus-within:border-white/60">
          <input
            id="pixy-company"
            autoFocus
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="w-full bg-transparent px-2 py-2 text-2xl text-text-primary placeholder:text-white/30 outline-none focus:outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
          />
          <div className="mx-4 h-10 w-px shrink-0 bg-white/20" />
          <input
            id="pixy-role"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Your role"
            className="w-full bg-transparent px-2 py-2 text-2xl text-text-primary placeholder:text-white/30 outline-none focus:outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white hover:text-[#1A1A24] active:scale-95 disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
            aria-label="Continue"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4 flex w-full items-center justify-between px-4">
          {onBack ? <BackButton onClick={onBack} /> : <span />}
        </div>
      </form>
    </div>
  );
}
