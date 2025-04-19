import classNames from 'classnames';
import ConditionalWrap from '@/components/conditionalWrapper';
import { ConfigurableFormComponent } from '../configurableFormComponent';
import React, { FC, PropsWithChildren, useMemo } from 'react';
import { getAlignmentStyle } from './util';
import { IComponentsContainerProps } from './componentsContainer';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { TOOLBOX_COMPONENT_DROPPABLE_KEY, TOOLBOX_DATA_ITEM_DROPPABLE_KEY } from '@/providers/form/models';
import { ShaForm } from '@/providers/form';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { useParent } from '@/providers/parentProvider';
import _ from 'lodash';

export const ComponentsContainerDesigner: FC<PropsWithChildren<IComponentsContainerProps>> = (props) => {
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
    const parent = useParent();

    const readOnly = useFormDesignerStateSelector(x => x.readOnly);
    const hasDragged = useFormDesignerStateSelector(x => x.hasDragged);
    const { updateChildComponents, addComponent, addDataProperty, startDragging, endDragging } = useFormDesignerActions();

    const childIds = ShaForm.useChildComponentIds(containerId.replace(`${parent?.subFormIdPrefix}.`, ''));

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

    };

    const onDragStart = () => {
        startDragging();
    };

    const onDragEnd = (_evt) => {
        endDragging();
    };

    const renderComponents = () => {
        const renderedComponents = childIds.map((id) => (
            <ConfigurableFormComponent id={id} key={id} />
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