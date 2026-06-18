"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name:    z.string().min(1, "Name required"),
  email:   z.string().email("Valid email required"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Message sent — we'll be in touch soon.");
      reset();
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  const fieldClass =
    "rounded-input border-[var(--line)] bg-[var(--paper)] focus-visible:border-[var(--ff-gold)] focus-visible:ring-0";
  const labelClass =
    "text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="cf-name" className={labelClass}>Name</Label>
          <Input id="cf-name" autoComplete="name" {...register("name")} className={fieldClass} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email" className={labelClass}>Email</Label>
          <Input id="cf-email" type="email" autoComplete="email" {...register("email")} className={fieldClass} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-subject" className={labelClass}>Subject (optional)</Label>
        <Input id="cf-subject" {...register("subject")} className={fieldClass} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-message" className={labelClass}>Message</Label>
        <Textarea id="cf-message" rows={6} {...register("message")} className={fieldClass} />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>
      {/* Honeypot */}
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-8 py-3 rounded-full bg-[var(--ff-blue)] text-[var(--ff-cream)] font-semibold text-sm hover:bg-[var(--blue-900)] disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? "Sending…" : "Send a message"}
      </button>
    </form>
  );
}
