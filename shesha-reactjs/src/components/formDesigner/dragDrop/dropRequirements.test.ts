import { IRequiredParent } from '@/interfaces/formDesigner';
import { IConfigurableFormComponent, IFlatComponentsStructure } from '@/providers/form/models';
import { COMPONENT_TYPE_ATTR } from './dragChip';
import { findDomRequirementViolation, findNewRequirementViolation, getDomRequirementViolations, getRequirementViolations, getUnmetRequirement } from './dropRequirements';

const MESSAGE = 'A Data Table must be placed inside a Data Context.';
const tableRequirement: IRequiredParent = { types: ['dataContext', 'datatableContext'], message: MESSAGE };
const getRequiredParent = (type: string): IRequiredParent | undefined => (type === 'datatable' ? tableRequirement : undefined);

const component = (id: string, type: string, extra: Record<string, unknown> = {}): IConfigurableFormComponent =>
  ({ id, type, propertyName: id, ...extra }) as IConfigurableFormComponent;

const markup = (components: IConfigurableFormComponent[], componentRelations: Record<string, string[]>): IFlatComponentsStructure => ({
  allComponents: Object.fromEntries(components.map((c) => [c.id, c])),
  componentRelations,
  parents: {},
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

  it('follows containers held by array items, such as tabs', () => {
    const tabs = component('tabs1', 'tabs', { tabs: [{ id: 'tabA', title: 'A' }] });
    const result = getRequirementViolations(markup(
      [component('ctx', 'dataContext'), tabs, component('table1', 'datatable')],
      { root: ['ctx'], ctx: ['tabs1'], tabA: ['table1'] },
    ), getRequiredParent);
    expect(result.size).toBe(0);
  });

  it('follows containers held by properties, such as a panel header', () => {
    const panel = component('panel1', 'panel', { header: { id: 'panel1-header', components: [] } });
    const result = getRequirementViolations(markup(
      [panel, component('table1', 'datatable')],
      { root: ['panel1'], 'panel1-header': ['table1'] },
    ), getRequiredParent);
    expect([...result.keys()]).toEqual(['table1']);
  });
});

describe('getRequirementViolations of components that are no longer on the form', () => {
  it('ignores the children left behind by a deleted Data Context', () => {
    // deleting a component removes its container, its children stay in allComponents but in no container
    const result = getRequirementViolations(markup(
      [component('table1', 'datatable')],
      { root: [] },
    ), getRequiredParent);
    expect(result.size).toBe(0);
  });

  it('ignores, with a warning, a component that ends up inside itself', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = getRequirementViolations(markup(
      [component('panel1', 'panel'), component('table1', 'datatable')],
      { panel1: ['table1', 'panel1'] },
    ), getRequiredParent);
    expect(result.size).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe('findNewRequirementViolation', () => {
  const ctx = component('ctx', 'dataContext');
  const table = component('table1', 'datatable');

  it('reports a table moved out of its data context', () => {
    const before = markup([ctx, table], { root: ['ctx'], ctx: ['table1'] });
    const after = markup([ctx, table], { root: ['ctx', 'table1'], ctx: [] });
    expect(findNewRequirementViolation(before, after, getRequiredParent)).toBe(MESSAGE);
  });

  it('reports a container moved out of the data context with a table inside it', () => {
    const panel = component('panel1', 'panel');
    const before = markup([ctx, panel, table], { root: ['ctx'], ctx: ['panel1'], panel1: ['table1'] });
    const after = markup([ctx, panel, table], { root: ['ctx', 'panel1'], ctx: [], panel1: ['table1'] });
    expect(findNewRequirementViolation(before, after, getRequiredParent)).toBe(MESSAGE);
  });

  it('does not block changes to a form whose table was already misplaced', () => {
    const before = markup([table], { root: ['table1'] });
    const after = markup([table, component('text1', 'textField')], { root: ['text1', 'table1'] });
    expect(findNewRequirementViolation(before, after, getRequiredParent)).toBeUndefined();
  });
});

describe('findDomRequirementViolation', () => {
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
    expect(findDomRequirementViolation(table, getRequiredParent)).toBe(MESSAGE);
  });

  it('accepts a table dragged into a data context', () => {
    const ctx = typed('dataContext');
    const container = document.createElement('div');
    const table = typed('datatable');
    ctx.appendChild(container);
    container.appendChild(table);
    document.body.appendChild(ctx);
    expect(findDomRequirementViolation(table, getRequiredParent)).toBeUndefined();
  });

  it('checks components nested inside the dragged one', () => {
    const panel = typed('panel');
    panel.appendChild(typed('datatable'));
    document.body.appendChild(panel);
    expect(findDomRequirementViolation(panel, getRequiredParent)).toBe(MESSAGE);
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
    expect(findDomRequirementViolation(table, getRequiredParent, preexisting)).toBeUndefined();
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
    expect(findDomRequirementViolation(panel, getRequiredParent, preexisting)).toBe(MESSAGE);
  });

  it('accepts a data context dragged with its table', () => {
    const ctx = typed('dataContext');
    ctx.appendChild(typed('datatable'));
    document.body.appendChild(ctx);
    expect(findDomRequirementViolation(ctx, getRequiredParent)).toBeUndefined();
  });
});
