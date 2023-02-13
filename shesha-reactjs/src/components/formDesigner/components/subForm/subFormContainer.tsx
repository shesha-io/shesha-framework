import React, { FC, Fragment, useCallback } from 'react';
import { useGlobalState, useSubForm } from '../../../../providers';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import DynamicComponent from '../dynamicView/dynamicComponent';

interface IDynamicConfigurableFormComponent extends IConfigurableFormComponent {
  components?: IDynamicConfigurableFormComponent[];
}

export interface ISubFormContainerProps {
  components: IDynamicConfigurableFormComponent[];
  readOnly?: boolean;
}

export const SubFormContainer: FC<ISubFormContainerProps> = ({ components, readOnly }) => {
  const { value } = useSubForm();
  const { globalState } = useGlobalState();

  const executeExpression = useCallback(
    (expression: string, returnBoolean = false) => {
      if (!expression) {
        if (returnBoolean) {
          return true;
        } else {
          console.error('Expected expression to be defined but it was found to be empty.');

          return false;
        }
      }

      /* tslint:disable:function-constructor */
      const evaluated = new Function('data, globalState', expression)(value || {}, globalState || {});
      // tslint:disable-next-line:function-constructor
      return typeof evaluated === 'boolean' ? evaluated : true;
    },
    [value, globalState]
  );

  const getReadOnlyState = (isReadOnly: boolean) => (typeof readOnly === 'boolean' ? readOnly : isReadOnly);

  return (
    <Fragment>
      {components
        ?.filter(({ customVisibility }) => {
          return executeExpression(customVisibility, true);
        })
        .map(({ customEnabled, disabled: notabled, ...model }) => {
          const disabled = !executeExpression(customEnabled, true) || notabled;

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
