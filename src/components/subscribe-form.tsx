"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email("Valid email required") });
type FormData = z.infer<typeof schema>;

type Props = { compact?: boolean };

export default function SubscribeForm({ compact }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("You're in! Check your inbox for the first devotional.");
      reset();
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={compact ? "space-y-2" : "space-y-3"}>
      {!compact && (
        <Label htmlFor="sub-email" className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)]">
          Email address
        </Label>
      )}
      <Input
        id="sub-email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        aria-invalid={!!errors.email}
        {...register("email")}
        className="rounded-input border-[var(--line)] focus-visible:border-[var(--ff-gold)] focus-visible:ring-0"
      />
      {errors.email && (
        <p className="text-xs text-destructive">{errors.email.message}</p>
      )}
      {/* Honeypot */}
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-6 rounded-full bg-[var(--ff-gold)] text-[var(--ff-blue)] font-semibold text-sm hover:bg-[var(--gold-700)] disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? "Signing up…" : "Get the Daily Devotional"}
      </button>
    </form>
  );
}
