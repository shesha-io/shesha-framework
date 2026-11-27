import { buildTestMarkup, getTestDefinition, sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { buildLayersIndex } from '../buildLayersIndex';
import { getAllExpandable, getDefaultExpanded, getExpandedStorageKey, getPathTo, readExpanded, toggleExpanded, withPathTo, writeExpanded } from '../expanded';

const index = buildLayersIndex(buildTestMarkup(sampleForm()), getTestDefinition);

describe('expanded rows: storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('builds a key per form', () => {
    expect(getExpandedStorageKey('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe('shaDesigner.toolbox.layers.expanded.3fa85f64-5717-4562-b3fc-2c963f66afa6');
    expect(getExpandedStorageKey({ module: 'Shesha', name: 'person-details' })).toBe('shaDesigner.toolbox.layers.expanded.Shesha/person-details');
    expect(getExpandedStorageKey({ module: null, name: 'person-details' })).toBe('shaDesigner.toolbox.layers.expanded.person-details');
    expect(getExpandedStorageKey(undefined)).toBeUndefined();
  });

  it('remembers expanded rows', () => {
    writeExpanded('key', new Set(['a', 'b']));
    expect([...(readExpanded('key') ?? [])]).toEqual(['a', 'b']);
  });

  it('ignores missing or invalid stored values', () => {
    expect(readExpanded('nothing-here')).toBeUndefined();
    window.localStorage.setItem('broken', '{not json');
    expect(readExpanded('broken')).toBeUndefined();
    window.localStorage.setItem('object', '{"a":1}');
    expect(readExpanded('object')).toBeUndefined();
  });

  it('never throws when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readExpanded('key')).toBeUndefined();
    expect(() => writeExpanded('key', new Set(['a']))).not.toThrow();
  });
});

describe('expanded rows: sets', () => {
  it('opens the top level and the path to the selection by default', () => {
    expect([...getDefaultExpanded(index, 'email')].sort()).toEqual(['link1', 'pane-a', 'panel', 'save', 'tabs1']);
  });

  it('expands everything that has children', () => {
    expect([...getAllExpandable(index)].sort()).toEqual(['link1', 'pane-a', 'panel', 'tabs1']);
  });

  it('collapses to the path of the selection', () => {
    expect([...getPathTo(index, 'email')]).toEqual(['tabs1', 'pane-a']);
    expect([...getPathTo(index, undefined)]).toEqual([]);
  });

  it('toggles one row or a whole subtree', () => {
    expect([...toggleExpanded(new Set(), index, 'tabs1', false)]).toEqual(['tabs1']);
    expect([...toggleExpanded(new Set(), index, 'tabs1', true)].sort()).toEqual(['pane-a', 'tabs1']);
    expect([...toggleExpanded(new Set(['tabs1', 'pane-a']), index, 'tabs1', true)]).toEqual([]);
  });

  it('adds the path to a row, returning the same set when it is already open', () => {
    const open = new Set(['tabs1', 'pane-a']);
    expect(withPathTo(open, index, 'email')).toBe(open);
    expect([...withPathTo(new Set(), index, 'email')]).toEqual(['tabs1', 'pane-a']);
  });
});
