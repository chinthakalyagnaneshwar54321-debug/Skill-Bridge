import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import heroCollab from "@/assets/skillbridge-hero.png.asset.json";
import InteractiveBackground from "@/components/InteractiveBackground";
import {
  ArrowRight,
  Sparkles,
  Users,
  Repeat,
  Search,
  Star,
  MessageSquare,
  ShieldCheck,
  Trophy,
  Code2,
  Palette,
  Brain,
  Rocket,
  Cloud,
  Mic,
  ChevronDown,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Menu,
  X,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillBridge — Student Skill Exchange Platform" },
      { name: "description", content: "Discover students to learn from, share your skills, and build meaningful peer-to-peer exchanges." },
      { property: "og:title", content: "SkillBridge — Student Skill Exchange Platform" },
      { property: "og:description", content: "Teach a skill, learn a skill, and grow together with SkillBridge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Repeat, title: "Skill Swap, Not Pay", desc: "Teach what you know, learn what you want — no fees, no subscriptions." },
  { icon: Users, title: "Student Community", desc: "Connect with peers from your college, branch, and beyond." },
  { icon: Search, title: "Smart Discovery", desc: "Filter by category, college, branch or search by student name." },
  { icon: MessageSquare, title: "Exchange Requests", desc: "Send, accept and manage 1-on-1 skill exchange requests." },
  { icon: Star, title: "Ratings & Reviews", desc: "Build a trusted profile with peer reviews after each exchange." },
  { icon: ShieldCheck, title: "Secure & Verified", desc: "JWT-secured accounts and moderated by admins to keep it real." },
];

const categories = [
  { icon: Code2, name: "Programming", color: "from-blue-500 to-indigo-500" },
  { icon: Rocket, name: "Web Development", color: "from-fuchsia-500 to-pink-500" },
  { icon: Brain, name: "AI & ML", color: "from-emerald-500 to-teal-500" },
  { icon: Palette, name: "UI/UX Design", color: "from-orange-500 to-rose-500" },
  { icon: Cloud, name: "Cloud Computing", color: "from-sky-500 to-cyan-500" },
  { icon: Mic, name: "Public Speaking", color: "from-violet-500 to-purple-500" },
];

const steps = [
  { n: "01", title: "Create Your Profile", desc: "Add your college, branch, skills you offer and skills you want to learn." },
  { n: "02", title: "Discover a Match", desc: "Browse students, filter by skill or category, and find your perfect swap." },
  { n: "03", title: "Send a Request", desc: "Propose an exchange. Once accepted, plan sessions on your terms." },
  { n: "04", title: "Learn & Review", desc: "Complete the exchange, rate each other and grow your reputation." },
];


const faqs = [
  { q: "Is SkillBridge really free?", a: "Yes. SkillBridge runs on skill exchange, not money. You teach a skill and learn one in return." },
  { q: "Who can join?", a: "Any student with a valid college email can create a profile and start exchanging skills." },
  { q: "How are exchanges organized?", a: "Once a request is accepted, you and your partner decide the schedule, format (online/offline) and duration." },
  { q: "What if someone doesn't show up?", a: "You can rate and review each partner. Repeat offenders are flagged and removed by admins." },
  { q: "Can I teach more than one skill?", a: "Absolutely. Add as many skills as you like — the more you offer, the more matches you get." },
];


function Landing() {
  return (
    <div className="relative min-h-screen text-foreground">
      <InteractiveBackground />
      <Nav />
      <Hero />
      <Features />
      <Categories />
      <HowItWorks />
      <Benefits />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it Works" },
    { href: "#benefits", label: "Benefits" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">SkillBridge</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/auth" search={{ mode: "login" }} className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted">
            Log in
          </Link>
          <Link to="/auth" search={{ mode: "signup" }} className="rounded-lg bg-gradient-hero px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90">
            Join Free
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                {l.label}
              </a>
            ))}
            <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-gradient-hero px-4 py-2 text-center text-sm font-semibold text-white">Join Free</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-hero opacity-20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--foreground)_10%,transparent)_1px,transparent_0)] [background-size:32px_32px] opacity-40" />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" />
            Peer-to-peer learning, reimagined
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Teach a skill. <br />
            <span className="text-gradient">Learn a skill.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            SkillBridge connects students who want to swap knowledge — no fees, no subscriptions.
            Just a smarter way to level up together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90">
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/browse" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-card transition hover:bg-muted">
              Browse Skills
            </Link>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <HeroPreview />
        </motion.div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative rounded-3xl border border-border bg-card p-3 shadow-glow">
      <div className="flex items-center gap-1.5 px-3 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
      </div>
      <div className="overflow-hidden rounded-2xl">
        <img
          src={heroCollab.url}
          alt="Indian students learning together around a laptop"
          width={1600}
          height={940}
          className="h-auto w-full object-cover"
        />
      </div>
      <div className="mt-3 grid gap-3 rounded-2xl bg-gradient-soft p-6 md:grid-cols-3">
        {[
          { name: "Priya S.", skill: "Teaches React", want: "Learns Figma", color: "from-blue-500 to-indigo-600" },
          { name: "Arjun K.", skill: "Teaches Python", want: "Learns Public Speaking", color: "from-fuchsia-500 to-purple-600" },
          { name: "Meera J.", skill: "Teaches UI/UX", want: "Learns C++", color: "from-teal-500 to-emerald-600" },
        ].map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${p.color} text-sm font-bold text-white`}>
                {p.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">Engineering Student</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <Check className="h-3.5 w-3.5 text-[color:var(--accent-teal)]" />
                <span className="font-medium">{p.skill}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-2)]" />
                <span className="font-medium">{p.want}</span>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg bg-gradient-hero py-2 text-xs font-semibold text-white transition hover:opacity-90">
              Send Request
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--brand-2)]">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to swap skills"
        sub="A modern platform built for students, by students — designed to make peer learning effortless."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero shadow-glow transition group-hover:scale-110">
              <f.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="bg-gradient-soft py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Popular Categories" title="Skill swapping" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Link key={c.name} to="/category/$slug" params={{ slug: categorySlug(c.name) }} className="block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="cursor-pointer rounded-2xl border border-border bg-card p-5 text-center shadow-card"
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color}`}>
                <c.icon className="h-6 w-6 text-white" />
              </div>
              <div className="mt-3 text-sm font-semibold">{c.name}</div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function categorySlug(name: string) {
  const slugs: Record<string, string> = {
    "Programming": "programming",
    "Web Development": "web-development",
    "AI & ML": "ai-ml",
    "UI/UX Design": "ui-ux",
    "Cloud Computing": "cloud",
    "Public Speaking": "public-speaking",
  };
  return slugs[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading eyebrow="How it Works" title="From sign-up to swap in 4 steps" />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="text-5xl font-black text-gradient opacity-80">{s.n}</div>
            <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: Trophy, title: "Learn Faster", desc: "1-on-1 peer sessions beat 10-hour video courses." },
    { icon: Users, title: "Build Network", desc: "Grow real connections across colleges and branches." },
    { icon: ShieldCheck, title: "Zero Cost", desc: "Skill for skill — never pay a rupee to learn." },
    { icon: Rocket, title: "Boost Your CV", desc: "Verified reviews prove real teaching experience." },
  ];
  return (
    <section id="benefits" className="bg-gradient-soft py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Benefits" title="Why students love SkillBridge" />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-card"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
                <b.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-4 font-bold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-gradient-soft py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5 text-sm text-muted-foreground"
                >
                  {f.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 shadow-glow md:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <div className="text-white">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Ready to start swapping?</h2>
              <p className="mt-3 text-white/85">
                Join thousands of students already learning smarter with SkillBridge. It takes less than a minute.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
                <Mail className="h-4 w-4" />
                hello@skillbridge.app
              </div>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-3 rounded-2xl bg-white/10 p-6 backdrop-blur-md"
            >
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-lg bg-white/95 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-white"
              />
              <input
                type="email"
                placeholder="College email"
                className="w-full rounded-lg bg-white/95 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-white"
              />
              <textarea
                placeholder="Tell us what you'd like to learn"
                rows={3}
                className="w-full rounded-lg bg-white/95 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-white"
              />
              <button className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background transition hover:opacity-90">
                Join SkillBridge
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">SkillBridge</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The student skill exchange platform. Teach. Learn. Grow — together.
          </p>
          <div className="mt-5 flex gap-3">
            {[Github, Linkedin, Twitter].map((I, i) => (
              <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition hover:bg-muted">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Product", items: ["Features", "How it Works", "Categories", "Dashboard"] },
          { title: "Company", items: ["About", "Blog", "Careers", "Contact"] },
          { title: "Legal", items: ["Privacy", "Terms", "Cookies", "Security"] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-sm font-bold">{col.title}</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.items.map((i) => (
                <li key={i}>
                  <a href="#" className="transition hover:text-foreground">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SkillBridge. Built for students, by students.
      </div>
    </footer>
  );
}
