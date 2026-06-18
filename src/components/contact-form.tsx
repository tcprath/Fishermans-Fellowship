"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    "rounded-[11px] border-[rgba(36,55,70,.14)] bg-[#FBF8F2] focus-visible:border-[var(--ff-gold)] focus-visible:ring-0 transition-colors placeholder:text-[#9FAEBA]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Input id="cf-name" autoComplete="name" placeholder="Your name" {...register("name")} className={fieldClass} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Input id="cf-email" type="email" autoComplete="email" placeholder="Email address" {...register("email")} className={fieldClass} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <Input id="cf-subject" placeholder="Subject (optional)" {...register("subject")} className={fieldClass} />
      </div>
      <div>
        <Textarea id="cf-message" rows={6} placeholder="Prayer requests, Questions, or Comments" {...register("message")} className={fieldClass} />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
      </div>
      {/* Honeypot */}
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send a message"}
      </button>
    </form>
  );
}
