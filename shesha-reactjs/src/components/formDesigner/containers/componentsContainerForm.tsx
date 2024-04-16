import DynamicComponent from '@/designer-components/dynamicView/dynamicComponent';
import React, {
  FC,
  useCallback,
} from 'react';
import { ComponentsContainerDesigner } from './componentsContainerDesigner';
import { executeScriptSync } from '@/providers/form/utils';
import { getAlignmentStyle } from './util';
import { IComponentsContainerProps } from './componentsContainer';
import { useForm } from '@/providers/form';
import { useFormData, useGlobalState } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';
import { ComponentsContainerLive } from './componentsContainerLive';

export const ComponentsContainerForm: FC<IComponentsContainerProps> = (props) => {
  const { formMode } = useForm();
  const { data: formData } = useFormData();
  const designer = useFormDesigner(false);
  const { globalState } = useGlobalState();

  const executeExpression = useCallback(
    (expression: string) => {
      if (!expression) return true;
      const evaluated = executeScriptSync(expression, { data: formData, globalState });
      return typeof evaluated === 'boolean' ? evaluated : true;
    },
    [formData, globalState]
  );

  // containers with dynamic components is not configurable, draw them as is
  if (props.dynamicComponents?.length) {
    const style = getAlignmentStyle(props);
    return (
      <div style={style} className={props?.className}>
        {props.dynamicComponents
          ?.filter(({ customVisibility }) => {
            return executeExpression(customVisibility);
          })
          ?.map(({ customEnabled, ...model }, idx) => {
            const readOnly = !executeExpression(customEnabled) || model.readOnly;

            return <DynamicComponent model={{ ...model, isDynamic: true, readOnly }} key={idx} />;
          })}
      </div>
    );
  }

  const useDesigner = formMode === 'designer' && Boolean(designer);
  return useDesigner ? <ComponentsContainerDesigner {...props} /> : <ComponentsContainerLive {...props} />;
};

ComponentsContainerForm.displayName = 'ComponentsContainer(Form)';