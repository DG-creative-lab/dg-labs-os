import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  handleResumeMenuAction,
  type ResumeMenuEventDetail,
} from '../../services/menuActionHandlers';
import type { ActiveProfileRuntime, ProfileCv } from '../../profiles';
import { renderResumeMarkdown } from '../../profiles/resume/markdown';
import type { ResumeViewModel } from '../../profiles/resume/viewModel';

type ResumeAppProps = {
  profile: ActiveProfileRuntime;
  cv: ProfileCv;
  resume: ResumeViewModel;
};

export default function ResumeApp({ profile, cv, resume }: ResumeAppProps) {
  const files = cv.files;
  const content = renderResumeMarkdown(resume);

  useEffect(() => {
    const onResumeMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<ResumeMenuEventDetail>;
      handleResumeMenuAction(customEvent.detail, {
        jumpToSection: (sectionId) => {
          const el = document.getElementById(sectionId);
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        download: (format) => {
          const id =
            format === 'pdf'
              ? 'resume-download-pdf'
              : format === 'docx'
                ? 'resume-download-docx'
                : 'resume-download-markdown';
          const el = document.getElementById(id) as HTMLAnchorElement | null;
          if (el) el.click();
        },
        scrollTop: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
    };

    window.addEventListener('dg-resume-menu-action', onResumeMenuAction as EventListener);
    return () => {
      window.removeEventListener('dg-resume-menu-action', onResumeMenuAction as EventListener);
    };
  }, []);

  return (
    <section id="resume-summary">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Resume</h1>
          <p className="mt-2 text-white/70">
            {profile.identity.possessiveName} experience, AI systems capabilities, and selected
            systems. Available in PDF, DOCX, and Markdown.
          </p>
        </div>
        <div className="hidden text-right text-xs text-white/50 md:block">
          <p>DG-OS</p>
          <p>Module: Resume</p>
          <p>Variant: {cv.label}</p>
        </div>
      </div>

      <div id="resume-downloads" className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <a
          id="resume-download-pdf"
          className="rounded-md border border-sky-300/35 bg-sky-400/10 px-3 py-2 text-center text-sm text-sky-100 transition hover:bg-sky-400/20"
          href={files.pdf}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download PDF
        </a>
        <a
          id="resume-download-docx"
          className="rounded-md border border-sky-300/35 bg-sky-400/10 px-3 py-2 text-center text-sm text-sky-100 transition hover:bg-sky-400/20"
          href={files.docx}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download DOCX
        </a>
        <a
          id="resume-download-markdown"
          className="rounded-md border border-sky-300/35 bg-sky-400/10 px-3 py-2 text-center text-sm text-sky-100 transition hover:bg-sky-400/20"
          href={files.markdown}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Markdown
        </a>
      </div>

      <aside className="mt-4 rounded-xl border border-sky-300/25 bg-sky-400/8 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/75">
          Approved profile projection
        </p>
        <p className="mt-2 text-sm leading-6 text-white/65">
          This view and its downloadable formats are generated from the same reviewed Resume,
          Workbench, and Evidence records.
        </p>
        <a
          className="mt-2 inline-flex text-sm font-medium text-sky-100 underline decoration-sky-300/40 underline-offset-4"
          href={`/@${profile.handle}/evolution`}
        >
          Inspect selected systems, claims, and boundaries →
        </a>
      </aside>

      <div
        id="resume-body"
        className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5"
      >
        <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:mb-2 prose-headings:mt-5 prose-p:my-2 prose-li:my-1 break-words">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </div>
    </section>
  );
}
