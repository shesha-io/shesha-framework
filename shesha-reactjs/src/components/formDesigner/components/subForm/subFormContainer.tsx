import React, { FC, Fragment, useCallback } from 'react';
import { useGlobalState, useSubForm } from '../../../../providers';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { executeScriptSync } from '../../../../utils/publicUtils';
import DynamicComponent from '../dynamicView/dynamicComponent';

interface IDynamicConfigurableFormComponent extends IConfigurableFormComponent {
  components?: IDynamicConfigurableFormComponent[];
}

export interface ISubFormContainerProps {
  components: IDynamicConfigurableFormComponent[];
  readOnly?: boolean;
}

export const SubFormContainer: FC<ISubFormContainerProps> = ({ components, readOnly }) => {
  //alias added for readability and avoiding names clashes
  const { value: subFormData } = useSubForm();
  const { globalState } = useGlobalState();

  const executeExpression = useCallback(
    (expression: string) => {
      if (!expression) return true;
      const evaluated = executeScriptSync(expression, { data: subFormData, globalState });
      return typeof evaluated === 'boolean' ? evaluated : true;
    },
    [subFormData, globalState]
  );

  const getReadOnlyState = (isReadOnly: boolean) => (typeof readOnly === 'boolean' ? readOnly : isReadOnly);

  return (
    <Fragment>
      {components
        ?.filter(({ customVisibility }) => {
          return executeExpression(customVisibility);
        })
        .map(({ customEnabled, disabled: notabled, ...model }) => {
          const disabled = !executeExpression(customEnabled) || notabled;

          return (
            <DynamicComponent
              model={{
                ...model,
                isDynamic: true,
                readOnly: getReadOnlyState(model?.readOnly),
                disabled,
                customEnabled: '',
              }}
              key={model?.id}
            />
          );
        })}
    </Fragment>
  );
};
