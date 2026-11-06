vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { getComponentsChain } from '@/providers/form/utils';
import { createTestDesigner } from './testDesigner';
import { TestComponent } from './testMarkup';

const tree = (): TestComponent[] => [
  { id: 'c1', type: 'container', components: [{ id: 't1', type: 'textField', label: 'First name' }] },
  { id: 't2', type: 'textField', label: 'Email' },
];

describe('FormDesignerInstance: structure signal', () => {
  it('bumps structureVersion and notifies "structure" when children are reordered', () => {
    const designer = createTestDesigner(tree());
    const onStructure = vi.fn();
    designer.subscribe('structure', onStructure);
    const before = designer.structureVersion;

    designer.updateChildComponents({ containerId: 'root', componentIds: ['t2', 'c1'] });

    expect(designer.structureVersion).toBe(before + 1);
    expect(onStructure).toHaveBeenCalledTimes(1);
  });

  it('does not bump structureVersion when only a property changes', () => {
    const designer = createTestDesigner(tree());
    const onStructure = vi.fn();
    designer.subscribe('structure', onStructure);
    const before = designer.structureVersion;

    designer.updateComponent({ componentId: 't2', updater: (model) => ({ ...model, label: 'E-mail' }) });

    expect(designer.state.formFlatMarkup.allComponents['t2']).toMatchObject({ label: 'E-mail' });
    expect(designer.structureVersion).toBe(before);
    expect(onStructure).not.toHaveBeenCalled();
  });

  it('bumps structureVersion on undo and redo of a structural change, although the restored state is a deep copy', () => {
    const designer = createTestDesigner(tree());
    designer.updateChildComponents({ containerId: 'root', componentIds: ['t2', 'c1'] });
    const afterMove = designer.structureVersion;

    designer.undo();
    expect(designer.structureVersion).toBe(afterMove + 1);
    expect(designer.state.formFlatMarkup.componentRelations['root']).toEqual(['c1', 't2']);

    designer.redo();
    expect(designer.structureVersion).toBe(afterMove + 2);
  });

  it('does not bump structureVersion when undoing a property change', () => {
    const designer = createTestDesigner(tree());
    designer.updateComponent({ componentId: 't2', updater: (model) => ({ ...model, label: 'E-mail' }) });
    const before = designer.structureVersion;

    designer.undo();

    expect(designer.structureVersion).toBe(before);
  });
});

describe('FormDesignerInstance: updateChildComponents keeps parents in sync', () => {
  it('records the new parent in `parents` when a component changes container', () => {
    const designer = createTestDesigner(tree());

    designer.updateChildComponents({ containerId: 'c1', componentIds: ['t1', 't2'] });

    const markup = designer.state.formFlatMarkup;
    expect(markup.parents['t2']).toBe('c1');
    expect(markup.allComponents['t2']).toMatchObject({ parentId: 'c1' });
    expect(markup.componentRelations['root']).toEqual(['c1']);
  });

  it('lets ancestor lookups (contextual actions, hidden checks) see the new container', () => {
    const designer = createTestDesigner(tree());

    designer.updateChildComponents({ containerId: 'c1', componentIds: ['t1', 't2'] });

    expect(getComponentsChain(designer.state.formFlatMarkup, 't2').map((c) => c.id)).toEqual(['c1', 't2']);
  });
});
