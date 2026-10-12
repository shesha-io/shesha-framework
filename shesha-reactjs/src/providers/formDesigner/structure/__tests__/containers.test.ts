import { IFlatComponentsStructure, isConfigurableFormComponent } from '@/providers/form/models';
import { getComponentContainers } from '@/providers/form/utils';
import { buildTestMarkup, getTestDefinition, sampleForm, simulateEditedPanes, TestComponent } from '../../__tests__/testMarkup';
import { buildContainerOwnership, getOwnContainerId, getParentContainerId, isSameOrInside } from '../containers';

const ownContainerOf = (markup: IFlatComponentsStructure, id: string): string | undefined => {
  const component = markup.allComponents[id];
  if (!isConfigurableFormComponent(component))
    throw new Error(`No component ${id}`);
  const definition = getTestDefinition(component.type);
  return getOwnContainerId(component, definition, markup, getComponentContainers(component, definition));
};

const wizardForm = (): TestComponent[] => [{
  id: 'w1',
  type: 'wizard',
  steps: [{ id: 'step-1', title: 'One', components: [], stepFooter: { id: 'footer-1', components: [{ id: 'next', type: 'button', label: 'Next' }] } }],
}];

describe('getOwnContainerId()', () => {
  it('is the id of a container that has children', () => {
    expect(ownContainerOf(buildTestMarkup(sampleForm()), 'panel')).toBe('panel');
  });

  it('is the id of an empty container whose definition accepts children', () => {
    expect(ownContainerOf(buildTestMarkup([{ id: 'box', type: 'container' }]), 'box')).toBe('box');
  });

  it('is undefined for a component that holds no children', () => {
    expect(ownContainerOf(buildTestMarkup(sampleForm()), 'save')).toBeUndefined();
  });

  it('is undefined for Tabs, whose children live in panes', () => {
    expect(ownContainerOf(buildTestMarkup(sampleForm()), 'tabs1')).toBeUndefined();
  });

  it('stays undefined for Tabs after an edit lists its panes under its own id', () => {
    const markup = simulateEditedPanes(buildTestMarkup(sampleForm()), 'tabs1', ['pane-a', 'pane-b']);
    expect(ownContainerOf(markup, 'tabs1')).toBeUndefined();
  });
});

describe('buildContainerOwnership()', () => {
  it('maps panes and own containers to their owners', () => {
    const ownership = buildContainerOwnership(buildTestMarkup(sampleForm()), getTestDefinition);

    expect(ownership.ownerOf.get('pane-a')).toBe('tabs1');
    expect(ownership.ownerOf.get('pane-b')).toBe('tabs1');
    expect(ownership.ownerOf.get('panel')).toBe('panel');
    expect([...ownership.paneIds].sort()).toEqual(['pane-a', 'pane-b']);
  });

  it('ignores the pane entries an edit adds to allComponents', () => {
    const markup = simulateEditedPanes(buildTestMarkup(sampleForm()), 'tabs1', ['pane-a', 'pane-b']);
    const ownership = buildContainerOwnership(markup, getTestDefinition);

    expect(ownership.ownerOf.get('pane-a')).toBe('tabs1');
    expect(ownership.ownerOf.has('tabs1')).toBe(false);
  });

  it('records which step holds a footer', () => {
    const ownership = buildContainerOwnership(buildTestMarkup(wizardForm()), getTestDefinition);

    expect(ownership.ownerOf.get('footer-1')).toBe('w1');
    expect(ownership.heldBy.get('footer-1')).toBe('step-1');
  });
});

describe('getParentContainerId() and isSameOrInside()', () => {
  const markup = buildTestMarkup(sampleForm());
  const ownership = buildContainerOwnership(markup, getTestDefinition);

  it('gives the pane a component sits in, and undefined at the top level', () => {
    expect(getParentContainerId(markup, 'email')).toBe('pane-a');
    expect(getParentContainerId(markup, 'save')).toBeUndefined();
  });

  it('knows what is inside what', () => {
    expect(isSameOrInside(markup, ownership, 'email', 'tabs1')).toBe(true);
    expect(isSameOrInside(markup, ownership, 'tabs1', 'tabs1')).toBe(true);
    expect(isSameOrInside(markup, ownership, 'save', 'tabs1')).toBe(false);
    expect(isSameOrInside(markup, ownership, 'city', 'tabs1')).toBe(false);
  });
});
