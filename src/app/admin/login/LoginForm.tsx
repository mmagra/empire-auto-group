"use client";

import { startTransition, useActionState } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { login, setupFirstAdmin, type FormState } from "../actions";

/** Dispatch manually so React doesn't clear the typed fields when the action fails. */
const submitWith = (action: (fd: FormData) => void) => (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  startTransition(() => action(fd));
};

function ErrorBox({ state }: { state: FormState }) {
  if (!state || state.ok) return null;
  return (
    <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
      {state.message}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);

  return (
    <form className="space-y-4" onSubmit={submitWith(action)}>
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <ErrorBox state={state} />
      <button className="btn btn-gold w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />} Sign In
      </button>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(setupFirstAdmin, null);
  const fields = [
    ["name", "Your name", "text", "name"],
    ["email", "Email", "email", "username"],
    ["password", "Password (10+ characters)", "password", "new-password"],
    ["confirm", "Confirm password", "password", "new-password"],
  ] as const;

  return (
    <form className="space-y-4" onSubmit={submitWith(action)}>
      {fields.map(([name, label, type, ac]) => (
        <div key={name}>
          <label className="label" htmlFor={`setup-${name}`}>
            {label}
          </label>
          <input id={`setup-${name}`} name={name} type={type} autoComplete={ac} required className="input" aria-invalid={!!state?.errors?.[name]} />
          {state?.errors?.[name] && <p className="mt-1 text-xs text-danger">{state.errors[name]}</p>}
        </div>
      ))}
      <ErrorBox state={state} />
      <button className="btn btn-gold w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create Admin Account
      </button>
    </form>
  );
}
