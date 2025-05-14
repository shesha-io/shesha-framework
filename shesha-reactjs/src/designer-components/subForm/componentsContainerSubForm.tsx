import React, { FC, useCallback } from 'react';
import { executeScriptSync } from '@/providers/form/utils';
import { getAlignmentStyle } from '@/components/formDesigner/containers/util';
import { ICommonContainerProps } from '@/designer-components/container/interfaces';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { removeUndefinedProperties } from '@/utils/array';
import { useGlobalState, useSubForm } from '@/providers';
import { useParent } from '@/providers/parentProvider/index';
import FormComponent from '../../components/formDesigner/formComponent';

interface IComponentsContainerSubFormProps extends IComponentsContainerBaseProps, ICommonContainerProps { }

export const ComponentsContainerSubForm: FC<IComponentsContainerSubFormProps> = (props) => {
  const { containerId, readOnly } = props;
  const { getChildComponents, context } = useSubForm();

  const parent = useParent();
  const components = getChildComponents(containerId.replace(`${parent?.subFormIdPrefix}.`, ''));

  const style = getAlignmentStyle(props);

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

  return (
    <div style={removeUndefinedProperties(style)}>
      {components
        ?.filter(({ customVisibility }) => {
          return executeExpression(customVisibility);
        })
        .map((model) => {
          return (
            <FormComponent 
              componentModel={{
                ...model,
                context: model.context ?? context,
                initialContext: model.context,
                readOnly: readOnly === true ? true : model?.readOnly,
                customEnabled: '',
              }}
              key={model?.id}
            />
          );
        })}
    </div>
  );
};

ComponentsContainerSubForm.displayName = 'ComponentsContainer(SubForm)';
