import SubFormComponent, { ISubFormComponentProps } from './index';
import { upgradeComponent } from '@/providers/form/utils';
import { DEFAULT_FORM_SETTINGS, IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';

const emptyFlatStructure = { allComponents: {}, componentRelations: {}, parents: {} };

const upgrade = (model: IConfigurableFormComponent): ISubFormComponentProps =>
  upgradeComponent(model, SubFormComponent as unknown as IToolboxComponent, DEFAULT_FORM_SETTINGS, emptyFlatStructure, false) as ISubFormComponentProps;

const baseModel: IConfigurableFormComponent = {
  id: 'sf1',
  type: 'subForm',
  propertyName: 'subForm1',
  componentName: 'subForm1',
  label: 'Sub Form1',
  parentId: 'root',
  isDynamic: false,
};

describe('subForm migrations - label and wrapper cols', () => {
  it('resets the hidden-label 0/24 combination to the defaults (v6)', () => {
    const model = upgrade({ ...baseModel, version: 5, hideLabel: true, labelCol: 0, wrapperCol: 24 } as ISubFormComponentProps);
    expect(model.labelCol).toBe(8);
    expect(model.wrapperCol).toBe(16);
  });

  it('keeps deliberately configured cols when the label is not hidden', () => {
    const model = upgrade({ ...baseModel, version: 5, hideLabel: false, labelCol: 0, wrapperCol: 24 } as ISubFormComponentProps);
    expect(model.labelCol).toBe(0);
    expect(model.wrapperCol).toBe(24);
  });

  it('copies root cols into the device slots the Appearance tab reads (v7)', () => {
    const model = upgrade({ ...baseModel, version: 6, labelCol: 5, wrapperCol: 19 } as ISubFormComponentProps);
    expect(model.desktop).toMatchObject({ labelCol: 5, wrapperCol: 19 });
    expect(model.tablet).toMatchObject({ labelCol: 5, wrapperCol: 19 });
    expect(model.mobile).toMatchObject({ labelCol: 5, wrapperCol: 19 });
  });

  it('a 0.43-era subform ends with its configured cols visible on every device slot', () => {
    const model = upgrade({ ...baseModel, version: 3, labelCol: 8, wrapperCol: 16 } as ISubFormComponentProps);
    expect(model.labelCol).toBe(8);
    expect(model.wrapperCol).toBe(16);
    expect(model.desktop).toMatchObject({ labelCol: 8, wrapperCol: 16 });
  });

  it('device values already set in 0.46 win over the copied root ones', () => {
    const model = upgrade({ ...baseModel, version: 6, labelCol: 8, wrapperCol: 16, desktop: { labelCol: 2 } } as ISubFormComponentProps);
    expect(model.desktop).toMatchObject({ labelCol: 2, wrapperCol: 16 });
  });
});
