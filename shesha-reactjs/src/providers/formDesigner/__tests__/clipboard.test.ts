import { IConfigurableFormComponent, ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { getCopiedSettings, getPasteProblem, getPasteTarget, IPasteSelection, mergeSettings, parseClipboardText, PasteMode, PasteTarget, renewIds, resolveNameClashes, toClipboardText } from '../clipboard';
import { buildContainerOwnership } from '../structure/containers';
import { buildTestMarkup, getTestDefinition, sampleForm, testComponent, TestComponent } from './testMarkup';

const markup = buildTestMarkup(sampleForm());
const ownership = buildContainerOwnership(markup, getTestDefinition);
const target = (selection: IPasteSelection, mode: PasteMode = 'auto', count = 1): PasteTarget =>
  getPasteTarget(markup, ownership, getTestDefinition, selection, mode, count);

/** The components as a clipboard would carry them (saved-form tree format) */
const asTree = (components: TestComponent[]): IConfigurableFormComponent[] => JSON.parse(JSON.stringify(components)) as IConfigurableFormComponent[];

type TabsTree = { id: string; tabs: { id: string; key: string; components: { id: string }[] }[] };

describe('clipboard text', () => {
  it('round-trips components and settings', () => {
    const components = [testComponent({ id: 'a', type: 'textField', label: 'A' })];
    expect(parseClipboardText(toClipboardText({ kind: 'components', components }))).toEqual({ kind: 'components', components });
    expect(parseClipboardText(toClipboardText({ kind: 'settings', componentType: 'textField', settings: { label: 'A' } })))
      .toEqual({ kind: 'settings', componentType: 'textField', settings: { label: 'A' } });
  });

  it('ignores anything else', () => {
    expect(parseClipboardText('hello')).toBeUndefined();
    expect(parseClipboardText('{"shesha":"form-components",')).toBeUndefined();
    expect(parseClipboardText('{"other":"form-components","version":1,"kind":"components","components":[]}')).toBeUndefined();
    expect(parseClipboardText('{"shesha":"form-components","version":1,"kind":"components","components":[{"id":"a"}]}')).toBeUndefined();
  });

  it('recognises a copy from a newer version', () => {
    expect(parseClipboardText('{"shesha":"form-components","version":99,"kind":"components","components":[]}')).toEqual({ kind: 'newer-version' });
  });
});

describe('getPasteProblem()', () => {
  it('names component types this app does not have, anywhere in the tree', () => {
    const tree = asTree(sampleForm().slice(0, 1));
    (tree[0] as unknown as TabsTree).tabs[1]?.components.push({ id: 'm', type: 'mapPicker' } as unknown as { id: string });
    expect(getPasteProblem(tree, getTestDefinition)).toBe("This app doesn't have these components: mapPicker.");
  });

  it('refuses children that are not components', () => {
    const tree = asTree(sampleForm().slice(0, 1));
    (tree[0] as unknown as TabsTree).tabs[0]?.components.push({ label: 'no id or type' } as unknown as { id: string });
    expect(getPasteProblem(tree, getTestDefinition)).toBe("The clipboard doesn't contain form components.");
  });

  it('accepts a valid tree', () => {
    expect(getPasteProblem(asTree(sampleForm()), getTestDefinition)).toBeUndefined();
  });
});

describe('renewIds()', () => {
  it('gives components and panes new ids and keeps the structure and tab keys', () => {
    const tree = asTree(sampleForm().slice(0, 1));
    renewIds(tree, getTestDefinition);
    const tabs = tree[0] as unknown as TabsTree;
    expect(tabs.id).not.toBe('tabs1');
    expect(tabs.tabs.map((pane) => pane.id)).not.toContain('pane-a');
    expect(tabs.tabs[0]?.key).toBe('a');
    expect(tabs.tabs[0]?.components).toHaveLength(2);
    expect(tabs.tabs[0]?.components.map((c) => c.id)).not.toContain('email');
  });

  it('renews a wizard step footer and points the default step at the new step id', () => {
    const tree = asTree([{
      id: 'w1',
      type: 'wizard',
      defaultActiveStep: 'step-1',
      steps: [{ id: 'step-1', title: 'One', components: [{ id: 'name', type: 'textField' }], stepFooter: { id: 'footer-1', components: [{ id: 'next', type: 'button' }] } }],
    }]);
    renewIds(tree, getTestDefinition);
    const wizard = tree[0] as unknown as { defaultActiveStep: string; steps: { id: string; stepFooter: { id: string; components: { id: string }[] } }[] };
    expect(wizard.steps[0]?.id).not.toBe('step-1');
    expect(wizard.defaultActiveStep).toBe(wizard.steps[0]?.id);
    expect(wizard.steps[0]?.stepFooter.id).not.toBe('footer-1');
    expect(wizard.steps[0]?.stepFooter.components[0]?.id).not.toBe('next');
  });

  it('keeps the default tab of a Tabs whose panes use their id as key, as the designer creates them', () => {
    const tree = asTree([{
      id: 't1',
      type: 'tabs',
      defaultActiveKey: 'p2',
      tabs: [{ id: 'p1', key: 'p1', title: 'One', components: [] }, { id: 'p2', key: 'p2', title: 'Two', components: [] }],
    }]);
    renewIds(tree, getTestDefinition);
    const tabs = tree[0] as unknown as TabsTree & { defaultActiveKey: string };
    expect(tabs.tabs.map((pane) => pane.id)).not.toContain('p2');
    expect(tabs.tabs[1]?.key).toBe(tabs.defaultActiveKey);
  });

  it('points actions owned by a copied component at its new id, and leaves other owners alone', () => {
    const tree = asTree([{
      id: 'ctx',
      type: 'datatableContext',
      components: [{
        id: 'toolbar',
        type: 'buttonGroup',
        items: [
          { id: 'add', actionConfiguration: { actionOwner: 'ctx', actionName: 'addRow', onSuccess: { actionOwner: 'ctx', actionName: 'refresh' } } },
          { id: 'other', actionConfiguration: { actionOwner: 'elsewhere', actionName: 'refresh' } },
        ],
      }],
    }]);
    renewIds(tree, getTestDefinition);
    type Action = { actionOwner: string; onSuccess?: Action };
    const context = tree[0] as unknown as { id: string; components: { items: { actionConfiguration: Action }[] }[] };
    const [add, other] = context.components[0]?.items ?? [];
    expect(add?.actionConfiguration.actionOwner).toBe(context.id);
    expect(add?.actionConfiguration.onSuccess?.actionOwner).toBe(context.id);
    expect(other?.actionConfiguration.actionOwner).toBe('elsewhere');
  });
});

describe('resolveNameClashes()', () => {
  it('numbers names the form already uses, and keeps labels', () => {
    const tree = [
      testComponent({ id: 'a', type: 'textField', label: 'Email', componentName: 'txtEmail' }),
      testComponent({ id: 'b', type: 'textField', label: 'Email', componentName: 'txtEmail' }),
    ];
    const changes = resolveNameClashes(tree, new Set(['txtEmail', 'txtEmail2']), getTestDefinition);
    expect(tree.map((c) => c.componentName)).toEqual(['txtEmail3', 'txtEmail4']);
    expect(tree.map((c) => c.label)).toEqual(['Email', 'Email']);
    expect(changes).toEqual([{ from: 'txtEmail', to: 'txtEmail3' }, { from: 'txtEmail', to: 'txtEmail4' }]);
  });

  it('replaces a trailing number instead of adding to it', () => {
    const tree = [testComponent({ id: 'a', type: 'textField', componentName: 'textField1' })];
    resolveNameClashes(tree, new Set(['textField1']), getTestDefinition);
    expect(tree[0]?.componentName).toBe('textField2');
  });
});

describe('getPasteTarget()', () => {
  it('pastes at the end of the form when nothing is selected', () => {
    expect(target({})).toEqual({ containerId: ROOT_COMPONENT_KEY, index: 4 });
  });

  it('pastes inside a container, or after it with "after"', () => {
    expect(target({ componentId: 'panel' })).toEqual({ containerId: 'panel', index: 1 });
    expect(target({ componentId: 'panel' }, 'after')).toEqual({ containerId: ROOT_COMPONENT_KEY, index: 2 });
  });

  it('pastes after a field, and after Tabs (a pane has to be picked to go inside)', () => {
    expect(target({ componentId: 'email' })).toEqual({ containerId: 'pane-a', index: 1 });
    expect(target({ componentId: 'tabs1' })).toEqual({ containerId: ROOT_COMPONENT_KEY, index: 1 });
  });

  it('pastes into a pane picked in Layers, or after its owner with "after"', () => {
    expect(target({ containerId: 'pane-b' })).toEqual({ containerId: 'pane-b', index: 0 });
    expect(target({ containerId: 'pane-b' }, 'after')).toEqual({ containerId: ROOT_COMPONENT_KEY, index: 1 });
  });

  it('respects item limits', () => {
    expect(target({ componentId: 'link1' })).toEqual({ reason: 'Link can only hold one component.' });
  });
});

describe('settings', () => {
  it('copies everything except identity, binding and contents', () => {
    const panel = testComponent({ id: 'p', type: 'container', componentName: 'box', propertyName: 'box', parentId: 'root', label: 'Panel', components: [], hidden: true });
    expect(getCopiedSettings(panel, getTestDefinition('container'))).toEqual({ label: 'Panel', hidden: true });
  });

  it('keeps the target identity, binding and contents, and drops settings the copy does not have', () => {
    const target = testComponent({ id: 't', type: 'textField', componentName: 'txtCity', propertyName: 'city', label: 'City', hidden: true, parentId: 'root' });
    expect(mergeSettings(target, { label: 'Email', placeholder: 'you@example.com' }, getTestDefinition('textField')))
      .toEqual({ id: 't', type: 'textField', componentName: 'txtCity', propertyName: 'city', parentId: 'root', label: 'Email', placeholder: 'you@example.com' });
  });

  it('keeps the target\'s default tab or step, which names one of its own panes', () => {
    const source = testComponent({ id: 's', type: 'tabs', defaultActiveKey: 'source-tab', tabPosition: 'left', tabs: [] });
    const target = testComponent({ id: 't', type: 'tabs', defaultActiveKey: 'target-tab', tabs: [] });
    const settings = getCopiedSettings(source, getTestDefinition('tabs'));
    expect(settings).toEqual({ tabPosition: 'left' });
    expect(mergeSettings(target, settings, getTestDefinition('tabs'))).toMatchObject({ defaultActiveKey: 'target-tab', tabPosition: 'left' });

    const wizard = testComponent({ id: 'w', type: 'wizard', defaultActiveStep: 'step-2', steps: [] });
    expect(getCopiedSettings(wizard, getTestDefinition('wizard'))).toEqual({});
  });
});
