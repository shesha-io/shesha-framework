vi.mock('@/providers/formDesigner/formValidator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/providers/formDesigner/formValidator')>();
  class FormValidatorStub {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<[]> => Promise.resolve([]);
  }
  return { ...actual, FormValidator: FormValidatorStub };
});

import { IConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { componentsFlatStructureToTree } from '@/providers/form/utils';
import { createTestDesigner } from './testDesigner';
import { sampleForm } from './testMarkup';

/** What the clipboard would carry: a fresh copy of the tree */
const clipboardCopy = (component: IConfigurableFormComponent | undefined): IConfigurableFormComponent => {
  if (component === undefined)
    throw new Error('nothing copied');
  return JSON.parse(JSON.stringify(component)) as IConfigurableFormComponent;
};

describe('FormDesignerInstance: copy and paste', () => {
  it('returns a component with everything inside it, in saved-form format', () => {
    const designer = createTestDesigner(sampleForm());
    const tree = designer.getComponentTree('tabs1') as unknown as { id: string; tabs: { components: { id: string }[] }[] };

    expect(tree.id).toBe('tabs1');
    expect(tree.tabs.map((pane) => pane.components.map((c) => c.id))).toEqual([['email', 'phone'], []]);
  });

  it('pastes a copy with new ids into a pane, as one undo step, and selects it', () => {
    const designer = createTestDesigner(sampleForm());

    const result = designer.pasteComponents({ components: [clipboardCopy(designer.getComponentTree('panel'))], selection: { containerId: 'pane-b' }, mode: 'auto' });

    if (!result.ok)
      throw new Error(result.reason);
    const pastedId = result.componentIds[0] ?? '';
    const markup = designer.state.formFlatMarkup;
    expect(pastedId).not.toBe('panel');
    expect(markup.componentRelations['pane-b']).toEqual([pastedId]);
    expect(markup.componentRelations[pastedId]).toHaveLength(1);
    expect(markup.allComponents[pastedId]?.parentId).toBe('pane-b');
    expect(designer.selectedComponentId).toBe(pastedId);

    designer.undo();
    expect(designer.state.formFlatMarkup.componentRelations['pane-b'] ?? []).toEqual([]);
  });

  it('pastes the same copy twice without clashing ids or names, and saves in the normal format', () => {
    const designer = createTestDesigner(sampleForm());
    const copy = JSON.stringify(designer.getComponentTree('tabs1'));

    const first = designer.pasteComponents({ components: [JSON.parse(copy) as IConfigurableFormComponent], selection: {}, mode: 'auto' });
    const second = designer.pasteComponents({ components: [JSON.parse(copy) as IConfigurableFormComponent], selection: {}, mode: 'auto' });

    if (!first.ok || !second.ok)
      throw new Error('paste failed');
    expect(first.componentIds[0]).not.toBe(second.componentIds[0]);
    expect(first.renamed.map((r) => r.to)).toEqual(expect.arrayContaining(['mainTabs2', 'txtEmail2']));
    expect(second.renamed.map((r) => r.to)).toEqual(expect.arrayContaining(['mainTabs3', 'txtEmail3']));
    expect(designer.state.formFlatMarkup.componentRelations[ROOT_COMPONENT_KEY]).toHaveLength(6);

    const saved = componentsFlatStructureToTree(designer.toolboxComponents, designer.state.formFlatMarkup);
    const pastedTabs = saved[5] as unknown as { tabs: { components: { componentName?: string }[] }[] };
    expect(pastedTabs.tabs[0]?.components.map((c) => c.componentName)).toContain('txtEmail3');
  });

  it('keeps the names inside a cut component when it is pasted back into the same form', () => {
    const designer = createTestDesigner(sampleForm());
    const copy = clipboardCopy(designer.getComponentTree('tabs1'));
    designer.deleteComponent({ componentId: 'tabs1' });

    expect(designer.pasteComponents({ components: [copy], selection: {}, mode: 'auto' })).toMatchObject({ ok: true, renamed: [] });
  });

  it('pastes at the end of the form when the selected component was inside one that has been deleted', () => {
    const designer = createTestDesigner(sampleForm());
    designer.deleteComponent({ componentId: 'panel' });

    const result = designer.pasteComponents({ components: [{ id: 'x', type: 'textField' } as IConfigurableFormComponent], selection: { componentId: 'city' }, mode: 'auto' });

    if (!result.ok)
      throw new Error(result.reason);
    expect(designer.state.formFlatMarkup.componentRelations[ROOT_COMPONENT_KEY]?.at(-1)).toBe(result.componentIds[0]);
  });

  it('refuses unknown component types and full containers, changing nothing', () => {
    const designer = createTestDesigner(sampleForm());
    const before = designer.state.formFlatMarkup;

    expect(designer.pasteComponents({ components: [{ id: 'x', type: 'mapPicker' } as IConfigurableFormComponent], selection: {}, mode: 'auto' }))
      .toEqual({ ok: false, reason: "This app doesn't have these components: mapPicker." });
    expect(designer.pasteComponents({ components: [{ id: 'x', type: 'textField' } as IConfigurableFormComponent], selection: { componentId: 'link1' }, mode: 'auto' }))
      .toEqual({ ok: false, reason: 'Link can only hold one component.' });
    expect(designer.state.formFlatMarkup).toBe(before);
  });

  it('pastes settings onto a component of the same type, as one undo step', () => {
    const designer = createTestDesigner(sampleForm());

    expect(designer.pasteSettings({ componentId: 'phone', componentType: 'textField', settings: { label: 'Mobile' } })).toEqual({ ok: true });
    expect(designer.state.formFlatMarkup.allComponents['phone']).toMatchObject({ id: 'phone', label: 'Mobile', propertyName: 'phone' });

    designer.undo();
    expect(designer.state.formFlatMarkup.allComponents['phone']).toMatchObject({ label: 'Phone' });
  });

  it('refuses settings copied from a different type', () => {
    const designer = createTestDesigner(sampleForm());
    expect(designer.pasteSettings({ componentId: 'save', componentType: 'textField', settings: { label: 'x' } }))
      .toEqual({ ok: false, reason: 'Settings can only be pasted onto another Text field.' });
  });

  it("keeps a wizard's own steps when another wizard's settings are pasted onto it", () => {
    const designer = createTestDesigner([{ id: 'w1', type: 'wizard', steps: [{ id: 's1', title: 'One', components: [{ id: 'f', type: 'textField' }] }] }]);

    designer.pasteSettings({ componentId: 'w1', componentType: 'wizard', settings: { label: 'Signup' } });

    expect(designer.getComponentTree('w1')).toMatchObject({ label: 'Signup', steps: [{ id: 's1', components: [{ id: 'f' }] }] });
  });
});
