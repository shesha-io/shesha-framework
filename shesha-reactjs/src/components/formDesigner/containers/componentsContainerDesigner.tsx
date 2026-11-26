import classNames from 'classnames';
import ConditionalWrap from '@/components/conditionalWrapper';
import { ConfigurableFormComponent } from '../configurableFormComponent';
import { FC, PropsWithChildren, ReactNode, useCallback, useMemo } from 'react';
import { App } from 'antd';
import { IComponentsContainerProps } from './componentsContainer';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { TOOLBOX_COMPONENT_DROPPABLE_KEY, TOOLBOX_DATA_ITEM_DROPPABLE_KEY } from '@/providers/form/models';
import { ShaForm } from '@/providers/form';
import { useFormDesigner, useFormDesignerReadOnly } from '@/providers/formDesigner';
import { IComponentPlacementOptions, IComponentPlacementResult } from '@/providers/formDesigner/contexts';
import { useStyles } from '../styles/styles';
import { useParent } from '@/providers/parentProvider';
import _ from 'lodash';
import { isToolboxDroppableDataItem } from '../dataSourceTree';
import { isToolboxDroppableComponent } from '../toolboxComponents';
import { isDefined } from '@/utils/nullables';
import Sortable, { SortableEvent } from 'sortablejs';
import { DropContainerElement, DropContainerElementProvider, useDropContainerElementState } from '../dragDrop/dropTargetContext';
import { startDropTargetIndicator, stopDropTargetIndicator } from '../dragDrop/dropTargetIndicator';
import { COMPONENT_TYPE_ATTR, setComponentDragImage } from '../dragDrop/dragChip';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { getDropDirection } from '../dragDrop/dropDirection';
import { ContainerDirection } from '../common/interfaces';

/**
 * Tells SortableJS whether to compare the dragged item with its neighbours side by side or one above another. Read
 * from the container's layout rather than its `direction` setting, so a Container styled as a flex row sorts like a
 * row. SortableJS calls it with the Sortable as `this`.
 */
function getSortableDirection(this: Sortable): ContainerDirection {
  return getDropDirection(this.el);
}

