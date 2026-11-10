import { getDropTargetInfo } from './dropTargetInfo';

describe('getDropTargetInfo', () => {
  it('names containers outside any component after the form', () => {
    expect(getDropTargetInfo(undefined, 'root')).toEqual({ label: 'Form', frame: 'container' });
  });

  it('frames the whole component for its own container', () => {
    const owner = { name: 'Container', model: { id: 'c1' } };
    expect(getDropTargetInfo(owner, 'c1')).toEqual({ label: 'Container', frame: 'component' });
  });

  it('frames the whole component for its main area', () => {
    const owner = { name: 'Panel', model: { id: 'p1', header: { id: 'h1' }, content: { id: 'b1' } } };
    expect(getDropTargetInfo(owner, 'b1')).toEqual({ label: 'Panel', frame: 'component' });
  });

  it('names and frames a part of the component on its own', () => {
    const owner = { name: 'Panel', model: { id: 'p1', header: { id: 'h1' }, content: { id: 'b1' }, customHeader: { id: 'ch1' } } };
    expect(getDropTargetInfo(owner, 'h1')).toEqual({ label: 'Panel › Header', frame: 'container' });
    expect(getDropTargetInfo(owner, 'ch1')).toEqual({ label: 'Panel › Custom header', frame: 'container' });
  });

  it('names array items by their title', () => {
    const owner = { name: 'Tabs', model: { id: 't1', tabs: [{ id: 'a', title: 'Details' }, { id: 'b', title: 'History' }] } };
    expect(getDropTargetInfo(owner, 'b')).toEqual({ label: 'Tabs › History', frame: 'container' });
  });

  it('numbers array items without a title', () => {
    const owner = { name: 'Columns', model: { id: 'c1', columns: [{ id: 'a' }, { id: 'b' }] } };
    expect(getDropTargetInfo(owner, 'b')).toEqual({ label: 'Columns › Column 2', frame: 'container' });
  });

  it('names containers nested in array items', () => {
    const owner = { name: 'Wizard', model: { id: 'w1', steps: [{ id: 's1', title: 'Start', stepFooter: { id: 'f1' } }] } };
    expect(getDropTargetInfo(owner, 'f1')).toEqual({ label: 'Wizard › Start step footer', frame: 'container' });
  });

  it('falls back to the whole component when the container is not found in its model', () => {
    const owner = { name: 'Data Context', model: { id: 'd1' } };
    expect(getDropTargetInfo(owner, 'unknown')).toEqual({ label: 'Data Context', frame: 'component' });
  });
});
