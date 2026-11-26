import { IRequiredParent, IToolboxComponent, IToolboxComponentGroup } from '@/interfaces';
import { getRequiredParentViolation, getRequirementViolations } from '@/components/formDesigner/dragDrop/dropRequirements';
import { IConfigurableFormComponent, IFlatComponentsStructure, IFormSettings } from '@/providers/form/models';
import { FormDesignerArgs, FormDesignerInstance } from '../instance';

// validation and the form settings markup aren't what these tests are about, and need a full application to run
vi.mock('../formValidator', () => ({
  FormValidator: class {
    validateAllComponentsAsync = (): Promise<void> => Promise.resolve();

    validateFormSettingsAsync = (): Promise<never[]> => Promise.resolve([]);
  },
  NULL_DEPENDENCIES_CONTEXT: {},
}));
vi.mock('@/components/formDesigner/formSettings', () => ({ getFormSettingsFormMarkup: () => ({ components: [] }) }));

const MESSAGE = 'A Data Table must be placed inside a Data Context.';

const toolboxComponent = (type: string, extra: Partial<IToolboxComponent> = {}): IToolboxComponent =>
  ({ type, name: type, isInput: false, icon: null, Factory: () => null, ...extra }) as unknown as IToolboxComponent;

const groups: IToolboxComponentGroup[] = [{
  name: 'Test',
  visible: true,
  components: [
    toolboxComponent('datatable', { requiredParent: { types: ['dataContext'], message: MESSAGE } }),
    toolboxComponent('dataContext'),
    toolboxComponent('panel'),
  ],
}];

const component = (id: string, type: string, parentId: string): IConfigurableFormComponent =>
  ({ id, type, propertyName: id, parentId }) as IConfigurableFormComponent;

/** A form with a Data Context holding a Panel that holds a Data Table, next to an empty Panel. */
const makeMarkup = (): IFlatComponentsStructure => ({
  allComponents: {
    ctx: component('ctx', 'dataContext', 'root'),
    inner: component('inner', 'panel', 'ctx'),
    table: component('table', 'datatable', 'inner'),
    outer: component('outer', 'panel', 'root'),
  },
  componentRelations: { root: ['ctx', 'outer'], ctx: ['inner'], inner: ['table'], outer: [] },
  parents: { ctx: 'root', inner: 'ctx', table: 'inner', outer: 'root' },
});

const makeDesigner = (): FormDesignerInstance => new FormDesignerInstance({
  toolboxComponentGroups: groups,
  settingsComponents: [],
  formFlatMarkup: makeMarkup(),
  formSettings: {} as IFormSettings,
  readOnly: false,
  formBuilderFactory: (() => ({})) as unknown as FormDesignerArgs['formBuilderFactory'],
  activeDevice: undefined,
} as unknown as FormDesignerArgs);

const getRequiredParent = (type: string): IRequiredParent | undefined => groups[0]?.components.find((c) => c.type === type)?.requiredParent;

const succeeded = { isSuccess: true, errorMessage: undefined, errors: [], requiresConfirmation: false };

