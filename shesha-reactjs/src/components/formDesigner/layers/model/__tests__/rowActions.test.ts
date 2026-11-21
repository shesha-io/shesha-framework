import { buildContainerOwnership } from '@/providers/formDesigner/structure/containers';
import { buildTestMarkup, getTestDefinition, sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { describeMove, getMoveDownAction, getMoveOutAction, getMoveUpAction } from '../rowActions';

const markup = buildTestMarkup(sampleForm());
const ownership = buildContainerOwnership(markup, getTestDefinition);

describe('row actions', () => {
  it('moves up within the container, but not past the top', () => {
    expect(getMoveUpAction(markup, 'phone')).toEqual({ enabled: true, payload: { componentId: 'phone', containerId: 'pane-a', index: 0 } });
    expect(getMoveUpAction(markup, 'email')).toEqual({ enabled: false, reason: 'Already at the top' });
  });

  it('moves down within the container, but not past the bottom', () => {
    expect(getMoveDownAction(markup, 'email')).toEqual({ enabled: true, payload: { componentId: 'email', containerId: 'pane-a', index: 1 } });
    expect(getMoveDownAction(markup, 'phone')).toEqual({ enabled: false, reason: 'Already at the bottom' });
  });

  it('moves out to just after the owning component', () => {
    expect(getMoveOutAction(markup, ownership, 'email')).toEqual({ enabled: true, payload: { componentId: 'email', containerId: 'root', index: 1 } });
    expect(getMoveOutAction(markup, ownership, 'save')).toEqual({ enabled: false, reason: 'Already at the top level' });
  });

  it('describes a move for screen readers', () => {
    expect(describeMove(markup, ownership, getTestDefinition, { componentId: 'email', containerId: 'pane-b', index: 0 })).toBe('Moved Email into Address, position 1 of 1.');
    expect(describeMove(markup, ownership, getTestDefinition, { componentId: 'city', containerId: 'root', index: 4 })).toBe('Moved City into the form, position 5 of 5.');
  });
});
