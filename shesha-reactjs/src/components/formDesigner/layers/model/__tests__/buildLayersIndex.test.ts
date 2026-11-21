import { buildTestMarkup, getTestDefinition, sampleForm, simulateEditedPanes, TestComponent } from '@/providers/formDesigner/__tests__/testMarkup';
import { buildLayersIndex } from '../buildLayersIndex';
import { ILayersIndex } from '../types';

const childIdsOf = (index: ILayersIndex, id: string): string[] => index.nodes.get(id)?.childIds ?? [];

describe('buildLayersIndex()', () => {
  const index = buildLayersIndex(buildTestMarkup(sampleForm()), getTestDefinition);

  it('lists top-level components in canvas order', () => {
    expect(index.rootIds).toEqual(['tabs1', 'panel', 'link1', 'save']);
  });

  it('shows tab panes as rows, with the fields inside them', () => {
    expect(childIdsOf(index, 'tabs1')).toEqual(['pane-a', 'pane-b']);
    expect(childIdsOf(index, 'pane-a')).toEqual(['email', 'phone']);
    expect(index.nodes.get('pane-a')).toMatchObject({ kind: 'pane', ownerId: 'tabs1', parentId: 'tabs1', depth: 1, dropContainerId: 'pane-a' });
    expect(index.nodes.get('email')).toMatchObject({ kind: 'component', parentId: 'pane-a', containerId: 'pane-a', depth: 2 });
  });

  it('puts the children of a container directly under it', () => {
    expect(childIdsOf(index, 'panel')).toEqual(['city']);
    expect(index.nodes.get('panel')).toMatchObject({ dropContainerId: 'panel', hasPanes: false });
  });

  it('knows Tabs keeps its children in panes and has no container of its own', () => {
    expect(index.nodes.get('tabs1')).toMatchObject({ hasPanes: true, paneNoun: 'tabs', dropContainerId: undefined });
  });

  it('reads an edited Tabs the same way as a freshly loaded one', () => {
    const edited = buildLayersIndex(simulateEditedPanes(buildTestMarkup(sampleForm()), 'tabs1', ['pane-a', 'pane-b']), getTestDefinition);

    expect(childIdsOf(edited, 'tabs1')).toEqual(['pane-a', 'pane-b']);
    expect(edited.nodes.get('pane-a')?.kind).toBe('pane');
    expect(edited.nodes.get('tabs1')?.dropContainerId).toBeUndefined();
  });

  it('skips ids that no longer exist', () => {
    const markup = buildTestMarkup(sampleForm());
    const broken = { ...markup, componentRelations: { ...markup.componentRelations, root: ['ghost', ...(markup.componentRelations['root'] ?? [])] } };

    expect(buildLayersIndex(broken, getTestDefinition).rootIds).toEqual(['tabs1', 'panel', 'link1', 'save']);
  });

  it('puts a wizard step footer under its step, after the step components', () => {
    const form: TestComponent[] = [{
      id: 'w1',
      type: 'wizard',
      steps: [{ id: 'step-1', title: 'One', components: [{ id: 'name', type: 'textField' }], stepFooter: { id: 'footer-1', components: [{ id: 'next', type: 'button' }] } }],
    }];
    const wizard = buildLayersIndex(buildTestMarkup(form), getTestDefinition);

    expect(childIdsOf(wizard, 'w1')).toEqual(['step-1']);
    expect(childIdsOf(wizard, 'step-1')).toEqual(['name', 'footer-1']);
    expect(childIdsOf(wizard, 'footer-1')).toEqual(['next']);
  });

  it('leaves out an empty step footer the wizard does not draw, and closes a filled one to drops', () => {
    const wizard = (hasCustomFooter: boolean, footer: TestComponent[]): TestComponent[] => [{
      id: 'w1',
      type: 'wizard',
      steps: [{ id: 'step-1', title: 'One', hasCustomFooter, components: [], stepFooter: { id: 'footer-1', components: footer } }],
    }];

    expect(childIdsOf(buildLayersIndex(buildTestMarkup(wizard(false, [])), getTestDefinition), 'step-1')).toEqual([]);
    expect(buildLayersIndex(buildTestMarkup(wizard(false, [{ id: 'next', type: 'button' }])), getTestDefinition).nodes.get('footer-1'))
      .toMatchObject({ kind: 'pane', childIds: ['next'], dropContainerId: undefined });
    expect(buildLayersIndex(buildTestMarkup(wizard(true, [])), getTestDefinition).nodes.get('footer-1'))
      .toMatchObject({ kind: 'pane', dropContainerId: 'footer-1' });
  });

  it('lets an empty container that accepts children receive drops', () => {
    const empty = buildLayersIndex(buildTestMarkup([{ id: 'box', type: 'container' }]), getTestDefinition);
    expect(empty.nodes.get('box')).toMatchObject({ childIds: [], dropContainerId: 'box' });
  });

  it('builds a 2,000-component form in under 10 ms', () => {
    const form: TestComponent[] = Array.from({ length: 40 }, (_, c) => ({
      id: `panel-${c}`,
      type: 'container',
      components: Array.from({ length: 49 }, (_unused, f) => ({ id: `field-${c}-${f}`, type: 'textField', label: `Field ${c}-${f}` })),
    }));
    const markup = buildTestMarkup(form);
    buildLayersIndex(markup, getTestDefinition); // warm up

    // the fastest of a few runs, so a busy test machine doesn't fail it
    const times = Array.from({ length: 5 }, () => {
      const started = performance.now();
      buildLayersIndex(markup, getTestDefinition);
      return performance.now() - started;
    });

    expect(Math.min(...times)).toBeLessThan(10);
    expect(buildLayersIndex(markup, getTestDefinition).nodes.size).toBe(2000);
  });
});
