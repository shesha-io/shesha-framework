import { useGlobalState } from 'providers';
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
    for (var prop in m) {
      if (prop.endsWith('_setting') && m[prop]?.mode === 'code' && Boolean(m[prop]?.code)) {
        const val = new Function('value, data, globalState, formMode', m[prop]?.code)
          (formData?.[model.name], formData, globalState, formMode);

        const propNames = prop.replace('_setting', '').split('.');
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
  }

  const actualModel = getActualModel(model);

  return <>{toolboxComponent.factory(actualModel, componentRef, form)}</>;
};

export default FormComponent;
