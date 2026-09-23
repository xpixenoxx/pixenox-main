interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = "Back" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-text-muted transition-colors hover:text-text-primary"
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}
