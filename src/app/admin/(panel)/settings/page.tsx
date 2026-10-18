import Link from "next/link";
import { CircleAlert, CircleCheck, KeyRound, Mail, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getMailSettings } from "@/lib/settings";
import { emailReady } from "@/lib/mail";
import { AdminHeader } from "@/components/admin/ui";
import { AddAdminForm, ChangePasswordForm, MailSettingsForm, RemoveAdminButton } from "@/components/admin/SettingsForms";

export const metadata = { title: "Settings" };

const TABS = [
  { key: "email", label: "Lead Emails", icon: Mail, text: "Get an email for every website form" },
  { key: "account", label: "My Account", icon: KeyRound, text: "Your login and password" },
  { key: "team", label: "Team Members", icon: Users, text: "Who else can sign in" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireAdmin();
  const requested = (await searchParams).tab;
  const tab: Tab = TABS.some((t) => t.key === requested) ? (requested as Tab) : "email";

  const [admins, mail, ready] = await Promise.all([
    db.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, createdAt: true } }),
    getMailSettings(),
    emailReady(),
  ]);

  return (
    <>
      <AdminHeader title="Settings" subtitle="Everything here is optional. The website works without changing anything." />

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        {/* Tabs */}
        <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col" aria-label="Settings sections">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                href={`/admin/settings?tab=${t.key}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl border p-3 transition lg:p-4 ${
                  active ? "border-gold bg-surface shadow-[0_8px_24px_-16px_rgb(0_0_0/0.3)]" : "border-transparent hover:bg-surface"
                }`}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-gold text-black" : "bg-surface-3 text-muted"}`}>
                  <t.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text">{t.label}</span>
                  <span className="hidden text-xs text-muted lg:block">{t.text}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">
          {tab === "email" && (
            <section className="card p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="font-display text-xl uppercase text-text">Lead Emails</h2>
                  <p className="mt-1 max-w-xl text-sm text-muted">
                    When someone fills out a form on the website (a question, trade-in or service request), we email it to you right away. Every lead
                    is also saved on the{" "}
                    <Link href="/admin/leads" className="font-semibold text-gold-ink hover:underline">
                      Leads
                    </Link>{" "}
                    page either way.
                  </p>
                </div>
                {ready ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success">
                    <CircleCheck className="size-4" /> Email is on
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-sm font-semibold text-gold-ink">
                    <CircleAlert className="size-4" /> Not set up yet
                  </span>
                )}
              </div>
              <MailSettingsForm
                defaults={{
                  notifyEmail: mail.notifyEmail,
                  smtpHost: mail.smtpHost,
                  smtpPort: mail.smtpPort,
                  smtpUser: mail.smtpUser,
                  smtpFrom: mail.smtpFrom,
                  hasPass: Boolean(mail.smtpPass),
                }}
              />
            </section>
          )}

          {tab === "account" && (
            <section className="card p-6 sm:p-8">
              <h2 className="font-display text-xl uppercase text-text">My Account</h2>
              <dl className="mt-5 grid gap-4 rounded-xl bg-surface-2 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="mt-0.5 font-semibold text-text">{me.name}</dd>
                </div>
                <div>
                  <dt className="text-muted">Login email</dt>
                  <dd className="mt-0.5 font-semibold text-text">{me.email}</dd>
                </div>
              </dl>
              <h3 className="mt-8 font-semibold text-text">Change password</h3>
              <p className="mt-1 text-sm text-muted">Use at least 10 characters. You&apos;ll stay signed in on this device.</p>
              <div className="max-w-md">
                <ChangePasswordForm />
              </div>
            </section>
          )}

          {tab === "team" && (
            <section className="card p-6 sm:p-8">
              <h2 className="font-display text-xl uppercase text-text">Team Members</h2>
              <p className="mt-1 text-sm text-muted">Everyone listed here can sign in to this admin to manage cars and leads.</p>
              <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
                {admins.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-gold-ink">
                        {a.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-text">
                          {a.name}
                          {a.id === me.id && <span className="ml-2 rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium text-muted">You</span>}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {a.email} · added {formatDate(a.createdAt)}
                        </p>
                      </div>
                    </div>
                    {a.id !== me.id && admins.length > 1 && <RemoveAdminButton id={a.id} name={a.name} />}
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 font-semibold text-text">Add a team member</h3>
              <p className="mt-1 text-sm text-muted">Give them a temporary password. They can change it under My Account after signing in.</p>
              <AddAdminForm />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
