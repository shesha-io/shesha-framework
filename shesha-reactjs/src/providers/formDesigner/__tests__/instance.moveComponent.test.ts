vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { createTestDesigner } from './testDesigner';
import { sampleForm } from './testMarkup';

describe('FormDesignerInstance.moveComponent()', () => {
  it('moves a component as one undo step named after it', () => {
    const designer = createTestDesigner(sampleForm());
    const historyLength = designer.history.length;

    expect(designer.moveComponent({ componentId: 'email', containerId: 'pane-b', index: 0 })).toEqual({ ok: true });

    expect(designer.history.length).toBe(historyLength + 1);
    expect(designer.history[designer.historyIndex]?.description).toBe('Moved Email');
    expect(designer.state.formFlatMarkup.componentRelations['pane-b']).toEqual(['email']);
  });

  it('notifies "structure" once', () => {
    const designer = createTestDesigner(sampleForm());
    const onStructure = vi.fn();
    designer.subscribe('structure', onStructure);

    designer.moveComponent({ componentId: 'email', containerId: 'pane-b', index: 0 });

    expect(onStructure).toHaveBeenCalledTimes(1);
  });

  it('is fully undone by undo, including parentId and parents', () => {
    const designer = createTestDesigner(sampleForm());
    designer.moveComponent({ componentId: 'email', containerId: 'pane-b', index: 0 });

    designer.undo();

    const markup = designer.state.formFlatMarkup;
    expect(markup.componentRelations['pane-a']).toEqual(['email', 'phone']);
    expect(markup.componentRelations['pane-b'] ?? []).toEqual([]);
    expect(markup.allComponents['email']).toMatchObject({ parentId: 'pane-a' });
    expect(markup.parents['email']).toBe('pane-a');
  });

  it('changes nothing and explains why when the move is not allowed', () => {
    const designer = createTestDesigner(sampleForm());
    const stateBefore = designer.state;

    expect(designer.moveComponent({ componentId: 'tabs1', containerId: 'pane-a', index: 0 })).toEqual({ ok: false, reason: "Can't move a component inside itself." });
    expect(designer.state).toBe(stateBefore);
  });

  it('adds no history entry when nothing moves', () => {
    const designer = createTestDesigner(sampleForm());
    const historyLength = designer.history.length;

    expect(designer.moveComponent({ componentId: 'email', containerId: 'pane-a', index: 0 })).toEqual({ ok: true });
    expect(designer.history.length).toBe(historyLength);
  });

  it('caches container ownership until the structure changes', () => {
    const designer = createTestDesigner(sampleForm());
    const first = designer.getContainerOwnership();

    expect(designer.getContainerOwnership()).toBe(first);
    designer.moveComponent({ componentId: 'email', containerId: 'pane-b', index: 0 });
    expect(designer.getContainerOwnership()).not.toBe(first);
  });
});