describe('FormDesignerInstance required parent', () => {
  it('adds a Data Table inside a Data Context', () => {
    const designer = makeDesigner();

    expect(designer.addComponent({ containerId: 'ctx', componentType: 'datatable', index: 0 })).toEqual(succeeded);
    expect(designer.state.formFlatMarkup.componentRelations['ctx']).toHaveLength(2);
  });

  it('refuses to add a Data Table outside a Data Context, and says why', () => {
    const designer = makeDesigner();
    const before = designer.state;

    expect(designer.addComponent({ containerId: 'outer', componentType: 'datatable', index: 0 })).toMatchObject({
      isSuccess: false,
      errorMessage: MESSAGE,
      requiresConfirmation: false,
    });
    expect(designer.state).toBe(before);
    expect(designer.canUndo).toBe(false);
  });

  it('refuses moving a Data Table out of its Data Context even when confirmed', () => {
    const designer = makeDesigner();
    const before = designer.state;

    const result = designer.updateChildComponents({ containerId: 'outer', componentIds: ['table'] }, { confirmed: true });
    expect(result).toMatchObject({ isSuccess: false, errorMessage: MESSAGE, requiresConfirmation: false });
    expect(designer.state).toBe(before);
  });

  it('asks to confirm moving a Panel holding a Data Table out of its Data Context, listing every problem', () => {
    const designer = makeDesigner();
    const before = designer.state;

    // SortableJS updates the container the Panel was dropped into first, then the one it came from
    const result = designer.updateChildComponents({ containerId: 'outer', componentIds: ['inner'] });
    expect(result).toEqual({
      isSuccess: false,
      errorMessage: 'A component inside it would miss its required parent.',
      errors: [`datatable: ${MESSAGE}`],
      requiresConfirmation: true,
    });
    expect(designer.updateChildComponents({ containerId: 'ctx', componentIds: [] })).toEqual(succeeded);
    expect(designer.state).toBe(before);
    expect(designer.state.formFlatMarkup.componentRelations['ctx']).toEqual(['inner']);
  });

  it('moves the Panel once confirmed, leaving the Data Table to its validation error', () => {
    const designer = makeDesigner();

    expect(designer.updateChildComponents({ containerId: 'outer', componentIds: ['inner'] }, { confirmed: true })).toEqual(succeeded);

    const markup = designer.state.formFlatMarkup;
    expect(markup.componentRelations['outer']).toEqual(['inner']);
    expect(markup.componentRelations['ctx']).toEqual([]);
    expect(markup.parents['inner']).toBe('outer');
    expect(getRequiredParentViolation(markup, 'table', getRequiredParent)).toBe(MESSAGE);
    expect(designer.canUndo).toBe(true);
  });

  it('moves a Data Table to another place inside its Data Context', () => {
    const designer = makeDesigner();

    expect(designer.updateChildComponents({ containerId: 'ctx', componentIds: ['inner', 'table'] })).toEqual(succeeded);
    expect(designer.updateChildComponents({ containerId: 'inner', componentIds: [] })).toEqual(succeeded);

    expect(designer.state.formFlatMarkup.componentRelations['ctx']).toEqual(['inner', 'table']);
    expect(designer.state.formFlatMarkup.componentRelations['inner']).toEqual([]);
    expect(designer.state.formFlatMarkup.parents['table']).toBe('ctx');
  });

  it('still lets a component move between other containers', () => {
    const designer = makeDesigner();
    designer.addComponent({ containerId: 'root', componentType: 'panel', index: 2 });
    const added = designer.state.formFlatMarkup.componentRelations['root']?.[2] ?? '';

    expect(designer.updateChildComponents({ containerId: 'outer', componentIds: [added] })).toEqual(succeeded);
    expect(designer.updateChildComponents({ containerId: 'root', componentIds: ['ctx', 'outer'] })).toEqual(succeeded);

    expect(designer.state.formFlatMarkup.componentRelations['outer']).toEqual([added]);
    expect(designer.state.formFlatMarkup.componentRelations['root']).toEqual(['ctx', 'outer']);
  });
});

describe('FormDesignerInstance keeps the parents of components up to date', () => {
  it('for a component added to the form, so a Data Table can go inside it', () => {
    const designer = makeDesigner();
    designer.addComponent({ containerId: 'ctx', componentType: 'panel', index: 1 });
    const added = designer.state.formFlatMarkup.componentRelations['ctx']?.[1] ?? '';
    expect(designer.state.formFlatMarkup.parents[added]).toBe('ctx');

    expect(designer.addComponent({ containerId: added, componentType: 'datatable', index: 0 })).toEqual(succeeded);
  });

  it('for a duplicated component and the components inside it', () => {
    const designer = makeDesigner();
    designer.duplicateComponent({ componentId: 'inner' });
    const markup = designer.state.formFlatMarkup;
    const clone = markup.componentRelations['ctx']?.[1] ?? '';
    const tableClone = markup.componentRelations[clone]?.[0] ?? '';

    expect(markup.parents[clone]).toBe('ctx');
    expect(markup.parents[tableClone]).toBe(clone);
    expect(getRequiredParentViolation(markup, tableClone, getRequiredParent)).toBeUndefined();
  });

  it('for a deleted component, whose children are no longer on the form', () => {
    const designer = makeDesigner();
    designer.deleteComponent({ componentId: 'ctx' });
    const markup = designer.state.formFlatMarkup;

    expect(markup.parents['ctx']).toBeUndefined();
    expect(getRequirementViolations(markup, getRequiredParent).size).toBe(0);
  });
});
