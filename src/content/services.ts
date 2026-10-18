import {
  BadgeDollarSign,
  CalendarCheck,
  CarFront,
  CircleDot,
  ClipboardCheck,
  Disc,
  Droplets,
  FileText,
  Gauge,
  Handshake,
  KeyRound,
  MessageSquare,
  Repeat,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Every service page, the Services dropdown, the footer and the service cards
// are generated from this list. Edit text here, not in the components.
// TODO(client): review wording; nothing here states prices, warranties or certifications.

export type ServiceGroup = "sales" | "care";

export type Infographic =
  | "buying-journey"
  | "trade-value"
  | "maintenance-schedule"
  | "brake-signs"
  | "tire-tread"
  | "repair-areas"
  | "detail-packages";

export type ServiceForm = "service" | "trade-in" | "financing" | "vehicle-search";

export type Service = {
  slug: string;
  /** Hidden pages still work at their URL but are not linked anywhere and are kept out of search engines. */
  hidden?: boolean;
  name: string;
  group: ServiceGroup;
  icon: LucideIcon;
  /** One line for menus and cards */
  short: string;
  image: string;
  imageAlt: string;
  heroTitle: [string, string];
  intro: string;
  highlights: { icon: LucideIcon; title: string; text: string }[];
  /** Optional illustrated section shown between the highlights and the steps */
  infographic?: Infographic;
  process: { title: string; text: string }[];
  includes: string[];
  form: ServiceForm;
  /** Preselects the service dropdown in the booking form */
  serviceType?: string;
  cta: { label: string; href: string };
  faqs: { q: string; a: string }[];
  related: string[];
  metaTitle: string;
  metaDescription: string;
};

export const SERVICE_GROUPS: Record<ServiceGroup, { title: string; text: string }> = {
  sales: { title: "Buy & Trade", text: "Buy, trade and get help with the paperwork" },
  care: { title: "Service & Care", text: "Keep your car running and looking great" },
};

export const SERVICES: Service[] = [
  {
    slug: "car-sales",
    hidden: true,
    name: "Car Sales",
    group: "sales",
    icon: CarFront,
    short: "Quality pre-owned cars, trucks and SUVs",
    image: "/images/services/car-sales",
    imageAlt: "Customer shaking hands and receiving car keys at a dealership",
    heroTitle: ["Find Your Next", "Ride"],
    intro:
      "Shop quality pre-owned cars, trucks and SUVs at fair, upfront prices. We'll help you compare options, answer your questions and help with the paperwork, so buying your next vehicle is simple.",
    highlights: [
      { icon: Search, title: "Hand-Picked Inventory", text: "A rotating selection of pre-owned vehicles chosen for value and reliability." },
      { icon: BadgeDollarSign, title: "Upfront Pricing", text: "Clear prices on every listing so you know where you stand from the start." },
      { icon: Handshake, title: "No-Pressure Help", text: "Ask questions and take your time before you decide." },
      { icon: FileText, title: "Paperwork Help", text: "We help you with the financing paperwork." },
    ],
    infographic: "buying-journey",
    process: [
      { title: "Find Your Car", text: "Shop online or on our lot." },
      { title: "Ask Us", text: "We answer every question." },
      { title: "Paperwork", text: "We help with the forms." },
      { title: "Drive Home", text: "Your keys, your new car." },
    ],
    includes: ["Detailed vehicle listings with photos", "Friendly, no-pressure answers", "Help with financing paperwork", "Trade-ins accepted toward your purchase", "Service and detailing available after the sale"],
    form: "vehicle-search",
    cta: { label: "View Inventory", href: "/inventory" },
    faqs: [
      { q: "Do you accept trade-ins?", a: "Yes. We accept trade-ins of all makes and models and can apply the value toward your next vehicle." },
      { q: "What if I don't see the car I want?", a: "Tell us what you're looking for using the form on this page and we'll keep an eye out for it." },
      { q: "Can you help with financing?", a: "Yes. We help you with the financing paperwork and explain each form along the way." },
    ],
    related: ["financing", "trade-in", "detailing"],
    metaTitle: "Used Cars for Sale in Derry, NH",
    metaDescription: "Shop quality pre-owned cars, trucks and SUVs at Empire Auto Group in Derry, NH. Upfront pricing, help with financing paperwork and trade-ins.",
  },
  {
    slug: "financing",
    hidden: true,
    name: "Financing Paperwork",
    group: "sales",
    icon: BadgeDollarSign,
    short: "We help with the financing paperwork",
    image: "/images/services/financing",
    imageAlt: "Customer reviewing and signing financing paperwork",
    heroTitle: ["We Help With", "The Paperwork"],
    intro:
      "Financing a car shouldn't be confusing. Whether it's your first car or your fifth, we'll sit down with you, explain each form and help you get the paperwork done right.",
    highlights: [
      { icon: MessageSquare, title: "Plain-English Answers", text: "We explain every form so you know exactly what you're signing." },
      { icon: FileText, title: "Paperwork Guidance", text: "We walk you through every form, step by step." },
      { icon: ClipboardCheck, title: "Nothing Missed", text: "We check that every form is complete before you sign." },
      { icon: Timer, title: "Quick & Easy", text: "Bring your documents and we'll go through the forms together." },
    ],
    process: [
      { title: "Choose a Car", text: "Find the car that fits you." },
      { title: "Talk With Us", text: "We list what to bring." },
      { title: "Paperwork", text: "We help fill out each form." },
      { title: "Drive Home", text: "Sign, grab your keys, go." },
    ],
    includes: ["Valid driver's license", "Proof of income (recent pay stubs)", "Proof of residence (utility bill)", "Proof of insurance", "Trade-in title or payoff information, if trading"],
    form: "financing",
    cta: { label: "Ask About the Paperwork", href: "#form" },
    faqs: [
      { q: "Do I apply online?", a: "No online application is needed. Send us a message or call, and we'll go over the paperwork with you in person or by phone." },
      { q: "What should I bring?", a: "A driver's license, recent pay stubs, a utility bill showing your address and proof of insurance. If you're trading in, bring the title or payoff information." },
    ],
    related: ["car-sales", "trade-in", "oil-change"],
    metaTitle: "Help With Car Financing Paperwork in Derry, NH",
    metaDescription: "Get help with your auto financing paperwork at Empire Auto Group in Derry, NH. Every form explained in plain English.",
  },
  {
    slug: "trade-in",
    hidden: true,
    name: "Trade-In",
    group: "sales",
    icon: Repeat,
    short: "Get a fair offer on your current vehicle",
    image: "/images/services/trade-in",
    imageAlt: "Hand holding out car keys",
    heroTitle: ["What's Your Car", "Worth?"],
    intro:
      "We accept trade-ins of all makes and models, paid off or not. Tell us about your vehicle and we'll get back to you with a fair, no-obligation offer you can put toward your next car.",
    highlights: [
      { icon: ClipboardCheck, title: "Quick Request", text: "Tell us about your car in a couple of minutes." },
      { icon: Timer, title: "Fast Response", text: "We review your details and reach out with an offer." },
      { icon: KeyRound, title: "Still Owe on It?", text: "No problem. We'll help you with the payoff paperwork." },
      { icon: Repeat, title: "Trade Up", text: "Apply the value toward any vehicle on our lot." },
    ],
    infographic: "trade-value",
    process: [
      { title: "Tell Us", text: "Share your car's details." },
      { title: "Quick Look", text: "We review your vehicle." },
      { title: "Get an Offer", text: "Fair and no-obligation." },
      { title: "Trade Up", text: "Put it toward your next car." },
    ],
    includes: ["Your vehicle's title (or payoff details)", "Current registration", "All keys and remotes", "Service records, if you have them"],
    form: "trade-in",
    cta: { label: "Value My Trade", href: "#form" },
    faqs: [
      { q: "Can I trade in a car I still owe money on?", a: "Yes. Let us know what you still owe and we'll help you with the payoff paperwork as part of the deal." },
      { q: "What affects my trade-in value?", a: "Mainly mileage, overall condition, service history, how in-demand the model is, and its trim and options." },
      { q: "What should I bring?", a: "The title or payoff details, current registration, all keys and remotes, and any service records you have." },
    ],
    related: ["car-sales", "financing", "detailing"],
    metaTitle: "Trade In Your Car in Derry, NH",
    metaDescription: "Trade in your car, truck or SUV at Empire Auto Group in Derry, NH. Get a fair, no-obligation offer and put it toward your next vehicle.",
  },
  {
    slug: "oil-change",
    name: "Oil Change",
    group: "care",
    icon: Droplets,
    short: "Conventional and synthetic oil changes",
    image: "/images/services/oil-change",
    imageAlt: "Technician checking the engine oil level with a dipstick",
    heroTitle: ["Oil Changes", "Done Right"],
    intro:
      "Fresh oil is the simplest way to protect your engine. We change your oil and filter, top off fluids and take a quick look at the essentials while your car is with us.",
    highlights: [
      { icon: Droplets, title: "Conventional & Synthetic", text: "The right oil type and grade for your vehicle." },
      { icon: ShieldCheck, title: "New Oil Filter", text: "A fresh filter with every oil change." },
      { icon: Gauge, title: "Fluid Top-Off", text: "We top off essential fluids while we're under the hood." },
      { icon: ClipboardCheck, title: "Quick Check", text: "A look at tires, belts, lights and wipers." },
    ],
    infographic: "maintenance-schedule",
    process: [
      { title: "Schedule", text: "Pick a time online or call." },
      { title: "Drop Off", text: "Bring it to Empire Auto Group." },
      { title: "Service", text: "Fresh oil, filter and fluids." },
      { title: "Ready to Go", text: "We call when it's ready." },
    ],
    includes: ["Drain and replace engine oil", "New oil filter", "Fluid top-off", "Tire pressure check", "Visual check of belts, hoses, lights and wipers"],
    form: "service",
    serviceType: "Oil Change",
    cta: { label: "Book an Oil Change", href: "#form" },
    faqs: [
      { q: "How often should I change my oil?", a: "It depends on your vehicle and the oil it uses. Many cars on conventional oil need it every 3,000 to 5,000 miles, and synthetic oil can often go 7,500 to 10,000. Your owner's manual has the exact interval." },
      { q: "Synthetic or conventional?", a: "We'll use what your vehicle's manufacturer recommends. If you're not sure, ask and we'll check." },
      { q: "Do I need an appointment?", a: "Booking ahead is best so we can have you in and out. Use the form on this page or call 603-858-8844." },
    ],
    related: ["brakes", "tires", "general-repair"],
    metaTitle: "Oil Change Service in Derry, NH",
    metaDescription: "Conventional and synthetic oil changes with a new filter, fluid top-off and quick inspection at Empire Auto Group in Derry, NH.",
  },
  {
    slug: "brakes",
    name: "Brake Service",
    group: "care",
    icon: Disc,
    short: "Pads, rotors and complete brake care",
    image: "/images/services/brakes",
    imageAlt: "Technician working on a car's disc brake",
    heroTitle: ["Stop With", "Confidence"],
    intro:
      "Squealing, grinding or a soft pedal? Don't wait. We inspect your braking system and repair what's needed, so you can stop safely every time.",
    highlights: [
      { icon: Disc, title: "Pads & Rotors", text: "Replacement and resurfacing when they're worn." },
      { icon: Droplets, title: "Brake Fluid", text: "Fresh fluid keeps your pedal firm and responsive." },
      { icon: Wrench, title: "Calipers & Lines", text: "Repairs to calipers, hoses and hardware." },
      { icon: ClipboardCheck, title: "Brake Inspection", text: "We check the whole system and explain what we find." },
    ],
    infographic: "brake-signs",
    process: [
      { title: "Inspect", text: "Pads, rotors, fluid, lines." },
      { title: "Explain", text: "We show you what we found." },
      { title: "Repair", text: "Fixed only with your OK." },
      { title: "Ready to Go", text: "Road-tested for safe stops." },
    ],
    includes: ["Brake pad replacement", "Rotor replacement or resurfacing", "Brake fluid service", "Caliper and brake line repair", "Road test after service"],
    form: "service",
    serviceType: "Brakes",
    cta: { label: "Book Brake Service", href: "#form" },
    faqs: [
      { q: "How do I know my brakes need service?", a: "Common signs are squealing or grinding noises, vibration when you stop, a soft or low pedal, the car pulling to one side, or a brake warning light. The chart on this page shows what each sign can mean." },
      { q: "How often should brakes be checked?", a: "A good rule of thumb is to have them looked at every 10,000 to 12,000 miles, or any time you notice a change in how they feel or sound." },
      { q: "Is it safe to keep driving with grinding brakes?", a: "Grinding often means the pads are worn through, which can damage rotors and reduce stopping power. Have them checked as soon as possible." },
    ],
    related: ["tires", "oil-change", "general-repair"],
    metaTitle: "Brake Repair & Service in Derry, NH",
    metaDescription: "Brake inspections, pads, rotors, fluid and caliper repair at Empire Auto Group in Derry, NH. Book your brake service today.",
  },
  {
    slug: "tires",
    name: "Tires",
    group: "care",
    icon: CircleDot,
    short: "New tires, rotation, balancing and repair",
    image: "/images/services/tires",
    imageAlt: "Technician mounting a tire on a wheel",
    heroTitle: ["Tires For Every", "Season"],
    intro:
      "From New Hampshire winters to summer road trips, the right tires keep you safe. We help with new tires, rotations, balancing and flat repairs.",
    highlights: [
      { icon: CircleDot, title: "New Tires", text: "Help choosing tires that fit your car and budget." },
      { icon: Repeat, title: "Rotation", text: "Even wear for longer tire life." },
      { icon: Gauge, title: "Mount & Balance", text: "A smooth ride with no vibration." },
      { icon: Wrench, title: "Flat Repair", text: "Patch or plug when it's safe to repair." },
    ],
    infographic: "tire-tread",
    process: [
      { title: "Tire Check", text: "Tread depth and damage." },
      { title: "Your Options", text: "Repair, rotate or replace." },
      { title: "Install", text: "Mount, balance and inflate." },
      { title: "Ready to Go", text: "Smooth and safe on the road." },
    ],
    includes: ["Tread depth and sidewall check", "Tire mounting and balancing", "Tire rotation", "Flat tire repair", "Tire pressure set to spec"],
    form: "service",
    serviceType: "Tires",
    cta: { label: "Book Tire Service", href: "#form" },
    faqs: [
      { q: "When should I replace my tires?", a: "Tires are legally worn out at 2/32 of an inch of tread, but grip in rain and snow drops well before that. Many drivers replace at 4/32, especially before winter. See the tread chart on this page." },
      { q: "How often should tires be rotated?", a: "Usually every 5,000 to 7,500 miles. Many people rotate with every other oil change. Check your owner's manual." },
      { q: "Can my flat be repaired?", a: "Many punctures in the tread area can be safely repaired. Damage to the sidewall usually means the tire needs to be replaced. We'll take a look and let you know." },
    ],
    related: ["brakes", "oil-change", "general-repair"],
    metaTitle: "Tire Service in Derry, NH",
    metaDescription: "New tires, rotation, mounting, balancing and flat repair at Empire Auto Group in Derry, NH. Get ready for every New Hampshire season.",
  },
  {
    slug: "general-repair",
    name: "General Repair",
    group: "care",
    icon: Wrench,
    short: "Diagnostics and repairs, explained clearly",
    image: "/images/services/general-repair",
    imageAlt: "Mechanic working under the hood of a car",
    heroTitle: ["Repairs You Can", "Trust"],
    intro:
      "Check-engine light on? Strange noise? We diagnose the problem, explain it in plain English and fix it right, so you can get back on the road.",
    highlights: [
      { icon: Gauge, title: "Diagnostics", text: "Check-engine lights and warning codes, tracked down." },
      { icon: Wrench, title: "Suspension & Steering", text: "Clunks, rattles and pulling, fixed." },
      { icon: ShieldCheck, title: "Batteries & Electrical", text: "Starting, charging and electrical issues." },
      { icon: ClipboardCheck, title: "Clear Estimates", text: "We explain the work before we start." },
    ],
    infographic: "repair-areas",
    process: [
      { title: "Diagnose", text: "We find the root cause." },
      { title: "Estimate", text: "We explain before any work." },
      { title: "Repair", text: "Fixed with quality parts." },
      { title: "Ready to Go", text: "Tested and ready for you." },
    ],
    includes: ["Check-engine light diagnostics", "Suspension and steering repair", "Batteries, starters and alternators", "Belts, hoses and cooling system", "Exhaust and general mechanical repair"],
    form: "service",
    serviceType: "General Repair",
    cta: { label: "Book a Repair", href: "#form" },
    faqs: [
      { q: "My check-engine light is on. Is it serious?", a: "It can be anything from a loose gas cap to an engine problem. If it's flashing, stop driving and call us. If it's steady, book a diagnostic soon." },
      { q: "Will you tell me the cost before you start?", a: "Yes. We explain what we found and what it needs before doing the work." },
      { q: "What kinds of repairs do you handle?", a: "Diagnostics, suspension and steering, batteries and electrical, belts and hoses, cooling systems, exhaust and general mechanical work. Call us if you're not sure." },
    ],
    related: ["oil-change", "brakes", "tires"],
    metaTitle: "Auto Repair in Derry, NH",
    metaDescription: "Check-engine diagnostics, suspension, electrical and general auto repair at Empire Auto Group in Derry, NH. Clear explanations before any work.",
  },
  {
    slug: "detailing",
    name: "Detailing",
    group: "care",
    icon: Sparkles,
    short: "Interior and exterior detailing",
    image: "/images/services/detailing",
    imageAlt: "Car headlight being washed with foam during detailing",
    heroTitle: ["Bring Back The", "Shine"],
    intro:
      "Professional detailing inside and out. Perfect after a long New Hampshire winter, before selling your car, or just because you deserve a clean ride.",
    highlights: [
      { icon: Sparkles, title: "Interior Detail", text: "Deep clean seats, carpets, dash and every corner." },
      { icon: Droplets, title: "Exterior Detail", text: "Hand wash, decontamination and protection." },
      { icon: ShieldCheck, title: "Paint Protection", text: "Wax or sealant to protect your finish." },
      { icon: CalendarCheck, title: "Easy Booking", text: "Pick a package and a day that works for you." },
    ],
    infographic: "detail-packages",
    process: [
      { title: "Pick a Package", text: "Interior, exterior or both." },
      { title: "Drop Off", text: "Bring it in at your time." },
      { title: "Detail", text: "Cleaned, restored, protected." },
      { title: "Pick Up", text: "Enjoy that showroom shine." },
    ],
    includes: ["Deep vacuum and shampoo", "Leather clean and condition", "Hand wash and dry", "Clay bar decontamination", "Wax or sealant protection"],
    form: "service",
    serviceType: "Detailing",
    cta: { label: "Book Detailing", href: "#form" },
    faqs: [
      { q: "How long does a detail take?", a: "It depends on the package and your vehicle's condition. We'll give you a time estimate when you book." },
      { q: "Do you remove salt and winter grime?", a: "Yes. An exterior or full detail is a great way to clean up road salt after winter." },
      { q: "Is detailing worth it before selling?", a: "A clean, detailed car makes a better first impression and can help with trade-in or sale value." },
    ],
    related: ["oil-change", "general-repair", "tires"],
    metaTitle: "Car Detailing in Derry, NH",
    metaDescription: "Interior, exterior and full car detailing at Empire Auto Group in Derry, NH. Bring back the shine after a long New Hampshire winter.",
  },
];

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);

/** Services that are linked on the website (menus, footer, cards). Hidden pages are reachable by URL only. */
export const VISIBLE_SERVICES = SERVICES.filter((s) => !s.hidden);
export const VISIBLE_GROUPS = (Object.keys(SERVICE_GROUPS) as ServiceGroup[]).filter((g) => VISIBLE_SERVICES.some((s) => s.group === g));
export const serviceHref = (s: Pick<Service, "slug">) => `/services/${s.slug}`;
