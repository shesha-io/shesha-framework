import { FC, useMemo } from 'react';
import { IComponentsContainerBaseProps } from '@/interfaces';
import { useSubForm } from '@/providers';
import { useParent } from '@/providers/parentProvider/index';
import FormComponent from '../../components/formDesigner/formComponent/formComponent';
import { IComponentsContainerProps } from '@/components/formDesigner/containers/componentsContainer';
import { ComponentsContainerRender } from '@/components/formDesigner/containers/componentsContainerRender';

interface IComponentsContainerSubFormProps extends IComponentsContainerBaseProps, IComponentsContainerProps { }

export const ComponentsContainerSubForm: FC<IComponentsContainerSubFormProps> = (props) => {
  const {
    containerId,
    direction = 'vertical',
    className,
    render,
    wrapperStyle,
    style,
    noDefaultStyling = false,
    additionalDomProperties,
    readOnly,
  } = props;

  const { getChildComponents, context } = useSubForm();

  const parent = useParent();

  const renderedComponents = useMemo(() => {
    const comps = getChildComponents(containerId.replace(`${parent.subFormIdPrefix}.`, ''));
    if (comps.length === 0)
      return null;

    const components = comps.map((model) => {
      const componentModel = {
        ...model,
        context: model.context ?? context,
        initialContext: model.context,
        readOnly: readOnly === true ? true : model.readOnly,
        customEnabled: '',
      };
      return <FormComponent key={model.id} componentModel={componentModel} />;
    });
    return typeof render === 'function' ? render(components) : components;
  }, [containerId, context, getChildComponents, parent.subFormIdPrefix, readOnly, render]);

  return <ComponentsContainerRender {...{ direction, className, wrapperStyle, additionalDomProperties, noDefaultStyling, style, renderedComponents }}></ComponentsContainerRender>;
};

ComponentsContainerSubForm.displayName = 'ComponentsContainer(SubForm)';
