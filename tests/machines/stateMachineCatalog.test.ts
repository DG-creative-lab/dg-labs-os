import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stateMachineCatalog } from '../../architecture/state-machines/catalog';

describe('state-machine catalogue', () => {
  it('assigns unique identities and complete deterministic boundaries', () => {
    const ids = stateMachineCatalog.map((machine) => machine.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const machine of stateMachineCatalog) {
      expect(machine.purpose.trim()).not.toBe('');
      expect(machine.states.length).toBeGreaterThan(0);
      expect(machine.inputs.length).toBeGreaterThan(0);
      expect(machine.outputs.length).toBeGreaterThan(0);
      expect(machine.invariants.length).toBeGreaterThan(0);
      expect(machine.implementation.length).toBeGreaterThan(0);
    }
  });

  it('keeps every declared implementation path alive', () => {
    for (const machine of stateMachineCatalog) {
      for (const implementation of machine.implementation) {
        expect(fs.existsSync(implementation), `${machine.id}: ${implementation}`).toBe(true);
      }
    }
  });

  it('marks non-deterministic effects explicitly', () => {
    const profileAgent = stateMachineCatalog.find(
      (machine) => machine.id === 'profile-agent-request'
    );
    expect(profileAgent?.nonDeterministicEffects).toContain('Model-generated text');
    expect(
      stateMachineCatalog
        .filter((machine) => machine.nonDeterministicEffects.length === 0)
        .every((machine) => machine.maturity !== 'implicit')
    ).toBe(true);
  });
});
