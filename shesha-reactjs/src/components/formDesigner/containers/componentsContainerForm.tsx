import React, { CSSProperties, FC, PropsWithChildren, useCallback, useMemo } from 'react';
import ConfigurableFormComponent from '../configurableFormComponent';
import { useForm } from '@/providers/form';
import { TOOLBOX_COMPONENT_DROPPABLE_KEY, TOOLBOX_DATA_ITEM_DROPPABLE_KEY } from '@/providers/form/models';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import DynamicComponent from '../components/dynamicView/dynamicComponent';
import { useFormDesigner } from '@/providers/formDesigner';
import ConditionalWrap from '@/components/conditionalWrapper';
import { useFormData, useGlobalState } from '@/providers';
import { executeScriptSync } from '@/utils/publicUtils';
import { IComponentsContainerProps } from './componentsContainer';
import { useStyles } from '../styles/styles';
import classNames from 'classnames';

export const ComponentsContainerForm: FC<IComponentsContainerProps> = (props) => {
  const { formMode } = useForm();
  const { data: formData } = useFormData();
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
          ?.map(({ customEnabled, ...model }, idx) => {
            const readOnly = !executeExpression(customEnabled) || model.readOnly;

            return <DynamicComponent model={{ ...model, isDynamic: true, readOnly }} key={idx} />;
          })}
      </div>
    );
  }

  const useDesigner = formMode === 'designer' && Boolean(designer);
  return useDesigner ? <ComponentsContainerDesigner {...props} /> : <ComponentsContainerLive {...props} />;
};

ComponentsContainerForm.displayName = 'ComponentsContainer(Form)';

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

const ComponentsContainerDesigner: FC<PropsWithChildren<IComponentsContainerProps>> = (props) => {
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

  const { styles } = useStyles();
  const { getChildComponentIds } = useForm();
  const { updateChildComponents, addComponent, addDataProperty, startDragging, endDragging, readOnly, hasDragged } =
    useFormDesigner();

  const childIds = getChildComponentIds(containerId);

  const componentsMapped = useMemo<ItemInterface[]>(() => {
    return childIds.map<ItemInterface>((id) => ({
      id: id,
    }));
  }, [childIds]);

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    if (!hasDragged) return;

    if (!isNaN(itemsLimit) && itemsLimit && newState?.length === Math.round(itemsLimit) + 1) {
      return;
    }

    const chosen = newState.some((item) => item.chosen === true);
    if (chosen) return;

    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newDataItemIndex = newState.findIndex((item) => item['type'] === TOOLBOX_DATA_ITEM_DROPPABLE_KEY);
      if (newDataItemIndex > -1) {
        // dropped data item
        const draggedItem = newState[newDataItemIndex];

        addDataProperty({
          propertyMetadata: draggedItem.metadata,
          containerId,
          index: newDataItemIndex,
        });
      } else {
        const newComponentIndex = newState.findIndex((item) => item['type'] === TOOLBOX_COMPONENT_DROPPABLE_KEY);
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
          let isModified = componentsMapped.length !== newState.length;

          if (!isModified) {
            for (let i = 0; i < componentsMapped.length; i++) {
              if (componentsMapped[i].id !== newState[i].id) {
                isModified = true;
                break;
              }
            }
          }

          if (isModified) {
            const newIds = newState.map<string>((item) => item.id.toString());
            updateChildComponents({ containerId, componentIds: newIds });
          }
        }
      }
    }
    return;
  };

  const onDragStart = () => {
    startDragging();
  };

  const onDragEnd = (_evt) => {
    endDragging();
  };

  const renderComponents = () => {
    const renderedComponents = childIds.map((id, index) => (
      <ConfigurableFormComponent id={id} index={index} key={id} />
    ));

    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  };

  const style = getAlignmentStyle(props);

  return (
    <ConditionalWrap
      condition={!noDefaultStyling}
      wrap={(content) => (
        <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle}>
          {content}
        </div>
      )}
    >
      <>
        {childIds.length === 0 && <div className={styles.shaDropHint}>Drag and Drop form component</div>}
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
          draggable={`.${styles.shaComponent}`}
          animation={75}
          ghostClass={styles.shaComponentGhost}
          emptyInsertThreshold={20}
          handle={`.${styles.componentDragHandle}`}
          scroll={true}
          bubbleScroll={true}
          direction={direction}
          className={noDefaultStyling ? '' : styles.shaComponentsContainerInner}
          style={{ ...style, ...incomingStyle }}
        >
          {renderComponents()}
        </ReactSortable>
      </>

      {children}
    </ConditionalWrap>
  );
};

const ComponentsContainerLive: FC<PropsWithChildren<IComponentsContainerProps>> = (props) => {
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
    <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle}>
      <div className={styles.shaComponentsContainerInner} style={style}>
        {renderComponents()}
      </div>
      {children}
    </div>
  );
};
