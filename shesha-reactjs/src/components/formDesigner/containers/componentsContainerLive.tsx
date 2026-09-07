import { FC, PropsWithChildren } from 'react';
import { ConfigurableFormComponent } from '../configurableFormComponent';
import { ShaForm } from '@/providers/form';
import { IComponentsContainerProps } from './componentsContainer';
import { useParent } from '@/providers/parentProvider';
import { useDeepCompareMemo } from '@/hooks';
import { ComponentsContainerRender } from './componentsContainerRender';

export const ComponentsContainerLive: FC<PropsWithChildren<IComponentsContainerProps>> = (props) => {
  const {
    containerId,
    children,
    direction = 'vertical',
    className,
    render,
    wrapperStyle,
    style,
    noDefaultStyling = false,
    additionalDomProperties,
  } = props;
  const parent = useParent();
  const components = ShaForm.useChildComponents(containerId.replace(`${parent.subFormIdPrefix}.`, ''));

  const renderedComponents = useDeepCompareMemo((): React.ReactNode | React.JSX.Element[] => {
    const rendered = components.map((c) => (
      <ConfigurableFormComponent id={c.id} key={c.id} />
    ));
    return typeof render === 'function' ? render(rendered) : rendered;
  }, [components, render]);

  return <ComponentsContainerRender {...{ direction, className, wrapperStyle, children, additionalDomProperties, noDefaultStyling, style, renderedComponents }}>{children}</ComponentsContainerRender>;
};
