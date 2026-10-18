"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { submitLead, type LeadFormState } from "@/app/actions/leads";
import type { LeadType } from "@/lib/constants";
import { site } from "@/config/site";

type Props = {
  type: LeadType;
  vehicleId?: string;
  submitLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  defaultMessage?: string;
  /** Extra fields. Name them d_<key> so they are saved as lead details. */
  children?: React.ReactNode;
  compact?: boolean;
};

export function LeadForm({
  type,
  vehicleId,
  submitLabel = "Send Message",
  messageLabel = "Message",
  messagePlaceholder = "How can we help?",
  defaultMessage,
  children,
  compact = false,
}: Props) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, null);
  // Time the form appeared, sent with each submit so the server can reject instant bot posts.
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-gold/40 bg-gold/5 p-8 text-center" role="status">
        <CheckCircle2 className="size-10 text-gold-ink" />
        <p className="font-display text-xl uppercase text-text">Request Received</p>
        <p className="max-w-sm text-sm text-muted">{state.message}</p>
        <p className="text-sm text-muted">
          Need us sooner? Call{" "}
          <a href={site.phoneHref} className="font-semibold text-gold-ink">
            {site.phone}
          </a>
        </p>
      </div>
    );
  }

  const err = (k: string) => state?.errors?.[k];

  return (
    <form
      className="relative space-y-4"
      onSubmit={(e) => {
        // Dispatch manually so React doesn't reset the fields when validation fails.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("_ts", String(startedAt.current));
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="type" value={type} />
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label className="label" htmlFor={`${type}-name`}>
            Full name *
          </label>
          <input id={`${type}-name`} name="name" autoComplete="name" className="input" required aria-invalid={!!err("name")} />
          {err("name") && <p className="mt-1 text-xs text-danger">{err("name")}</p>}
        </div>
        <div>
          <label className="label" htmlFor={`${type}-phone`}>
            Phone
          </label>
          <input
            id={`${type}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="input"
            placeholder="(603) 555-0123"
            aria-invalid={!!err("phone")}
          />
          {err("phone") && <p className="mt-1 text-xs text-danger">{err("phone")}</p>}
        </div>
        <div>
          <label className="label" htmlFor={`${type}-email`}>
            Email
          </label>
          <input id={`${type}-email`} name="email" type="email" autoComplete="email" className="input" aria-invalid={!!err("email")} />
          {err("email") && <p className="mt-1 text-xs text-danger">{err("email")}</p>}
        </div>
      </div>

      {children}

      <div>
        <label className="label" htmlFor={`${type}-message`}>
          {messageLabel}
        </label>
        <textarea
          id={`${type}-message`}
          name="message"
          rows={compact ? 3 : 4}
          className="input resize-y"
          placeholder={messagePlaceholder}
          defaultValue={defaultMessage}
        />
      </div>

      {state && !state.ok && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <button type="submit" className="btn btn-gold w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        {pending ? "Sending…" : submitLabel}
      </button>
      <p className="text-center text-xs text-subtle">
        We&apos;ll only use your info to respond to this request. See our{" "}
        <a href="/privacy" className="underline hover:text-gold-ink">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
