import { buildContainerOwnership } from '@/providers/formDesigner/structure/containers';
import { MOVE_INTO_ITSELF_REASON } from '@/providers/formDesigner/structure/moveComponent';
import { buildTestMarkup, getTestDefinition, sampleForm, TestComponent } from '@/providers/formDesigner/__tests__/testMarkup';
import { buildLayersIndex } from '../buildLayersIndex';
import { DropResolution, LayerDropInstruction, normalizeInstruction, PANE_REORDER_REASON, resolveDrop, resolveRootEndDrop, validateResolution } from '../dropTarget';

const markup = buildTestMarkup(sampleForm());
const index = buildLayersIndex(markup, getTestDefinition);
const ownership = buildContainerOwnership(markup, getTestDefinition);

const resolve = (sourceId: string, targetId: string, instruction: LayerDropInstruction): DropResolution =>
  validateResolution(resolveDrop({ index, relations: markup.componentRelations, sourceId, targetId, instruction }), markup, ownership, getTestDefinition);

const nodeOf = (id: string): NonNullable<ReturnType<typeof index.nodes.get>> => {
  const node = index.nodes.get(id);
  if (node === undefined)
    throw new Error(`No node ${id}`);
  return node;
};

describe('resolveDrop()', () => {
  it('drops above and below a component, in its container', () => {
    expect(resolve('save', 'phone', { type: 'reorder-above', currentLevel: 2 })).toEqual({ kind: 'move', payload: { componentId: 'save', containerId: 'pane-a', index: 1 } });
    expect(resolve('save', 'phone', { type: 'reorder-below', currentLevel: 2 })).toEqual({ kind: 'move', payload: { componentId: 'save', containerId: 'pane-a', index: 2 } });
  });

  it('accounts for the dragged component leaving its own list', () => {
    expect(resolve('email', 'phone', { type: 'reorder-below', currentLevel: 2 })).toEqual({ kind: 'move', payload: { componentId: 'email', containerId: 'pane-a', index: 1 } });
  });

  it('drops inside a container or a pane at the end', () => {
    expect(resolve('save', 'panel', { type: 'make-child', currentLevel: 0 })).toEqual({ kind: 'move', payload: { componentId: 'save', containerId: 'panel', index: 1 } });
    expect(resolve('save', 'pane-b', { type: 'make-child', currentLevel: 1 })).toEqual({ kind: 'move', payload: { componentId: 'save', containerId: 'pane-b', index: 0 } });
  });

  it('asks for a pane when dropping inside Tabs', () => {
    expect(resolve('save', 'tabs1', { type: 'make-child', currentLevel: 0 })).toEqual({ kind: 'blocked', reason: 'Drop it into one of the tabs.' });
  });

  it('moves out a level when the pointer goes left from the last row of a group', () => {
    expect(resolve('save', 'phone', { type: 'reparent', currentLevel: 2, desiredLevel: 0 })).toEqual({ kind: 'move', payload: { componentId: 'save', containerId: 'root', index: 1 } });
  });

  it('does not place components between panes', () => {
    expect(resolve('save', 'phone', { type: 'reparent', currentLevel: 2, desiredLevel: 1 })).toEqual({ kind: 'blocked', reason: PANE_REORDER_REASON });
  });

  it('blocks drops into the dragged component itself', () => {
    expect(resolve('panel', 'city', { type: 'reorder-above', currentLevel: 1 })).toEqual({ kind: 'blocked', reason: MOVE_INTO_ITSELF_REASON });
  });

  it('respects item limits', () => {
    expect(resolve('save', 'linkText', { type: 'reorder-below', currentLevel: 1 })).toEqual({ kind: 'blocked', reason: 'Link can only hold one component.' });
  });

  it('drops at the end of the form', () => {
    expect(resolveRootEndDrop(markup.componentRelations, 'email')).toEqual({ kind: 'move', payload: { componentId: 'email', containerId: 'root', index: 4 } });
  });
});

describe('normalizeInstruction()', () => {
  const rect = { top: 0, height: 28 };

  it('splits leaf rows in half instead of offering "inside"', () => {
    expect(normalizeInstruction({ type: 'make-child', currentLevel: 0 }, nodeOf('save'), 5, rect).type).toBe('reorder-above');
    expect(normalizeInstruction({ type: 'make-child', currentLevel: 0 }, nodeOf('save'), 20, rect).type).toBe('reorder-below');
  });

  it('treats the whole pane row as "inside"', () => {
    expect(normalizeInstruction({ type: 'reorder-above', currentLevel: 1 }, nodeOf('pane-b'), 2, rect).type).toBe('make-child');
  });

  it('leaves containers alone', () => {
    expect(normalizeInstruction({ type: 'make-child', currentLevel: 0 }, nodeOf('panel'), 14, rect).type).toBe('make-child');
  });
});

describe('panes the canvas does not draw', () => {
  it('refuses drops into a wizard step footer that is turned off, and says why', () => {
    const form: TestComponent[] = [
      { id: 'w1', type: 'wizard', steps: [{ id: 'step-1', title: 'One', components: [], stepFooter: { id: 'footer-1', components: [{ id: 'next', type: 'button' }] } }] },
      { id: 'x', type: 'textField' },
    ];
    const wizardMarkup = buildTestMarkup(form);
    const wizardIndex = buildLayersIndex(wizardMarkup, getTestDefinition);

    expect(resolveDrop({ index: wizardIndex, relations: wizardMarkup.componentRelations, sourceId: 'x', targetId: 'footer-1', instruction: { type: 'make-child', currentLevel: 2 } }))
      .toEqual({ kind: 'blocked', reason: "This part isn't shown on the canvas, so nothing can be dropped into it." });
  });
});
