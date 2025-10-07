import classNames from 'classnames';
import ConditionalWrap from '@/components/conditionalWrapper';
import React, { FC, useMemo } from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { TOOLBOX_COMPONENT_DROPPABLE_KEY } from '@/providers/form/models';
import { ShaForm } from '@/providers/form';
import { useFormDesignerActions, useFormDesignerState } from '@/providers/formDesigner';
import { useStyles } from '../../../components/formDesigner/styles/styles';
import { useParent } from '@/providers/parentProvider';
import _ from 'lodash';
import { getAlignmentStyle } from '@/components/formDesigner/containers/util';
import { ConfigurableFormComponentDesigner } from '@/components/formDesigner/configurableFormComponent';
import { ISettingContainerProps } from './settingComponentContainer';

export const SettingContainerDesigner: FC<ISettingContainerProps> = (props) => {
  const {
    containerId,
    direction = 'vertical',
    className,
    wrapperStyle,
    style: incomingStyle,
    noDefaultStyling,
    component,
  } = props;

  const { styles } = useStyles();
  const parent = useParent();

  const { readOnly, hasDragged } = useFormDesignerState();
  const { addComponent, startDragging, endDragging } = useFormDesignerActions();

  const childIds = ShaForm.useChildComponentIds(containerId.replace(`${parent?.subFormIdPrefix}.`, ''));

  const onSetList = (newState: ItemInterface[], _sortable, _store): void => {
    if (!hasDragged) return;

    if (newState?.length === 2) {
      return;
    }
    const newComponentIndex = newState.findIndex((item) => item['type'] === TOOLBOX_COMPONENT_DROPPABLE_KEY);
    if (newComponentIndex > -1) {
      // add new component
      const toolboxComponent = newState[newComponentIndex];

      addComponent({
        containerId,
        componentType: toolboxComponent.id.toString(),
        index: newComponentIndex,
      });
    }
  };

  const componentsMapped = useMemo<ItemInterface[]>(() => {
    return childIds.map<ItemInterface>((id) => ({
      id: id,
    }));
  }, [childIds]);

  const onDragStart = (): void => {
    startDragging();
  };

  const onDragEnd = (_evt): void => {
    endDragging();
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
          {component?.id && <ConfigurableFormComponentDesigner componentModel={component} />}
        </ReactSortable>
      </>
    </ConditionalWrap>
  );
};
