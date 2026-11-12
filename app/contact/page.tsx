'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* TYPES & DATA                                                       */
/* ------------------------------------------------------------------ */
interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string; // Honeypot
}

type Status = { type: 'success' | 'error'; message: string } | null;

const EMPTY_FORM: FormState = { name: '', email: '', subject: '', message: '', website: '' };
const MESSAGE_MAX = 2000;

const CONTACT_ITEMS = [
  {
    icon: Phone,
    tag: 'PHONE',
    label: '+91 867608296',
    sub: 'Mon-Fri, 9am-6pm IST',
    href: 'tel:+91867608296',
  },
  {
    icon: Mail,
    tag: 'DIRECT EMAIL',
    label: 'astragen07@gmail.com',
    sub: 'Reply within 24 hours',
    href: 'mailto:astragen07@gmail.com',
  },
  {
    icon: MapPin,
    tag: 'LOCATION',
    label: 'Kalyan (E) 421-306',
    sub: 'Maharashtra, India',
    href: undefined,
  },
] as const;

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.website.trim().length > 0) {
      setStatus({ type: 'success', message: 'Message sent successfully.' });
      setFormData(EMPTY_FORM);
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deliver message. Please try again.');
      }

      setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you shortly.' });
      setFormData(EMPTY_FORM);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error sending message. Please try again.',
      });
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50/60 dark:bg-[#090A0C] text-neutral-900 dark:text-neutral-100 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <header className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            <Sparkles className="w-3 h-3 text-neutral-500" />
            <span>Help &amp; Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Let&apos;s start a conversation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Have questions about templates, custom integrations, or pro subscriptions? Our team typically responds within 24 hours.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <section className="lg:col-span-7 bg-white dark:bg-[#121418] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-6">
              Send us a message
            </h2>

            {status && (
              <div
                role={status.type === 'error' ? 'alert' : 'status'}
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed border ${
                  status.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Ayush Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white border border-neutral-200/90 dark:border-neutral-800/90 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-2 focus:ring-neutral-400/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white border border-neutral-200/90 dark:border-neutral-800/90 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-2 focus:ring-neutral-400/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="How can we assist you?"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white border border-neutral-200/90 dark:border-neutral-800/90 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-2 focus:ring-neutral-400/15 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="message" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {formData.message.length}/{MESSAGE_MAX}
                  </span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={MESSAGE_MAX}
                  placeholder="Tell us about your project, feedback, or inquiry..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white border border-neutral-200/90 dark:border-neutral-800/90 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 focus:ring-2 focus:ring-neutral-400/15 transition-all resize-y min-h-[120px]"
                />
              </div>

              {/* Honeypot field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Contact Details & Testimonial */}
          <aside className="lg:col-span-5 space-y-4">
            {CONTACT_ITEMS.map(({ icon: Icon, tag, label, sub, href }) => {
              const content = (
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block mb-0.5">
                      {tag}
                    </span>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {label}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {sub}
                    </p>
                  </div>
                </div>
              );

              return href ? (
                <a
                  key={tag}
                  href={href}
                  className="block p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#121418] hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={tag}
                  className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#121418] shadow-xs"
                >
                  {content}
                </div>
              );
            })}

            {/* Testimonial Card */}
            <div className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#121418] shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                &ldquo;The team responded to my inquiry within hours. Extremely professional and helpful!&rdquo;
              </p>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                Yash Tak — Content Director
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
