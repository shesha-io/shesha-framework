import { buildTestMarkup, getTestDefinition, sampleForm, TestComponent } from '@/providers/formDesigner/__tests__/testMarkup';
import { buildLayersIndex } from '../buildLayersIndex';
import { getAncestorAtDepth, getAncestorIds, getVisibleRows } from '../visibleRows';

const index = buildLayersIndex(buildTestMarkup(sampleForm()), getTestDefinition);

describe('getVisibleRows()', () => {
  it('shows only top-level rows when nothing is expanded', () => {
    expect(getVisibleRows(index, new Set()).map((row) => row.id)).toEqual(['tabs1', 'panel', 'link1', 'save']);
  });

  it('shows the children of expanded rows, with their tree positions', () => {
    const rows = getVisibleRows(index, new Set(['tabs1', 'pane-a']));

    expect(rows.map((row) => row.id)).toEqual(['tabs1', 'pane-a', 'email', 'phone', 'pane-b', 'panel', 'link1', 'save']);
    expect(rows.find((row) => row.id === 'email')).toMatchObject({ depth: 2, posInSet: 1, setSize: 2, isLastInGroup: false });
    expect(rows.find((row) => row.id === 'phone')).toMatchObject({ posInSet: 2, isLastInGroup: true });
    expect(rows.find((row) => row.id === 'tabs1')).toMatchObject({ hasChildren: true, isExpanded: true });
    expect(rows.find((row) => row.id === 'pane-b')).toMatchObject({ hasChildren: false, isExpanded: false });
  });

  it('with a search, shows only the given rows, fully expanded', () => {
    const rows = getVisibleRows(index, new Set(), new Set(['tabs1', 'pane-a', 'email']));

    expect(rows.map((row) => row.id)).toEqual(['tabs1', 'pane-a', 'email']);
    expect(rows.every((row) => row.id === 'email' || row.isExpanded)).toBe(true);
    expect(rows.find((row) => row.id === 'email')).toMatchObject({ posInSet: 1, setSize: 1 });
  });
});

describe('ancestors', () => {
  it('lists ancestors from the top level down', () => {
    expect(getAncestorIds(index, 'email')).toEqual(['tabs1', 'pane-a']);
    expect(getAncestorIds(index, 'save')).toEqual([]);
  });

  it('finds the ancestor at a depth', () => {
    expect(getAncestorAtDepth(index, 'email', 0)?.id).toBe('tabs1');
    expect(getAncestorAtDepth(index, 'email', 1)?.id).toBe('pane-a');
    expect(getAncestorAtDepth(index, 'email', 2)?.id).toBe('email');
  });
});

describe('getVisibleRows() on a large form', () => {
  it('lists 2,000 expanded rows in under 10 ms', () => {
    const form: TestComponent[] = Array.from({ length: 40 }, (_, c) => ({
      id: `panel-${c}`,
      type: 'container',
      components: Array.from({ length: 49 }, (_unused, f) => ({ id: `field-${c}-${f}`, type: 'textField' })),
    }));
    const big = buildLayersIndex(buildTestMarkup(form), getTestDefinition);
    const expanded = new Set(big.rootIds);
    getVisibleRows(big, expanded); // warm up

    // the fastest of a few runs, so a busy test machine doesn't fail it
    const times = Array.from({ length: 5 }, () => {
      const started = performance.now();
      getVisibleRows(big, expanded);
      return performance.now() - started;
    });

    expect(Math.min(...times)).toBeLessThan(10);
    expect(getVisibleRows(big, expanded)).toHaveLength(2000);
  });
});
