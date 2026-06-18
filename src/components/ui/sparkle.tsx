import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
};

export function Sparkle({ className, size = 12 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
      className={cn("inline-block shrink-0", className)}
    >
      <path d="M6 0 C6.28 2.8 3.8 5.28 1 5.28 L0 5.28 C0 5.28 0 6 0 6 C2.8 6 5.28 8.5 5.28 11 L5.28 12 C5.28 12 6 12 6 12 C6 9.2 8.5 6.72 11 6.72 L12 6.72 C12 6.72 12 6 12 6 C9.2 6 6.72 3.5 6.72 1 L6.72 0 Z" />
    </svg>
  );
}

export function SectionEyebrow({
  children,
  className,
  light = false,
}: {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] mb-4",
        light ? "text-[var(--ff-gold)]" : "text-[var(--ff-gold)]",
        className
      )}
    >
      <Sparkle size={10} className="text-[var(--ff-gold)]" />
      {children}
    </p>
  );
}