export const ComponentsContainerDesigner: FC<PropsWithChildren<IComponentsContainerProps>> = (props) => {
  const {
    containerId,
    children,
    direction = 'vertical',
    className,
    render,
    itemsLimit = -1,
    wrapperStyle,
    style,
    noDefaultStyling,
    emptyInsertThreshold = 20,
    showHintWhenEmpty = true,
    additionalDomProperties,
  } = props;

  const { styles } = useStyles();
  const parent = useParent();

  const readOnly = useFormDesignerReadOnly();
  const formDesigner = useFormDesigner();
  const { updateChildComponents, addComponent, addDataProperty, startDragging, endDragging } = useFormDesigner();
  const { modal } = App.useApp();

  /**
   * Applies a drop. One that breaks a required parent of the dropped component is ignored, as the drop target already
   * showed why while dragging. One that only breaks components nested in it, e.g. a Panel holding a Data Table, is
   * applied once the user confirms, and those components are listed in the validation panel until they are fixed.
   */
  const place = (apply: (options?: IComponentPlacementOptions) => IComponentPlacementResult): void => {
    const result = apply();
    if (!result.requiresConfirmation) return;
    modal.confirm({
      title: 'Drop it here anyway?',
      content: (
        <>
          <p>{result.errorMessage}</p>
          <ul>
            {result.errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
          <p>They will be listed in the validation panel until they are fixed.</p>
        </>
      ),
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        apply({ confirmed: true });
      },
    });
  };

  const dropTarget = useDropContainerElementState(containerId, direction);

  const childIds = ShaForm.useChildComponentIds(containerId.replace(`${parent.subFormIdPrefix}.`, ''));

  const componentsMapped = useMemo<ItemInterface[]>(() => {
    return childIds.map<ItemInterface>((id) => ({
      id: id,
    }));
  }, [childIds]);

  const onSetList = (newState: ItemInterface[]): void => {
    if (!formDesigner.hasDragged) return;

    if (!isNaN(itemsLimit) && itemsLimit && newState.length === Math.round(itemsLimit) + 1) {
      return;
    }

    const chosen = newState.some((item) => item.chosen === true);
    if (chosen) return;

    const newDataItemIndex = newState.findIndex((item) => item['type'] === TOOLBOX_DATA_ITEM_DROPPABLE_KEY);
    if (newDataItemIndex > -1) {
      // dropped data item
      const draggedItem = newState[newDataItemIndex];
      if (isToolboxDroppableDataItem(draggedItem)) {
        place((options) => addDataProperty({
          propertyMetadata: draggedItem.metadata,
          containerId,
          index: newDataItemIndex,
        }, options));
      }
    } else {
      const newComponentIndex = newState.findIndex((item) => item['type'] === TOOLBOX_COMPONENT_DROPPABLE_KEY);
      if (newComponentIndex > -1) {
        // add new component
        const toolboxComponent = newState[newComponentIndex];
        if (isToolboxDroppableComponent(toolboxComponent)) {
          place((options) => addComponent({
            containerId,
            componentType: toolboxComponent.id.toString(),
            index: newComponentIndex,
          }, options));
        }
      } else {
        // reorder existing components
        let isModified = componentsMapped.length !== newState.length;

        if (!isModified) {
          for (let i = 0; i < componentsMapped.length; i++) {
            const oldItem = componentsMapped[i];
            const newItem = newState[i];
            if (isDefined(oldItem) && isDefined(newItem) && oldItem.id !== newItem.id) {
              isModified = true;
              break;
            }
          }
        }

        if (isModified) {
          const newIds = newState.map<string>((item) => item.id.toString());
          place((options) => updateChildComponents({ containerId, componentIds: newIds }, options));
        }
      }
    }
  };

  const getToolboxComponent = useFormDesignerComponentGetter();
  const getRequiredParent = useCallback((type: string) => getToolboxComponent(type)?.requiredParent, [getToolboxComponent]);

  const onDragStart = (evt: SortableEvent): void => {
    startDragging();
    startDropTargetIndicator(evt.item, getRequiredParent);
  };

  const setDragImage = (dataTransfer: DataTransfer, dragEl: HTMLElement): void => {
    const type = dragEl.getAttribute(COMPONENT_TYPE_ATTR) ?? '';
    const toolboxComponent = getToolboxComponent(type);
    setComponentDragImage(dataTransfer, toolboxComponent?.icon, toolboxComponent?.name ?? type);
  };

  const onDragEnd = (): void => {
    stopDropTargetIndicator();
    endDragging();
  };

  const renderComponents = (): ReactNode => {
    const renderedComponents = childIds.map((id) => (
      <ConfigurableFormComponent id={id} key={id} />
    ));

    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  };

  return (
    <ConditionalWrap
      condition={noDefaultStyling !== true}
      wrap={(content) => (
        <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle}>
          {content}
        </div>
      )}
    >
      <>
        {childIds.length === 0 && showHintWhenEmpty && <div className={styles.shaDropHintContainer}><div className={styles.shaDropHint}>Drag and Drop form component</div></div>}
        <DropContainerElementProvider value={dropTarget}>
          <ReactSortable
            tag={DropContainerElement}
            disabled={readOnly}
            onStart={onDragStart}
            onEnd={onDragEnd}
            setData={setDragImage}
            list={componentsMapped}
            setList={onSetList}
            fallbackOnBody={true}
            swapThreshold={0.5}
            invertSwap={true}
            group={{
              name: 'shared',
            }}
            sort={true}
            draggable={`.${styles.shaComponent}`}
            animation={75}
            ghostClass={styles.shaComponentGhost}
            emptyInsertThreshold={emptyInsertThreshold}
            handle={`.${styles.componentDragHandle}`}
            scroll={true}
            bubbleScroll={true}
            direction={getSortableDirection}
            className={noDefaultStyling === true ? '' : styles.shaComponentsContainerInner}
            style={style}
            {...additionalDomProperties}
          >
            {renderComponents()}
          </ReactSortable>
        </DropContainerElementProvider>
      </>

      {children}
    </ConditionalWrap>
  );
};
