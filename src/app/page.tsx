import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Section, TopicList, BulletCard } from "@/components/marketing/Section";
import { BRAND } from "@/content/brand";
import {
  accessSteps,
  biasTopics,
  curriculumBlocks,
  entryFrameworkTopics,
  liquidityTopics,
  marketStructureTopics,
  mtfTopics,
  poiTopics,
  problemSolvingQuestions,
  rangeLevelTopics,
  whyIctPlusPillars,
  whyIctPlusQuestions,
} from "@/content/ict-plus";

export const metadata: Metadata = {
  title: BRAND.meta.defaultTitle,
  description: BRAND.meta.defaultDescription,
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_60%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              {BRAND.program}
            </p>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Become The Hunter
              <br />
              <span className="gradient-text">In The Market</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400 leading-relaxed">
              Master ICT Concepts, Market Structure, Bias, POI Selection, Range Levels and
              Precision Entries. Learn how professional traders identify high-probability setups
              and avoid common ICT mistakes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="btn-primary px-8 py-3 text-lg">
                Join ICT+ Mentorship
              </Link>
              <Link href="/mentorship" className="btn-secondary px-8 py-3 text-lg">
                View Curriculum
              </Link>
            </div>
          </div>
        </section>

        {/* Why ICT+ */}
        <Section
          id="why-ict-plus"
          title="Why"
          highlight="ICT+ ?"
          subtitle="ICT+ was created to solve common problems traders face while learning ICT — when concepts work in one context and fail in another."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10">
            {whyIctPlusQuestions.map((q) => (
              <BulletCard key={q}>
                <span className="text-gray-300">{q}</span>
              </BulletCard>
            ))}
          </div>
          <p className="mb-6 max-w-3xl text-gray-400">
            ICT+ combines structured frameworks to improve decision making — not isolated concepts
            applied without context:
          </p>
          <div className="flex flex-wrap gap-3">
            {whyIctPlusPillars.map((pillar) => (
              <span
                key={pillar}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-gray-300"
              >
                {pillar}
              </span>
            ))}
          </div>
        </Section>

        {/* ICT+ Framework */}
        <Section
          bordered
          title="The"
          highlight="ICT+ Framework"
          subtitle="ICT+ focuses on solving real execution problems traders face — advanced structure and bias alignment across timeframes."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <TopicList title="Advanced Market Structure" items={marketStructureTopics} />
            <TopicList title="Bias Framework" items={biasTopics} />
          </div>
        </Section>

        {/* POI Framework */}
        <Section
          title="Point of Interest"
          highlight="Framework"
          subtitle="Students learn how to identify quality POIs and avoid phantom POIs that often lead to poor entries."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {poiTopics.map((topic) => (
              <div key={topic} className="glass-card p-5 text-sm text-gray-300">
                <span className="text-profit mr-2">✓</span>
                {topic}
              </div>
            ))}
          </div>
        </Section>

        {/* Liquidity + POI */}
        <Section
          bordered
          title="Liquidity +"
          highlight="POI Integration"
          subtitle="ICT+ combines liquidity analysis with Points of Interest. The goal is to understand WHY price reacts from certain locations — not to blindly trade every concept."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liquidityTopics.map((topic) => (
              <div key={topic} className="glass-card p-5 text-sm text-gray-300">
                <span className="text-profit mr-2">✓</span>
                {topic}
              </div>
            ))}
          </div>
        </Section>

        {/* Curriculum */}
        <Section
          id="curriculum"
          title="What You Will"
          highlight="Learn"
          subtitle="A structured ICT+ curriculum covering market structure, bias, POIs, blocks, gaps, entries, range levels and multi-timeframe analysis."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {curriculumBlocks.map((block) => (
              <TopicList key={block.title} title={block.title} items={block.items} />
            ))}
          </div>
        </Section>

        {/* Entry Framework */}
        <Section
          bordered
          title="Entry"
          highlight="Framework"
          subtitle="Precision entries aligned with structure, bias and POI confluence."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entryFrameworkTopics.map((topic) => (
              <div key={topic} className="rounded-lg border border-surface-border bg-surface-card/50 px-4 py-3 text-sm text-gray-300">
                {topic}
              </div>
            ))}
          </div>
        </Section>

        {/* Range Levels */}
        <Section
          title="Range Levels +"
          highlight="ICT"
          subtitle="ICT+ combines ICT concepts with Range Levels to improve entry precision and trade context."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rangeLevelTopics.map((topic) => (
              <div key={topic} className="glass-card p-5 text-sm text-gray-300">
                <span className="text-profit mr-2">✓</span>
                {topic}
              </div>
            ))}
          </div>
        </Section>

        {/* MTF */}
        <Section
          bordered
          title="Multi-Timeframe"
          highlight="Analysis"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mtfTopics.map((topic) => (
              <div key={topic} className="glass-card p-5 text-sm text-gray-300">
                {topic}
              </div>
            ))}
          </div>
        </Section>

        {/* Problem Solving */}
        <Section
          title="Problem Solving"
          highlight="Focus"
          subtitle="Many traders struggle because concepts are applied without context. ICT+ is built to answer the questions that matter at the moment of execution."
        >
          <ul className="space-y-4 max-w-3xl">
            {problemSolvingQuestions.map((q) => (
              <li key={q} className="flex gap-3 text-gray-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {q}
              </li>
            ))}
          </ul>
        </Section>

        {/* Access */}
        <Section
          bordered
          id="access"
          title="How To Access"
          highlight="The Mentorship"
          subtitle="A straightforward path from registration to learning inside the Feat Trader Community."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {accessSteps.map((item) => (
              <div key={item.step} className="glass-card p-6">
                <p className="mb-2 text-xs font-mono uppercase tracking-widest text-emerald-400/80">
                  Step {item.step}
                </p>
                <h3 className="mb-2 font-semibold text-gray-200">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="glass-card mx-auto max-w-2xl border-emerald-500/20 p-10 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              {BRAND.name} · {BRAND.program}
            </h2>
            <p className="mb-8 text-gray-400">
              Serious ICT+ and range-level mentorship for traders committed to understanding
              context, structure and execution — not chasing shortcuts.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="btn-primary px-8 py-3">
                Join ICT+ Mentorship
              </Link>
              <Link href="/pricing" className="btn-secondary px-8 py-3">
                View Pricing
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-500">
              Educational mentorship only. No profit guarantees or financial advice.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
