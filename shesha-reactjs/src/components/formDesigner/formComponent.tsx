import React, { FC, MutableRefObject } from 'react';
import { useForm } from '../../providers/form';

export interface IFormComponentProps {
  id: string;
  componentRef: MutableRefObject<any>;
}

const FormComponent: FC<IFormComponentProps> = ({ id, componentRef }) => {
  const { getComponentModel, formData, form, getToolboxComponent } = useForm();

  const model = getComponentModel(id);
  const toolboxComponent = getToolboxComponent(model.type);
  if (!toolboxComponent) return <div>Component not found</div>;

  const getActualModel = (model) => {
    const m = {...model};
    for (var prop in m) {
      if (prop.endsWith('_setting') && m[prop]?.mode === 'code' && Boolean(m[prop]?.code)) {
        const propName = prop.replace('_setting', '');
        m[propName] = new Function('data', m[prop]?.code)(formData);
      }
      /*if (m[prop + '_setting']?.mode === 'code' && Boolean(m[prop + '_setting']?.code))
        m[prop] = new Function('data', m[prop + '_setting']?.code)(formData);*/
    }
    return m;
  }

  const actualModel = getActualModel(model);

  return <>{toolboxComponent.factory(actualModel, componentRef, form)}</>;
};

export default FormComponent;
