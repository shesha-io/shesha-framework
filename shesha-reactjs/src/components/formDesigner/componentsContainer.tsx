import React, { CSSProperties, FC, ReactNode, useCallback } from 'react';
import ConfigurableFormComponent from './configurableFormComponent';
import { useForm } from '../../providers/form';
import {
  IConfigurableFormComponent,
  TOOLBOX_COMPONENT_DROPPABLE_KEY,
  TOOLBOX_DATA_ITEM_DROPPABLE_KEY,
} from '../../providers/form/models';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { joinStringValues } from '../../utils';
import DynamicComponent from './components/dynamicView/dynamicComponent';
import { useFormDesigner } from '../../providers/formDesigner';
import { ContainerDirection } from './components/container/containerComponent';
import {
  AlignItems,
  AlignSelf,
  FlexDirection,
  FlexWrap,
  JustifyContent,
  JustifyItems,
  JustifySelf,
  TextJustify,
} from './components/container/model';
import ConditionalWrap from '../conditionalWrapper';
import { useGlobalState } from '../../providers';
import { executeScriptSync } from '../../utils/publicUtils';

export type Direction = 'horizontal' | 'vertical';

export interface ICommonContainerProps {
  display?: 'block' | 'flex' | 'grid' | 'inline-grid';
  direction?: ContainerDirection;
  flexWrap?: FlexWrap;
  flexDirection?: FlexDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  alignSelf?: AlignSelf;
  justifyItems?: JustifyItems;
  textJustify?: TextJustify;
  justifySelf?: JustifySelf;
  noDefaultStyling?: boolean;
  gridColumnsCount?: number;
  gap?: string | number;
}

export interface IComponentsContainerProps extends ICommonContainerProps {
  containerId: string;
  className?: string;
  render?: (components: JSX.Element[]) => ReactNode;
  itemsLimit?: number;
  readOnly?: boolean;
  dynamicComponents?: IConfigurableFormComponent[];
  wrapperStyle?: CSSProperties;
  style?: CSSProperties;
}

const ComponentsContainer: FC<IComponentsContainerProps> = props => {
  const { formMode, formData } = useForm();
  const designer = useFormDesigner(false);
  const { globalState } = useGlobalState();

  const executeExpression = useCallback(
    (expression: string) => {
      if (!expression) return true;
      const evaluated = executeScriptSync(expression, { data: formData, globalState });
      return typeof evaluated === 'boolean' ? evaluated : true;
    },
    [formData, globalState]
  );

  // containers with dynamic components is not configurable, draw them as is
  if (props.dynamicComponents?.length) {
    const style = getAlignmentStyle(props);
    return (
      <div style={style} className={props?.className}>
        {props.dynamicComponents
          ?.filter(({ customVisibility }) => {
            return executeExpression(customVisibility);
          })
          ?.map(({ customEnabled, disabled: _disabled, ...model }, idx) => {
            const disabled = !executeExpression(customEnabled) || _disabled;

            return <DynamicComponent model={{ ...model, isDynamic: true, disabled }} key={idx} />;
          })}
      </div>
    );
  }

  const useDesigner = formMode === 'designer' && Boolean(designer);
  return useDesigner ? <ComponentsContainerDesigner {...props} /> : <ComponentsContainerLive {...props} />;
};

type AlignmentProps = Pick<
  IComponentsContainerProps,
  | 'direction'
  | 'justifyContent'
  | 'alignItems'
  | 'justifyItems'
  | 'flexDirection'
  | 'justifySelf'
  | 'alignSelf'
  | 'textJustify'
  | 'gap'
  | 'gridColumnsCount'
  | 'display'
  | 'flexWrap'
>;

const getAlignmentStyle = ({
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

  const gridTemplateColumns = Array(gridColumnsCount)
    .fill('auto')
    ?.join(' ');

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

const ComponentsContainerDesigner: FC<IComponentsContainerProps> = props => {
  const {
    containerId,
    children,
    direction = 'vertical',
    className,
    render,
    itemsLimit = -1,
    wrapperStyle,
    style: incomingStyle,
    noDefaultStyling,
  } = props;

  const { getChildComponents } = useForm();
  const {
    updateChildComponents,
    addComponent,
    addDataProperty,
    startDragging,
    endDragging,
    readOnly,
    hasDragged,
  } = useFormDesigner();

  const components = getChildComponents(containerId);

  const componentsMapped = components.map<ItemInterface>(c => ({
    id: c.id,
  }));

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    if (!hasDragged) return;

    if (!isNaN(itemsLimit) && itemsLimit && newState?.length === Math.round(itemsLimit) + 1) {
      return;
    }

    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newDataItemIndex = newState.findIndex(item => item['type'] === TOOLBOX_DATA_ITEM_DROPPABLE_KEY);
      if (newDataItemIndex > -1) {
        // dropped data item
        const draggedItem = newState[newDataItemIndex];

        addDataProperty({
          propertyMetadata: draggedItem.metadata,
          containerId,
          index: newDataItemIndex,
        });
      } else {
        const newComponentIndex = newState.findIndex(item => item['type'] === TOOLBOX_COMPONENT_DROPPABLE_KEY);
        if (newComponentIndex > -1) {
          // add new component
          const toolboxComponent = newState[newComponentIndex];

          addComponent({
            containerId,
            componentType: toolboxComponent.id.toString(),
            index: newComponentIndex,
          });
        } else {
          // reorder existing components
          const newIds = newState.map<string>(item => item.id.toString());
          updateChildComponents({ containerId, componentIds: newIds });
        }
      }
    }
    return;
  };

  const onDragStart = () => {
    startDragging();
  };

  const onDragEnd = _evt => {
    endDragging();
  };

  const renderComponents = () => {
    const renderedComponents = components.map((c, index) => (
      <ConfigurableFormComponent id={c.id} index={index} key={c.id} />
    ));

    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  };

  const style = getAlignmentStyle(props);

  return (
    <ConditionalWrap
      condition={!noDefaultStyling}
      wrap={content => (
        <div className={joinStringValues(['sha-components-container', direction, className])} style={wrapperStyle}>
          {content}
        </div>
      )}
    >
      <>
        {components.length === 0 && <div className="sha-drop-hint">Drag and Drop form component</div>}
        <ReactSortable
          disabled={readOnly}
          onStart={onDragStart}
          onEnd={onDragEnd}
          list={componentsMapped}
          setList={onSetList}
          fallbackOnBody={true}
          swapThreshold={0.5}
          group={{
            name: 'shared',
          }}
          sort={true}
          draggable=".sha-component"
          animation={75}
          ghostClass="sha-component-ghost"
          emptyInsertThreshold={20}
          handle=".sha-component-drag-handle"
          scroll={true}
          bubbleScroll={true}
          direction={direction}
          className={noDefaultStyling ? '' : `sha-components-container-inner`}
          style={{ ...style, ...incomingStyle }}
        >
          {renderComponents()}
        </ReactSortable>
      </>

      {children}
    </ConditionalWrap>
  );
};

const ComponentsContainerLive: FC<IComponentsContainerProps> = props => {
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
  const { getChildComponents } = useForm();

  const components = getChildComponents(containerId);

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
    <div className={joinStringValues(['sha-components-container', direction, className])} style={wrapperStyle}>
      <div className="sha-components-container-inner" style={style}>
        {renderComponents()}
      </div>
      {children}
    </div>
  );
};

export default ComponentsContainer;
