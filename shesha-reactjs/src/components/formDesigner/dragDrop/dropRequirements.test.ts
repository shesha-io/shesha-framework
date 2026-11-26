import { IRequiredParent } from '@/interfaces/formDesigner';
import { IConfigurableFormComponent, IFlatComponentsStructure } from '@/providers/form/models';
import { COMPONENT_TYPE_ATTR } from './dragChip';
import { checkDomDrop, findNewRequirementViolations, getDomRequirementViolations, getRequiredParentViolation, getRequirementViolations, getUnmetRequirement } from './dropRequirements';

const MESSAGE = 'A Data Table must be placed inside a Data Context.';
const tableRequirement: IRequiredParent = { types: ['dataContext', 'datatableContext'], message: MESSAGE };
const getRequiredParent = (type: string): IRequiredParent | undefined => (type === 'datatable' ? tableRequirement : undefined);

const component = (id: string, type: string, extra: Record<string, unknown> = {}): IConfigurableFormComponent =>
  ({ id, type, propertyName: id, ...extra }) as IConfigurableFormComponent;

/**
 * A flat markup as the designer keeps it: every component in `parents` points at its container, as listed in
 * `componentRelations`; `containerOwners` maps the containers of their own (a Tab, a Column) to their component.
 */
const markup = (
  components: IConfigurableFormComponent[],
  componentRelations: Record<string, string[]>,
  containerOwners: Record<string, string> = {},
): IFlatComponentsStructure => ({
  allComponents: Object.fromEntries(components.map((c) => [c.id, c])),
  componentRelations,
  parents: {
    ...containerOwners,
    ...Object.fromEntries(Object.entries(componentRelations).flatMap(([containerId, ids]) => ids.map((id) => [id, containerId]))),
  },
});

describe('getUnmetRequirement', () => {
  it('is met by any ancestor of an allowed type', () => {
    expect(getUnmetRequirement('datatable', ['panel', 'dataContext'], getRequiredParent)).toBeUndefined();
  });

  it('returns the requirement when no ancestor meets it', () => {
    expect(getUnmetRequirement('datatable', ['panel'], getRequiredParent)).toBe(tableRequirement);
  });

  it('ignores components without a requirement', () => {
    expect(getUnmetRequirement('textField', [], getRequiredParent)).toBeUndefined();
  });
});

describe('getRequirementViolations', () => {
  it('finds a table in a panel on the root of the form', () => {
    const result = getRequirementViolations(markup(
      [component('panel1', 'panel'), component('table1', 'datatable')],
      { root: ['panel1'], panel1: ['table1'] },
    ), getRequiredParent);
    expect([...result]).toEqual([['table1', MESSAGE]]);
  });

  it('accepts a table nested anywhere inside a data context', () => {
    const result = getRequirementViolations(markup(
      [component('ctx', 'dataContext'), component('panel1', 'panel'), component('table1', 'datatable')],
      { root: ['ctx'], ctx: ['panel1'], panel1: ['table1'] },
    ), getRequiredParent);
    expect(result.size).toBe(0);
  });

  it('follows containers of their own, such as tabs', () => {
    const result = getRequirementViolations(markup(
      [component('ctx', 'dataContext'), component('tabs1', 'tabs'), component('table1', 'datatable')],
      { root: ['ctx'], ctx: ['tabs1'], tabA: ['table1'] },
      { tabA: 'tabs1' },
    ), getRequiredParent);
    expect(result.size).toBe(0);
  });
});

describe('getRequiredParentViolation of components that are no longer on the form', () => {
  it('ignores the children left behind by a deleted Data Context', () => {
    // deleting a component removes it from parents, its children stay in allComponents pointing at it
    const flat = markup([component('table1', 'datatable')], { root: [] }, { table1: 'ctx' });
    expect(getRequiredParentViolation(flat, 'table1', getRequiredParent)).toBeUndefined();
  });

  it('ignores a component inside itself', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const flat = markup([component('panel1', 'panel'), component('table1', 'datatable')], { panel1: ['table1', 'panel1'] });
    expect(getRequiredParentViolation(flat, 'table1', getRequiredParent)).toBeUndefined();
    error.mockRestore();
  });
});

