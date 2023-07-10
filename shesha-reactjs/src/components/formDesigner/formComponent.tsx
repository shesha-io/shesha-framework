import { IPropertySetting, useGlobalState } from 'providers';
import React, { FC, MutableRefObject } from 'react';
import { useForm } from '../../providers/form';

export interface IFormComponentProps {
  id: string;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ id, componentRef }) => {
  const { getComponentModel, formData, form, formMode, getToolboxComponent } = useForm();
  const { globalState } = useGlobalState();

  const model = getComponentModel(id);
  const toolboxComponent = getToolboxComponent(model.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  const getActualModel = (model) => {
    const m = {...model};
    const settings = m.settings;

    for (var prop in settings) {
      if (!Object.prototype.hasOwnProperty.call(settings, prop)) continue;
      const setting = settings[prop] as IPropertySetting;
      if (setting?.mode === 'code' && Boolean(setting?.code)) {
        const val = new Function('value, data, staticSetting, globalState, formMode', setting?.code)
          (formData?.[model.name], formData, setting?.value, globalState, formMode);

        const propNames = prop.split('.');
        let obj = m;
        let i = 1;
        while(i < propNames.length) {
          if (typeof obj[propNames[i - 1]] === 'undefined')
            obj[propNames[i - 1]] = {};
          obj = obj[propNames[i - 1]];
          i++;
        }
        obj[propNames[propNames.length - 1]] = val;
      }
    }
    return m;
  };

  const actualModel = getActualModel(model);

  return <>{toolboxComponent.factory(actualModel, componentRef, form)}</>;
};

export default FormComponent;
