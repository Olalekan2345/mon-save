import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function ProsePage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="prose-monsave mt-8 space-y-6 text-sm leading-relaxed text-ink-dim [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
