import React, { FC, PropsWithChildren } from 'react';
import ConfigurableFormComponent from '../configurableFormComponent';
import { useForm } from '@/providers/form';
import { IComponentsContainerProps } from './componentsContainer';
import { useStyles } from '../styles/styles';
import classNames from 'classnames';
import { getAlignmentStyle } from './util';
import { useParent } from '@/providers/parentProvider';

export const ComponentsContainerLive: FC<PropsWithChildren<IComponentsContainerProps>> = (props) => {
  const {
    containerId,
    children,
    direction = 'vertical',
    className,
    render,
    wrapperStyle,
    style: incomingStyle,
    noDefaultStyling,
  } = props;
  const { styles } = useStyles();
  const { getChildComponents } = useForm();
  const parent = useParent();

  const components = getChildComponents(containerId.replace(`${parent?.subFormIdPrefix}.`, ''));

  const renderComponents = () => {
    const renderedComponents = components.map((c, index) => (
      <ConfigurableFormComponent id={c.id} index={index} key={c.id} />
    ));

    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  };

  const style = { ...getAlignmentStyle(props), ...incomingStyle };

  return noDefaultStyling ? (
    <div style={{ ...style, textJustify: 'auto' }}>{renderComponents()}</div>
  ) : (
    <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle}>
      <div className={styles.shaComponentsContainerInner} style={style}>
        {renderComponents()}
      </div>
      {children}
    </div>
  );
};