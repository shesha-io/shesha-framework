import { IFlatComponentsStructure } from '@/providers/form/models';
import { IComponentMovePayload } from '../../contexts';
import { buildTestMarkup, getTestDefinition, sampleForm, simulateEditedPanes, TestComponent } from '../../__tests__/testMarkup';
import { buildContainerOwnership } from '../containers';
import { computeMove, MISSING_COMPONENT_REASON, MISSING_CONTAINER_REASON, MOVE_INTO_ITSELF_REASON, MoveComputation } from '../moveComponent';

const move = (markup: IFlatComponentsStructure, payload: IComponentMovePayload): MoveComputation =>
  computeMove(markup, buildContainerOwnership(markup, getTestDefinition), payload, getTestDefinition);

const moved = (markup: IFlatComponentsStructure, payload: IComponentMovePayload): IFlatComponentsStructure => {
  const result = move(markup, payload);
  if (!result.ok)
    throw new Error(result.reason);
  return result.markup;
};

describe('computeMove()', () => {
  const markup = buildTestMarkup(sampleForm());

  it('reorders within a container', () => {
    const result = moved(markup, { componentId: 'email', containerId: 'pane-a', index: 1 });
    expect(result.componentRelations['pane-a']).toEqual(['phone', 'email']);
  });

  it('moves into another tab pane and records the new parent everywhere', () => {
    const result = moved(markup, { componentId: 'email', containerId: 'pane-b', index: 0 });

    expect(result.componentRelations['pane-a']).toEqual(['phone']);
    expect(result.componentRelations['pane-b']).toEqual(['email']);
    expect(result.allComponents['email']).toMatchObject({ parentId: 'pane-b' });
    expect(result.parents['email']).toBe('pane-b');
  });

  it('moves to the top level', () => {
    const result = moved(markup, { componentId: 'email', containerId: 'root', index: 1 });
    expect(result.componentRelations['root']).toEqual(['tabs1', 'email', 'panel', 'link1', 'save']);
    expect(result.allComponents['email']).toMatchObject({ parentId: 'root' });
  });

  it('accepts drops into an empty container whose definition accepts children', () => {
    const withBox = buildTestMarkup([...sampleForm(), { id: 'box', type: 'container' }]);
    expect(moved(withBox, { componentId: 'save', containerId: 'box', index: 0 }).componentRelations['box']).toEqual(['save']);
  });

  it('clamps the index to the list', () => {
    expect(moved(markup, { componentId: 'save', containerId: 'pane-a', index: 99 }).componentRelations['pane-a']).toEqual(['email', 'phone', 'save']);
    expect(moved(markup, { componentId: 'save', containerId: 'pane-a', index: -5 }).componentRelations['pane-a']).toEqual(['save', 'email', 'phone']);
  });

  it('returns the same markup object when nothing moves', () => {
    const result = move(markup, { componentId: 'email', containerId: 'pane-a', index: 0 });
    expect(result.ok && result.markup).toBe(markup);
  });

  it('refuses to move a component into itself or into something inside it', () => {
    expect(move(markup, { componentId: 'tabs1', containerId: 'pane-a', index: 0 })).toEqual({ ok: false, reason: MOVE_INTO_ITSELF_REASON });
    expect(move(markup, { componentId: 'panel', containerId: 'panel', index: 0 })).toEqual({ ok: false, reason: MOVE_INTO_ITSELF_REASON });
  });

  it('respects an item limit, except when reordering inside the same container', () => {
    expect(move(markup, { componentId: 'save', containerId: 'link1', index: 0 })).toEqual({ ok: false, reason: 'Link can only hold one component.' });
    expect(move(markup, { componentId: 'linkText', containerId: 'link1', index: 0 }).ok).toBe(true);
  });

  it('refuses unknown containers, including the own id of an edited Tabs', () => {
    expect(move(markup, { componentId: 'save', containerId: 'nope', index: 0 })).toEqual({ ok: false, reason: MISSING_CONTAINER_REASON });
    const edited = simulateEditedPanes(markup, 'tabs1', ['pane-a', 'pane-b']);
    expect(move(edited, { componentId: 'save', containerId: 'tabs1', index: 0 })).toEqual({ ok: false, reason: MISSING_CONTAINER_REASON });
  });

  it('refuses components that no longer exist', () => {
    expect(move(markup, { componentId: 'ghost', containerId: 'root', index: 0 })).toEqual({ ok: false, reason: MISSING_COMPONENT_REASON });
  });

  it('handles a wizard step footer as a target', () => {
    const wizard: TestComponent[] = [
      { id: 'w1', type: 'wizard', steps: [{ id: 'step-1', title: 'One', components: [], stepFooter: { id: 'footer-1', components: [] } }] },
      { id: 'save', type: 'button', label: 'Save' },
    ];
    expect(moved(buildTestMarkup(wizard), { componentId: 'save', containerId: 'footer-1', index: 0 }).componentRelations['footer-1']).toEqual(['save']);
  });
});
