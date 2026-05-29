import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Section, TopicList } from "@/components/marketing/Section";
import { BRAND } from "@/content/brand";
import {
  biasTopics,
  curriculumBlocks,
  entryFrameworkTopics,
  liquidityTopics,
  marketStructureTopics,
  mtfTopics,
  poiTopics,
  rangeLevelTopics,
} from "@/content/ict-plus";

export const metadata: Metadata = {
  title: BRAND.meta.mentorship,
  description:
    "Full ICT+ Mentorship Program curriculum — market structure, bias, POIs, blocks, gaps, entries and range levels.",
};

export default function MentorshipPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24">
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              {BRAND.program}
            </p>
            <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
              ICT+ <span className="gradient-text">Curriculum</span>
            </h1>
            <p className="mx-auto max-w-2xl text-gray-400 leading-relaxed">
              The complete {BRAND.program} syllabus — structured learning for traders who want
              context-driven ICT execution combined with range levels.
            </p>
            <Link href="/signup" className="btn-primary mt-8 inline-block px-8 py-3">
              Join ICT+ Mentorship
            </Link>
          </div>
        </section>

        <Section
          bordered
          title="ICT+"
          highlight="Framework"
          subtitle="Core frameworks taught throughout the mentorship."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <TopicList title="Advanced Market Structure" items={marketStructureTopics} />
            <TopicList title="Bias Framework" items={biasTopics} />
            <TopicList title="Point of Interest Framework" items={poiTopics} />
            <TopicList title="Liquidity + POI Integration" items={liquidityTopics} />
          </div>
        </Section>

        <Section title="Full" highlight="Curriculum">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {curriculumBlocks.map((block) => (
              <TopicList key={block.title} title={block.title} items={block.items} />
            ))}
          </div>
        </Section>

        <Section bordered title="Entry" highlight="Framework">
          <div className="grid gap-3 sm:grid-cols-2">
            {entryFrameworkTopics.map((t) => (
              <div key={t} className="glass-card p-4 text-sm text-gray-300">
                {t}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Range Levels +" highlight="ICT">
          <div className="grid gap-4 sm:grid-cols-2">
            {rangeLevelTopics.map((t) => (
              <div key={t} className="glass-card p-4 text-sm text-gray-300">
                <span className="text-profit mr-2">✓</span>
                {t}
              </div>
            ))}
          </div>
        </Section>

        <Section bordered title="Multi-Timeframe" highlight="Analysis">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mtfTopics.map((t) => (
              <div key={t} className="glass-card p-4 text-sm text-gray-300">
                {t}
              </div>
            ))}
          </div>
        </Section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="glass-card mx-auto max-w-xl border-emerald-500/20 p-8 text-center">
            <h2 className="mb-4 text-xl font-bold">Ready to begin?</h2>
            <p className="mb-6 text-sm text-gray-400">
              Enroll in the {BRAND.program} and access the {BRAND.community}.
            </p>
            <Link href="/pricing" className="btn-primary px-8 py-3">
              View Pricing
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
