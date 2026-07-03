import React, { FC } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { ShaForm, useIsDrawingForm } from '@/providers/form';
import { isDefined } from '@/utils/nullables';
import DesignerFormComponent from '../formComponent/designerFormComponent';
import FormComponent from '../formComponent/formComponent';

export interface IConfigurableFormComponentProps {
  id: string;
  model?: IConfigurableFormComponent | undefined;
}

export const ConfigurableFormComponent: FC<IConfigurableFormComponentProps> = ({ id, model }) => {
  const isDrawing = useIsDrawingForm();
  const componentMarkupModel = ShaForm.useComponentModel(id);
  const componentModel = Boolean(model?.isDynamic) ? model : componentMarkupModel;
  const isDesigner = isDrawing && !Boolean(componentModel?.isDynamic);

  if (!isDefined(componentModel)) return null;

  return isDesigner
    ? <DesignerFormComponent componentModel={componentModel} />
    : <FormComponent componentModel={componentModel} />;
};
