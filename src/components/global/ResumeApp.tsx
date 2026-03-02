import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ResumeConfig } from '../../types';

type ResumeAppProps = {
  resume: ResumeConfig;
};

export default function ResumeApp({ resume }: ResumeAppProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(resume.markdown);
        if (!response.ok) {
          throw new Error(`Failed to load resume markdown (${response.status})`);
        }
        const markdown = await response.text();
        if (!cancelled) setContent(markdown);
      } catch {
        if (!cancelled) setError('Resume markdown could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [resume.markdown]);

  return (
    <section>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Resume</h1>
          <p className="mt-2 text-white/70">
            Canonical resume module with local downloadable formats.
          </p>
        </div>
        <div className="hidden text-right text-xs text-white/50 md:block">
          <p>DG-Labs OS</p>
          <p>Module: Resume</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          className="rounded-md border border-sky-300/35 bg-sky-400/10 px-3 py-1.5 text-sm text-sky-100 transition hover:bg-sky-400/20"
          href={resume.pdf}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download PDF
        </a>
        <a
          className="rounded-md border border-sky-300/35 bg-sky-400/10 px-3 py-1.5 text-sm text-sky-100 transition hover:bg-sky-400/20"
          href={resume.docx}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download DOCX
        </a>
        <a
          className="rounded-md border border-sky-300/35 bg-sky-400/10 px-3 py-1.5 text-sm text-sky-100 transition hover:bg-sky-400/20"
          href={resume.markdown}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Markdown
        </a>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-5">
        {loading ? <p className="text-white/60">Loading resume...</p> : null}
        {!loading && error ? <p className="text-red-300/90">{error}</p> : null}
        {!loading && !error ? (
          <article className="prose prose-invert max-w-none prose-headings:mb-2 prose-headings:mt-5 prose-p:my-2 prose-li:my-1">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : null}
      </div>
    </section>
  );
}
