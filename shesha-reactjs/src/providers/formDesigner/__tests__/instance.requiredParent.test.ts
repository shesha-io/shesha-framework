import { IToolboxComponent, IToolboxComponentGroup } from '@/interfaces';
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
  parents: {},
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

describe('FormDesignerInstance required parent', () => {
  it('adds a Data Table inside a Data Context', () => {
    const designer = makeDesigner();

    expect(designer.addComponent({ containerId: 'ctx', componentType: 'datatable', index: 0 })).toBeUndefined();
    expect(designer.state.formFlatMarkup.componentRelations['ctx']).toHaveLength(2);
  });

  it('refuses to add a Data Table outside a Data Context, and says why', () => {
    const designer = makeDesigner();
    const before = designer.state;

    expect(designer.addComponent({ containerId: 'outer', componentType: 'datatable', index: 0 })).toBe(MESSAGE);
    expect(designer.state).toBe(before);
    expect(designer.canUndo).toBe(false);
  });

  it('refuses to move a Panel holding a Data Table out of its Data Context, and keeps it in place', () => {
    const designer = makeDesigner();
    const before = designer.state;

    // SortableJS updates the container the Panel was dropped into first, then the one it came from
    expect(designer.updateChildComponents({ containerId: 'outer', componentIds: ['inner'] })).toBe(MESSAGE);
    expect(designer.updateChildComponents({ containerId: 'ctx', componentIds: [] })).toBeUndefined();

    expect(designer.state).toBe(before);
    expect(designer.state.formFlatMarkup.componentRelations['ctx']).toEqual(['inner']);
  });

  it('moves a Data Table to another place inside its Data Context', () => {
    const designer = makeDesigner();

    expect(designer.updateChildComponents({ containerId: 'ctx', componentIds: ['inner', 'table'] })).toBeUndefined();
    expect(designer.updateChildComponents({ containerId: 'inner', componentIds: [] })).toBeUndefined();

    expect(designer.state.formFlatMarkup.componentRelations['ctx']).toEqual(['inner', 'table']);
    expect(designer.state.formFlatMarkup.componentRelations['inner']).toEqual([]);
  });

  it('still lets a component move between other containers', () => {
    const designer = makeDesigner();
    designer.addComponent({ containerId: 'root', componentType: 'panel', index: 2 });
    const added = designer.state.formFlatMarkup.componentRelations['root']?.[2] ?? '';

    expect(designer.updateChildComponents({ containerId: 'outer', componentIds: [added] })).toBeUndefined();
    expect(designer.updateChildComponents({ containerId: 'root', componentIds: ['ctx', 'outer'] })).toBeUndefined();

    expect(designer.state.formFlatMarkup.componentRelations['outer']).toEqual([added]);
    expect(designer.state.formFlatMarkup.componentRelations['root']).toEqual(['ctx', 'outer']);
  });
});
