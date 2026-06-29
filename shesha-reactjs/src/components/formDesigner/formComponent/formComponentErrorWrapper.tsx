import { IConfigurableFormComponent } from '@/interfaces';
import { FormComponentValidationProvider } from '@/providers/validationErrors';
import React, { FC, PropsWithChildren } from 'react';
import { CustomErrorBoundary } from '../..';

export interface IFormComponentErrorWrapperProps {
  componentModel: IConfigurableFormComponent;
}

const FormComponentErrorWrapper: FC<PropsWithChildren<IFormComponentErrorWrapperProps>> = ({ componentModel, children }) => {
  return (
    <CustomErrorBoundary componentName={componentModel.componentName} componentType={componentModel.type} componentId={componentModel.id}>
      <FormComponentValidationProvider
        componentId={componentModel.id}
        componentName={componentModel.componentName ?? ""}
        componentType={componentModel.type}
      >
        {children}
      </FormComponentValidationProvider>
    </CustomErrorBoundary>
  );
};

export default FormComponentErrorWrapper;
