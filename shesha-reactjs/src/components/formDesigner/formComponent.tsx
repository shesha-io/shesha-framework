import { isPropertySettings } from 'designer-components/_settings/utils';
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

    for (var propName in m) {
      if (!Object.prototype.hasOwnProperty.call(m, propName)) continue;
      
      const propNames = propName.split('.');
      let obj = m;
      let i = 1;
      while(i < propNames.length) {
        if (typeof obj[propNames[i - 1]] === 'undefined')
          obj[propNames[i - 1]] = {};
        obj = obj[propNames[i - 1]];
        i++;
      }

      const value = obj[propNames[propNames.length - 1]];

      if (!value) continue;

      if (typeof value === 'object') {
        if (isPropertySettings(value)) {
          const setting = value as IPropertySetting;
          if (setting?._mode === 'code' && Boolean(setting?._code)) {
            const val = new Function('value, data, staticValue, globalState, formMode', setting?._code)
              (formData?.[model.name], formData, setting?._value, globalState, formMode);
            obj[propNames[propNames.length - 1]] = val;
          } else {
            obj[propNames[propNames.length - 1]] = setting?._value;
          }
        }
      }
    }
    return m;
  };

  const actualModel = getActualModel(model);

  return <>{toolboxComponent.factory(actualModel, componentRef, form)}</>;
};

export default FormComponent;
