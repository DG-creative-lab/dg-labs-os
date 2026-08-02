import { useEffect } from 'react';
import type { ActiveProfileRuntime, PublicProfileModules } from '../../profiles';
import {
  handleWorkbenchMenuAction,
  type WorkbenchMenuEventDetail,
} from '../../services/menuActionHandlers';

const toWorkbenchSectionId = (category: string) =>
  `workbench-${category.toLowerCase().replace(/\s+/g, '-')}`;

const jumpTo = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return;
  const container = element.closest('.no-scrollbar');
  if (container instanceof HTMLElement) {
    const top = Math.max(0, element.offsetTop - 8);
    container.scrollTo({ top, behavior: 'smooth' });
    return;
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function WorkbenchApp({
  profile,
  workbench,
}: {
  profile: ActiveProfileRuntime;
  workbench: PublicProfileModules['workbench'];
}) {
  useEffect(() => {
    const onWorkbenchMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<WorkbenchMenuEventDetail>;
      handleWorkbenchMenuAction(customEvent.detail, {
        jumpToSection: jumpTo,
        scrollTop: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      });
    };
    window.addEventListener('dg-workbench-menu-action', onWorkbenchMenuAction as EventListener);
    return () => {
      window.removeEventListener(
        'dg-workbench-menu-action',
        onWorkbenchMenuAction as EventListener
      );
    };
  }, []);

  return (
    <section className="text-white">
      <h1 className="text-2xl font-semibold">Workbench</h1>
      <p className="mt-2 text-white/70">
        Selected systems {profile.identity.preferredName} can show, explain, and bound with
        evidence.
      </p>
      <div className="mt-8 space-y-10">
        {workbench.categories.map((category) => {
          const items = workbench.items.filter((item) => item.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} id={toWorkbenchSectionId(category)}>
              <div className="flex items-end justify-between gap-6 border-b border-white/15 pb-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/85">
                    {category}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    {workbench.categoryDescriptions[category]}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  {String(items.length).padStart(2, '0')}
                </span>
              </div>
              <div className="divide-y divide-white/10">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-5 py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                        {item.classification}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{item.subtitle}</p>
                      <p className="mt-4 text-sm leading-relaxed text-white/75">{item.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                        {item.stack.slice(0, 6).map((technology) => (
                          <span className="text-[11px] text-white/50" key={technology}>
                            {technology}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:border-l md:border-white/10 md:pl-6">
                      <ul className="space-y-2 text-sm leading-relaxed text-white/70">
                        {item.highlights.slice(0, 4).map((highlight) => (
                          <li className="grid grid-cols-[0.75rem_1fr] gap-2" key={highlight}>
                            <span className="text-white/30">-</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      {Object.values(item.links).some(Boolean) ? (
                        <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4">
                          {Object.entries(item.links).map(([kind, href]) =>
                            href ? (
                              <a
                                className="text-xs font-medium text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white/70"
                                href={href}
                                key={kind}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {kind === 'repo'
                                  ? 'Repository'
                                  : kind === 'article'
                                    ? 'Related writing'
                                    : kind === 'demo'
                                      ? 'Demo'
                                      : 'Live system'}{' '}
                                ↗
                              </a>
                            ) : null
                          )}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
