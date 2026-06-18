import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out to Fisherman's Fellowship — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-[var(--ff-blue)] text-[var(--ff-cream)] pt-20 pb-16">
        <div className="max-w-content mx-auto px-5">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            ✦ Get in Touch
          </p>
          <h1
            className="font-display leading-tight"
            style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
          >
            Contact Us
          </h1>
        </div>
      </section>

      <div className="max-w-content mx-auto px-5 py-16 grid md:grid-cols-2 gap-16">
        {/* Form */}
        <div>
          <h2 className="font-display text-2xl text-[var(--ink)] mb-2">Send a message</h2>
          <p className="text-[var(--ink-soft)] mb-8 leading-relaxed">
            We&apos;d love to hear from you — reach out anytime. Whether you want to get
            connected, have a question, or just want to say hello, we&apos;re here.
          </p>
          <ContactForm />
        </div>

        {/* Info */}
        <div className="space-y-8 pt-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-3">
              ✦ Ministry
            </p>
            <p className="font-display text-xl text-[var(--ink)] mb-1">
              Fisherman&apos;s Fellowship
            </p>
            <p className="text-[var(--ink-soft)] text-sm leading-relaxed">
              Brotherhood on the water — and beyond. We&apos;re here to connect, encourage,
              and grow together in faith.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)] mb-2">
              Follow along
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              Stay connected through our blog, daily devotionals, and upcoming events.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
