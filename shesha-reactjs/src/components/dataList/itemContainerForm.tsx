import { ShaForm } from '@/providers';
import { ConfigurableFormComponent } from '@/components';
import { useParent } from '@/providers/parentProvider/index';
import React, { CSSProperties, FC, PropsWithChildren, ReactNode } from 'react';
import { IComponentsContainerProps } from '../formDesigner/containers/componentsContainer';
import classNames from 'classnames';

type AlignmentProps = Pick<
  IComponentsContainerProps,
  | 'direction' |
  'justifyContent' |
  'alignItems' |
  'justifyItems' |
  'flexDirection' |
  'justifySelf' |
  'alignSelf' |
  'textJustify' |
  'gap' |
  'gridColumnsCount' |
  'display' |
  'flexWrap'
>;

export const getAlignmentStyle = ({
  direction = 'vertical',
  justifyContent,
  alignItems,
  justifyItems,
  gridColumnsCount,
  display,
  flexDirection,
  justifySelf,
  alignSelf,
  textJustify,
  gap,
  flexWrap,
}: AlignmentProps): CSSProperties => {
  const style: CSSProperties = {
    display,
  };

  const gridTemplateColumns = Array(gridColumnsCount).fill('auto')?.join(' ');

  if (direction === 'horizontal' || display !== 'block') {
    style['justifyContent'] = justifyContent;
    style['alignItems'] = alignItems;
    style['justifyItems'] = justifyItems;
    style['justifySelf'] = justifySelf;
    style['alignSelf'] = alignSelf;
    style['textJustify'] = textJustify as any;
    style['gap'] = gap;
  }

  if (display === 'flex') {
    style['flexDirection'] = flexDirection;
    style['flexWrap'] = flexWrap;
  }

  if (direction === 'horizontal' && justifyContent) {
    style['justifyContent'] = justifyContent;
    style['alignItems'] = alignItems;
    style['justifyItems'] = justifyItems;
  }

  if (display === 'grid' || display === 'inline-grid') {
    style['gridTemplateColumns'] = gridTemplateColumns;
  }
  return style;
};

export const ItemContainerForm: FC<PropsWithChildren<IComponentsContainerProps>> = (props) => {
  const parent = useParent();

  const components = ShaForm.useChildComponents(props.containerId.replace(`${parent?.subFormIdPrefix}.`, ''));

  const renderComponents = (): ReactNode => {
    const renderedComponents = components.map((c) => {
      return <ConfigurableFormComponent id={c.id} key={c.id} />;
    });

    return typeof props.render === 'function' ? props.render(renderedComponents) : renderedComponents;
  };

  const style = { ...getAlignmentStyle(props), ...props.style };

  return props.noDefaultStyling ? (
    <div style={{ ...style, textJustify: 'auto' }}>{renderComponents()}</div>
  ) : (
    <div className={classNames(['sha-components-container', props.direction, props.className])} style={props.wrapperStyle}>
      <div className="sha-components-container-inner" style={style}>
        {renderComponents()}
      </div>
      {props.children}
    </div>
  );
};

ItemContainerForm.displayName = 'ItemContainer(DataList)';
