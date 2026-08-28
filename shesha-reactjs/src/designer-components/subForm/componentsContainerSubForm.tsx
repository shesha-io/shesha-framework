import { FC } from 'react';
import { getAlignmentStyle } from '@/components/formDesigner/containers/util';
import { ICommonContainerProps } from '@/designer-components/container/interfaces';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { removeUndefinedProperties } from '@/utils/array';
import { useSubForm } from '@/providers';
import { useParent } from '@/providers/parentProvider/index';
import FormComponent from '../../components/formDesigner/formComponent/formComponent';

interface IComponentsContainerSubFormProps extends IComponentsContainerBaseProps, ICommonContainerProps { }

export const ComponentsContainerSubForm: FC<IComponentsContainerSubFormProps> = (props) => {
  const { containerId, readOnly } = props;
  const { getChildComponents, context } = useSubForm();

  const parent = useParent();
  const components = getChildComponents(containerId.replace(`${parent.subFormIdPrefix}.`, ''));
  const style = getAlignmentStyle(props);

  return (
    <div style={removeUndefinedProperties(style)}>
      {components.length > 0
        ? components.map((model) => {
          const componentModel = {
            ...model,
            context: model.context ?? context,
            initialContext: model.context,
            readOnly: readOnly === true ? true : model.readOnly,
            customEnabled: '',
          };

          return <FormComponent key={model.id} componentModel={componentModel} />;
        })
        : null}
    </div>
  );
};

ComponentsContainerSubForm.displayName = 'ComponentsContainer(SubForm)';
