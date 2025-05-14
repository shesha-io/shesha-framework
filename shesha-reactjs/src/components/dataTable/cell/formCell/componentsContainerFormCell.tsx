import React, { FC } from 'react';
import { ICommonContainerProps } from '@/designer-components/container/interfaces';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { removeUndefinedProperties } from '@/utils/array';
import { useParent } from '@/providers/parentProvider/index';
import { getAlignmentStyle } from '@/components/formDesigner/containers/util';
import FormComponent from '@/components/formDesigner/formComponent';

interface IComponentsContainerFormCellProps extends IComponentsContainerBaseProps, ICommonContainerProps { }

export const ComponentsContainerFormCell: FC<IComponentsContainerFormCellProps> = (props) => {
  const { containerId, readOnly } = props;
  const { getChildComponents } = useParent() ?? {};

  const parent = useParent();
  const components = getChildComponents(containerId.replace(`${parent?.subFormIdPrefix}.`, ''));

  const style = getAlignmentStyle(props);

  return (
    <div style={removeUndefinedProperties(style)}>
      {components?.map((model) => {
          return (
            <FormComponent
              componentModel={{
                ...model,
                context: model.context,
                isDynamic: true,
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

ComponentsContainerFormCell.displayName = 'ComponentsContainer(FormCell)';
