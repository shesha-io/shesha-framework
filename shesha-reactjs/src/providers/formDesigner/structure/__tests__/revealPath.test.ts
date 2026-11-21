import { buildTestMarkup, getTestDefinition, sampleForm, TestComponent } from '../../__tests__/testMarkup';
import { buildContainerOwnership } from '../containers';
import { getRevealPath } from '../revealPath';

const pathFor = (components: TestComponent[], id: string): string[] => {
  const markup = buildTestMarkup(components);
  return getRevealPath(markup, buildContainerOwnership(markup, getTestDefinition), id);
};

describe('getRevealPath()', () => {
  it('opens the tab a field sits in', () => {
    expect(pathFor(sampleForm(), 'email')).toEqual(['pane-a']);
  });

  it('needs nothing for top-level components or plain containers', () => {
    expect(pathFor(sampleForm(), 'save')).toEqual([]);
    expect(pathFor(sampleForm(), 'city')).toEqual([]);
  });

  it('opens a clicked pane itself', () => {
    expect(pathFor(sampleForm(), 'pane-b')).toEqual(['pane-b']);
  });

  it('opens nested panes outermost first', () => {
    const form: TestComponent[] = [{
      id: 'panel1',
      type: 'collapsiblePanel',
      header: { id: 'header-1', components: [] },
      content: {
        id: 'content-1',
        components: [{ id: 'innerTabs', type: 'tabs', tabs: [{ id: 'pane-x', key: 'x', title: 'X', components: [{ id: 'deep', type: 'textField' }] }] }],
      },
    }];
    expect(pathFor(form, 'deep')).toEqual(['content-1', 'pane-x']);
  });

  it('opens the step that holds a footer before the footer', () => {
    const form: TestComponent[] = [{
      id: 'w1',
      type: 'wizard',
      steps: [{ id: 'step-1', title: 'One', components: [], stepFooter: { id: 'footer-1', components: [{ id: 'next', type: 'button' }] } }],
    }];
    expect(pathFor(form, 'next')).toEqual(['step-1', 'footer-1']);
  });
});
