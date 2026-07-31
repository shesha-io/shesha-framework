import React, { FC } from 'react';
import { IComponentsContainerProps } from './componentsContainer';
import { ConfigurableFormComponent } from '../configurableFormComponent';
import { useStyles } from '../styles/styles';
import classNames from 'classnames';
import { useDeepCompareMemo } from '@/hooks';

export interface IComponentsContainerDynamicProps extends Omit<IComponentsContainerProps, 'dynamicComponents'>,
  Required<Pick<IComponentsContainerProps, 'dynamicComponents'>> {

}

export const ComponentsContainerDynamic: FC<IComponentsContainerProps> = (props) => {
  const {
    dynamicComponents = [],
    direction = 'vertical',
    className,
    render,
    wrapperStyle,
    style,
    noDefaultStyling,
    additionalDomProperties,
  } = props;

  const { styles } = useStyles();

  const renderComponents = useDeepCompareMemo(() => {
    const renderedComponents = dynamicComponents.map((c) => (
      <ConfigurableFormComponent id={c.id} model={c} key={c.id} />
    ));

    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  }, [dynamicComponents]);

  return noDefaultStyling === true ? (
    <div className={styles.shaComponentsContainerInner} style={{ ...style, textJustify: 'auto' }} {...additionalDomProperties}>{renderComponents}</div>
  ) : (
    <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle} {...additionalDomProperties}>
      <div className={styles.shaComponentsContainerInner} style={style}>
        {renderComponents}
      </div>
    </div>
  );
};
