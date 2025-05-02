import React, { FC } from 'react';
import { getAlignmentStyle } from './util';
import { IComponentsContainerProps } from './componentsContainer';
import { ConfigurableFormComponent } from '../configurableFormComponent';
import { useStyles } from '../styles/styles';
import classNames from 'classnames';

export interface IComponentsContainerDynamicProps extends Omit<IComponentsContainerProps, 'dynamicComponents'>,
  Required<Pick<IComponentsContainerProps, 'dynamicComponents'>> {

}

export const ComponentsContainerDynamic: FC<IComponentsContainerProps> = (props) => {
  const { 
    dynamicComponents,
    direction = 'vertical',
    className,
    render,
    wrapperStyle,
    style: incomingStyle,
    noDefaultStyling,
  } = props;

  const { styles } = useStyles();
  
  const renderComponents = () => {
    const renderedComponents = dynamicComponents.map((c) => (
      <ConfigurableFormComponent id={c.id} key={c.id} />
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
    </div>
  );
};