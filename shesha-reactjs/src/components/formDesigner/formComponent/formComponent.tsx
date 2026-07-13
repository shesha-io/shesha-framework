import { IConfigurableFormComponent } from '@/interfaces';
import { isDefined } from '@/utils/nullables';
import React, { FC } from 'react';
import { UnknownFormComponent } from './unknownFormComponent';
import KnownFormComponent from './knownFormComponent';
import FormComponentErrorWrapper from './formComponentErrorWrapper';
import { FormComponentModelPreparer } from './formComponentModelPreparer';

export interface IFormComponentProps {
  componentModel: IConfigurableFormComponent;
}

const FormComponent: FC<IFormComponentProps> = ({ componentModel }) => {
  return (
    <FormComponentErrorWrapper componentModel={componentModel}>
      <FormComponentModelPreparer componentModel={componentModel}>
        {(componentModelPrepared, toolboxComponent) => {
          return isDefined(toolboxComponent)
            ? <KnownFormComponent componentModel={componentModelPrepared} toolboxComponent={toolboxComponent} />
            : <UnknownFormComponent componentModel={componentModelPrepared} />;
        }}
      </FormComponentModelPreparer>
    </FormComponentErrorWrapper>
  );
};

const FormComponentMemo = React.memo(FormComponent);
export default FormComponentMemo;
