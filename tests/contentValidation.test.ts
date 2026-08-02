import { describe, expect, it } from 'vitest';
import { dockLinks, publicLinks, verificationLinks } from '../src/config/links';
import { validateContentConfigs } from '../src/config/contentValidation';
import { networkIdeaEdges, networkLinks, networkNodes } from '../src/config/network';
import { workbench } from '../src/config/workbench';
import { dessiWritingModule } from '../src/profiles/writing';

describe('content validation', () => {
  it('passes for the committed content configs', () => {
    const issues = validateContentConfigs({
      workbench,
      writing: dessiWritingModule.entries,
      publicLinks,
      dockLinks,
      verificationLinks,
      networkNodes,
      networkIdeaEdges,
      networkLinks,
    });

    expect(issues).toEqual([]);
  });

  it('catches duplicate ids, invalid urls, and dangling network edges', () => {
    const issues = validateContentConfigs({
      workbench: [
        ...workbench,
        {
          ...workbench[0],
          id: workbench[0].id,
          links: { repo: 'not-a-url' },
        },
      ],
      writing: [
        ...dessiWritingModule.entries,
        {
          ...dessiWritingModule.entries[0],
          id: dessiWritingModule.entries[0].id,
          url: '/relative-path',
        },
      ],
      publicLinks: [
        ...publicLinks,
        {
          ...publicLinks[0],
          id: publicLinks[0].id,
          url: 'ftp://invalid',
          inDockLinks: false,
        },
      ],
      dockLinks,
      verificationLinks,
      networkNodes,
      networkIdeaEdges: [
        ...networkIdeaEdges,
        {
          id: 'missing-edge',
          from: 'missing-node',
          to: networkNodes[0].id,
          relation: 'informed',
          evidence: '',
          confidence: 'interpretive',
        },
      ],
      networkLinks: {
        ...networkLinks,
        githubOrg: 'relative-url',
      },
    });

    expect(
      issues.some((issue) => issue.scope === 'workbench' && issue.message === 'Duplicate id.')
    ).toBe(true);
    expect(
      issues.some(
        (issue) =>
          issue.scope === 'workbench' &&
          issue.message === 'Link "repo" must be an absolute http(s) URL.'
      )
    ).toBe(true);
    expect(
      issues.some((issue) => issue.scope === 'writing' && issue.message === 'Duplicate id.')
    ).toBe(true);
    expect(
      issues.some(
        (issue) =>
          issue.scope === 'writing' && issue.message === 'URL must be an absolute http(s) URL.'
      )
    ).toBe(true);
    expect(
      issues.some((issue) => issue.scope === 'links' && issue.message === 'Duplicate id.')
    ).toBe(true);
    expect(
      issues.some(
        (issue) =>
          issue.scope === 'links' && issue.message === 'URL must be absolute http(s) or mailto.'
      )
    ).toBe(true);
    expect(
      issues.some(
        (issue) =>
          issue.scope === 'network' &&
          issue.message === 'Edge source "missing-node" does not exist.'
      )
    ).toBe(true);
    expect(
      issues.some(
        (issue) => issue.scope === 'network' && issue.message === 'Edge evidence must be non-empty.'
      )
    ).toBe(true);
    expect(
      issues.some(
        (issue) =>
          issue.scope === 'network' &&
          issue.message === 'networkLinks "githubOrg" must be an absolute http(s) URL.'
      )
    ).toBe(true);
  });
});
