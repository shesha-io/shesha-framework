import TableComponent from './tableComponent';
import { upgradeComponent } from '@/providers/form/utils';
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { ITableComponentProps } from './models';

const emptyFlatStructure = { allComponents: {}, componentRelations: {}, parents: {} };

const upgrade = (model: IConfigurableFormComponent, isNew: boolean): ITableComponentProps =>
  upgradeComponent(model, TableComponent as unknown as IToolboxComponent, DEFAULT_FORM_SETTINGS, emptyFlatStructure, isNew) as ITableComponentProps;

const baseModel: IConfigurableFormComponent = {
  id: 'dt1',
  type: 'datatable',
  propertyName: 'datatable1',
  componentName: 'datatable1',
  label: 'datatable1',
  parentId: 'root',
  isDynamic: false,
};

describe('datatable migrations - visible', () => {
  it('a freshly added table is visible', () => {
    const initial = TableComponent.initModel!({ ...baseModel, hidden: false } as ITableComponentProps);
    const model = upgrade(initial, true);
    expect(model.visible).toBe(true);
    expect(model.hidden).toBeUndefined();
  });

  it('a stored table without hidden/visible defaults to visible', () => {
    const model = upgrade({ ...baseModel, version: 29 }, false);
    expect(model.visible).toBe(true);
  });

  it('a stored hidden table stays hidden', () => {
    const model = upgrade({ ...baseModel, version: 29, hidden: true }, false);
    expect(model.visible).toBe(false);
  });

  it('a table already migrated to visible: false stays hidden', () => {
    const model = upgrade({ ...baseModel, version: 30, visible: false } as unknown as IConfigurableFormComponent, false);
    expect(model.visible).toBe(false);
    expect(model.hidden).toBeUndefined();
  });

  it('a js visibility setting is preserved', () => {
    const setting = { _mode: 'code', _code: 'return data.x;', _value: false };
    const model = upgrade({ ...baseModel, version: 30, visible: setting } as unknown as IConfigurableFormComponent, false);
    expect(model.visible).toEqual(setting);
  });
});