describe('findNewRequirementViolations', () => {
  const ctx = component('ctx', 'dataContext');
  const table = component('table1', 'datatable');

  it('reports a table moved out of its data context', () => {
    const before = markup([ctx, table], { root: ['ctx'], ctx: ['table1'] });
    const after = markup([ctx, table], { root: ['ctx', 'table1'], ctx: [] });
    expect([...findNewRequirementViolations(before, after, getRequiredParent)]).toEqual([['table1', MESSAGE]]);
  });

  it('reports every table inside a container moved out of the data context', () => {
    const panel = component('panel1', 'panel');
    const table2 = component('table2', 'datatable');
    const before = markup([ctx, panel, table, table2], { root: ['ctx'], ctx: ['panel1'], panel1: ['table1', 'table2'] });
    const after = markup([ctx, panel, table, table2], { root: ['ctx', 'panel1'], ctx: [], panel1: ['table1', 'table2'] });
    expect([...findNewRequirementViolations(before, after, getRequiredParent).keys()]).toEqual(['table1', 'table2']);
  });

  it('does not count a table that was already misplaced', () => {
    const before = markup([table], { root: ['table1'] });
    const after = markup([table, component('text1', 'textField')], { root: ['text1', 'table1'] });
    expect(findNewRequirementViolations(before, after, getRequiredParent).size).toBe(0);
  });
});

describe('checkDomDrop', () => {
  const typed = (type: string): HTMLElement => {
    const element = document.createElement('div');
    element.setAttribute(COMPONENT_TYPE_ATTR, type);
    return element;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reports a table dragged into a panel', () => {
    const panel = typed('panel');
    const table = typed('datatable');
    panel.appendChild(table);
    document.body.appendChild(panel);
    expect(checkDomDrop(table, getRequiredParent)).toEqual({ error: MESSAGE, nestedErrors: [] });
  });

  it('accepts a table dragged into a data context', () => {
    const ctx = typed('dataContext');
    const container = document.createElement('div');
    const table = typed('datatable');
    ctx.appendChild(container);
    container.appendChild(table);
    document.body.appendChild(ctx);
    expect(checkDomDrop(table, getRequiredParent)).toEqual({ error: undefined, nestedErrors: [] });
  });

  it('lists every component nested inside the dragged one that would be misplaced, apart from its own error', () => {
    const panel = typed('panel');
    panel.append(typed('datatable'), typed('datatable'));
    document.body.appendChild(panel);
    expect(checkDomDrop(panel, getRequiredParent)).toEqual({ error: undefined, nestedErrors: [MESSAGE, MESSAGE] });
  });

  it('leaves out elements that were already in the wrong place when the drag started', () => {
    const panel = typed('panel');
    const table = typed('datatable');
    panel.appendChild(table);
    document.body.appendChild(panel);
    const preexisting = new Set(getDomRequirementViolations(table, getRequiredParent).keys());
    expect(preexisting.has(table)).toBe(true);

    const other = typed('panel');
    other.appendChild(table);
    document.body.appendChild(other);
    expect(checkDomDrop(table, getRequiredParent, preexisting)).toEqual({ error: undefined, nestedErrors: [] });
  });

  it('still reports a nested element that is newly in the wrong place', () => {
    const ctx = typed('dataContext');
    const panel = typed('panel');
    const table = typed('datatable');
    panel.appendChild(table);
    ctx.appendChild(panel);
    document.body.appendChild(ctx);
    const preexisting = new Set(getDomRequirementViolations(panel, getRequiredParent).keys());
    expect(preexisting.size).toBe(0);

    document.body.appendChild(panel);
    expect(checkDomDrop(panel, getRequiredParent, preexisting).nestedErrors).toEqual([MESSAGE]);
  });

  it('accepts a data context dragged with its table', () => {
    const ctx = typed('dataContext');
    ctx.appendChild(typed('datatable'));
    document.body.appendChild(ctx);
    expect(checkDomDrop(ctx, getRequiredParent)).toEqual({ error: undefined, nestedErrors: [] });
  });
});
