import DynamicComponent from '@/designer-components/dynamicView/dynamicComponent';
import React, {
  FC,
  useCallback,
} from 'react';
import { executeScriptSync } from '@/providers/form/utils';
import { getAlignmentStyle } from './util';
import { IComponentsContainerProps } from './componentsContainer';
import { useFormData, useGlobalState } from '@/providers';

export interface IComponentsContainerDynamicProps extends Omit<IComponentsContainerProps, 'dynamicComponents'>,
  Required<Pick<IComponentsContainerProps, 'dynamicComponents'>> {

}

export const ComponentsContainerDynamic: FC<IComponentsContainerProps> = (props) => {
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();

  const executeExpression = useCallback(
    (expression: string) => {
      if (!expression) return true;
      const evaluated = executeScriptSync(expression, { data: formData, globalState });
      return typeof evaluated === 'boolean' ? evaluated : true;
    },
    [formData, globalState]
  );

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
};