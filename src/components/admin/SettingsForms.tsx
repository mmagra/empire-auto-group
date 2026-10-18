"use client";

import { startTransition, useActionState, useEffect, useRef, useTransition } from "react";
import { LoaderCircle, Save, Send, Trash2, UserPlus } from "lucide-react";
import { addAdmin, changePassword, removeAdmin, saveMailSettings, type FormState } from "@/app/admin/actions";

function Result({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`} role={state.ok ? "status" : "alert"}>
      {state.message}
    </p>
  );
}

function useResetOnSuccess(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

type MailDefaults = { notifyEmail: string; smtpHost: string; smtpPort: number; smtpUser: string; smtpFrom: string; hasPass: boolean };

export function MailSettingsForm({ defaults }: { defaults: MailDefaults }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveMailSettings, null);
  const err = (k: string) => state?.errors?.[k];
  const step = (n: number, title: string, text: React.ReactNode) => (
    <div className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold font-display text-sm text-black">{n}</span>
      <div>
        <p className="font-semibold text-text">{title}</p>
        <p className="text-sm text-muted">{text}</p>
      </div>
    </div>
  );

  return (
    <form
      className="mt-8 space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (submitter?.value) fd.set("intent", submitter.value);
        startTransition(() => action(fd));
      }}
    >
      {/* Step 1 */}
      <div className="space-y-4">
        {step(1, "Where should leads go?", "The inbox that receives new leads. Add more than one by separating them with commas.")}
        <div className="sm:pl-10">
          <input
            id="m-notify"
            name="leadNotifyEmail"
            type="text"
            aria-label="Send new leads to"
            defaultValue={defaults.notifyEmail}
            className="input"
            placeholder="owner@example.com"
          />
          {err("leadNotifyEmail") && <p className="mt-1 text-xs text-danger">{err("leadNotifyEmail")}</p>}
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-4">
        {step(
          2,
          "Which email account sends them?",
          <>
            In Hostinger go to <span className="font-semibold text-text">Emails → Create email account</span> (for example <span className="font-semibold text-text">leads@yourdomain.com</span>), then
            enter that address and its password here.
          </>,
        )}
        <div className="grid gap-4 sm:grid-cols-2 sm:pl-10">
          <div>
            <label className="label" htmlFor="m-user">
              Email address
            </label>
            <input id="m-user" name="smtpUser" type="email" defaultValue={defaults.smtpUser} autoComplete="off" className="input" placeholder="leads@yourdomain.com" />
          </div>
          <div>
            <label className="label" htmlFor="m-pass">
              Email password
            </label>
            <input
              id="m-pass"
              name="smtpPass"
              type="password"
              autoComplete="new-password"
              className="input"
              placeholder={defaults.hasPass ? "Saved. Leave blank to keep it" : "Password for that email"}
            />
          </div>
          <details className="group sm:col-span-2">
            <summary className="cursor-pointer list-none text-sm font-semibold text-muted hover:text-gold-ink [&::-webkit-details-marker]:hidden">
              <span className="inline-block transition group-open:rotate-90">›</span> Advanced (only if you don&apos;t use Hostinger email)
            </summary>
            <div className="mt-4 grid gap-4 rounded-xl bg-surface-2 p-4 sm:grid-cols-[1fr_8rem]">
              <div>
                <label className="label" htmlFor="m-host">
                  Mail server (SMTP)
                </label>
                <input id="m-host" name="smtpHost" defaultValue={defaults.smtpHost} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="m-port">
                  Port
                </label>
                <input id="m-port" name="smtpPort" defaultValue={defaults.smtpPort} inputMode="numeric" className="input" />
                {err("smtpPort") && <p className="mt-1 text-xs text-danger">{err("smtpPort")}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="m-from">
                  Sender name shown in the inbox
                </label>
                <input id="m-from" name="smtpFrom" defaultValue={defaults.smtpFrom} className="input" placeholder="Empire Auto Group <leads@yourdomain.com>" />
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="space-y-3 border-t border-line pt-6">
        <Result state={state} />
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-gold" name="intent" value="test" disabled={pending}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} Save & Send Test Email
          </button>
          <button className="btn btn-ghost" name="intent" value="save" disabled={pending}>
            <Save className="size-4" /> Save Only
          </button>
        </div>
        <p className="text-xs text-subtle">The test email goes to the address in step 1. If it doesn&apos;t arrive within a minute, check the spam folder.</p>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, null);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="mt-5 space-y-4">
      {(
        [
          ["current", "Current password", "current-password"],
          ["next", "New password (10+ characters)", "new-password"],
          ["confirm", "Confirm new password", "new-password"],
        ] as const
      ).map(([name, label, ac]) => (
        <div key={name}>
          <label className="label" htmlFor={`pw-${name}`}>
            {label}
          </label>
          <input id={`pw-${name}`} name={name} type="password" autoComplete={ac} required className="input" />
          {state?.errors?.[name] && <p className="mt-1 text-xs text-danger">{state.errors[name]}</p>}
        </div>
      ))}
      <Result state={state} />
      <button className="btn btn-gold btn-sm" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" />} Update Password
      </button>
    </form>
  );
}

export function AddAdminForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addAdmin, null);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["name", "Name", "text", "off", "Jane Smith"],
            ["email", "Login email", "email", "off", "jane@example.com"],
            ["password", "Temporary password", "password", "new-password", "10+ characters"],
          ] as const
        ).map(([name, label, type, ac, ph]) => (
          <div key={name}>
            <label className="label" htmlFor={`aa-${name}`}>
              {label}
            </label>
            <input id={`aa-${name}`} name={name} type={type} placeholder={ph} autoComplete={ac} required className="input" />
            {state?.errors?.[name] && <p className="mt-1 text-xs text-danger">{state.errors[name]}</p>}
          </div>
        ))}
      </div>
      <Result state={state} />
      <button className="btn btn-gold" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Add Team Member
      </button>
    </form>
  );
}

export function RemoveAdminButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm(`Remove ${name}'s admin access?`) && start(() => removeAdmin(id))}
      className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-danger"
    >
      <Trash2 className="size-4" /> Remove
    </button>
  );
}
