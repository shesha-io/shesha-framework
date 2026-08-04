import React, { FC, PropsWithChildren } from 'react';
import { ConfigurableFormComponent } from '../configurableFormComponent';
import { ShaForm } from '@/providers/form';
import { IComponentsContainerProps } from './componentsContainer';
import { useStyles } from '../styles/styles';
import classNames from 'classnames';
import { useParent } from '@/providers/parentProvider';
import { useDeepCompareMemo } from '@/hooks';

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
  const { styles } = useStyles();
  const parent = useParent();
  const components = ShaForm.useChildComponents(containerId.replace(`${parent.subFormIdPrefix}.`, ''));

  const renderComponents = useDeepCompareMemo(() => {
    const renderedComponents = components.map((c) => (
      <ConfigurableFormComponent id={c.id} key={c.id} />
    ));
    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  }, [components]);


  return noDefaultStyling ? (
    <div className={styles.shaComponentsContainerInner} style={{ ...style, textJustify: 'auto' }} {...additionalDomProperties}>{renderComponents}</div>
  ) : (
    <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle} {...additionalDomProperties}>
      <div className={styles.shaComponentsContainerInner} style={style}>
        {renderComponents}
      </div>
      {children}
    </div>
  );
};
