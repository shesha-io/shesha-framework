import { IConfigurableFormComponent } from '@/interfaces';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { FormComponentValidationProvider } from '@/providers/validationErrors';
import { isDefined } from '@/utils/nullables';
import React, { FC } from 'react';
import { CustomErrorBoundary } from '../..';
import { UnknownFormComponent } from './unknownFormComponent';
import { KnownFormComponent } from './knownFormComponent';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
}

const FormComponent: FC<IFormComponentProps> = ({ componentModel }) => {
  const getToolboxComponent = useFormDesignerComponentGetter();
  const toolboxComponent = getToolboxComponent(componentModel.type);
  return (
    <CustomErrorBoundary componentName={componentModel.componentName} componentType={componentModel.type} componentId={componentModel.id}>
      <FormComponentValidationProvider
        componentId={componentModel.id}
        componentName={componentModel.componentName ?? ""}
        componentType={componentModel.type}
      >
        {isDefined(toolboxComponent)
          ? <KnownFormComponent componentModel={componentModel} toolboxComponent={toolboxComponent} />
          : <UnknownFormComponent componentModel={componentModel} />}
      </FormComponentValidationProvider>
    </CustomErrorBoundary>
  );
};

const FormComponentMemo = React.memo(FormComponent);
export default FormComponentMemo;
