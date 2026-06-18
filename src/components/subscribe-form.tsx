"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email("Valid email required") });
type FormData = z.infer<typeof schema>;

type Props = { compact?: boolean; dark?: boolean };

export default function SubscribeForm({ compact, dark }: Props) {
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
      <Input
        id="sub-email"
        type="email"
        placeholder="Email Address"
        autoComplete="email"
        aria-invalid={!!errors.email}
        {...register("email")}
        className={dark
          ? "rounded-[11px] border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.15)] text-white placeholder:text-[rgba(255,255,255,0.5)] focus-visible:border-[var(--ff-gold)] focus-visible:ring-0 transition-colors"
          : "rounded-[11px] border-[rgba(36,55,70,.14)] bg-[#FBF8F2] focus-visible:border-[var(--ff-gold)] focus-visible:ring-0 transition-colors"
        }
      />
      {errors.email && (
        <p className="text-xs text-destructive">{errors.email.message}</p>
      )}
      {/* Honeypot */}
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 rounded-full bg-[var(--ff-gold)] text-[var(--ff-blue)] font-bold text-[15px] hover:bg-[#A8854B] disabled:opacity-60 transition-colors duration-200 active:scale-[0.975]"
      >
        {isSubmitting ? "Signing up…" : "Get the Daily Devotional"}
      </button>
    </form>
  );
}
