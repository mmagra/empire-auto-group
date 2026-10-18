import type { Metadata } from "next";
import { fullAddress, site } from "@/config/site";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

// TODO(client): have the business review this policy before launch.
export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="container-x max-w-3xl py-16">
        <div className="space-y-8 leading-relaxed text-text/80 [&_h2]:font-display [&_h2]:text-lg [&_h2]:uppercase [&_h2]:text-gold-ink">
          <p className="text-sm text-muted">Last updated: October 17, 2026</p>
          <p>
            {site.legalName} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what information we collect through this
            website and how we use it.
          </p>
          <div>
            <h2>Information we collect</h2>
            <p className="mt-2">
              When you submit a form (contact, vehicle inquiry, trade-in or service request) we collect the details you provide, such as
              your name, phone number, email address, vehicle information and message. We also keep basic technical logs (like IP address and browser
              type) to protect the site from spam and abuse.
            </p>
          </div>
          <div>
            <h2>How we use it</h2>
            <p className="mt-2">
              We use your information only to respond to your request, schedule appointments, prepare trade-in offers, help with your vehicle purchase
              and improve our service. We do not sell your personal information.
            </p>
          </div>
          <div>
            <h2>Sharing</h2>
            <p className="mt-2">
              If you ask for help with financing paperwork, we use the details you give us only to help you complete that paperwork, and share them only with your permission to process your
              request. We may also share information when required by law.
            </p>
          </div>
          <div>
            <h2>Cookies & third parties</h2>
            <p className="mt-2">
              This site uses only essential cookies. Pages that show a map load content from Google Maps, which is subject to Google&apos;s privacy
              policy.
            </p>
          </div>
          <div>
            <h2>Your choices</h2>
            <p className="mt-2">
              To ask what information we hold about you, or to have it corrected or deleted, contact us at{" "}
              <a href={site.phoneHref} className="text-gold-ink">
                {site.phone}
              </a>{" "}
              or visit us at {fullAddress}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
