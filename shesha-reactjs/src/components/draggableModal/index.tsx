import { Modal, ModalProps } from 'antd';
import React, { FC, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import ConditionalWrap from '../conditionalWrapper';

interface IBounds {
  left: number;
  top: number;
  bottom: number;
  right: number;
}

interface IDraggableModalState {
  visible: boolean;
  disabled: boolean;
  bounds: IBounds;
}

interface IDraggableModalProps extends ModalProps {
  draggable?: boolean;
}

export const DraggableModal: FC<IDraggableModalProps> = ({ children, draggable, title, ...props }) => {
  const [state, setState] = useState<IDraggableModalState>();

  const draggleRef = useRef();

  const enable = () => setState(prev => ({ ...prev, disabled: false }));

  const disable = () => setState(prev => ({ ...prev, disabled: true }));

  const onStart = (_, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;

    // @ts-ignore
    const targetRect = draggleRef.current?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    setState(prev => ({
      ...prev,
      bounds: {
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x),
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y),
      },
    }));
  };

  return (
    <Modal
      title={
        <ConditionalWrap
          condition={false}
          wrap={content => (
            <div
              style={{
                width: '100%',
                cursor: 'move',
              }}
              onMouseOver={() => {
                if (state?.disabled) {
                  enable();
                }
              }}
              onMouseOut={() => {
                disable();
              }}
              // fix eslintjsx-a11y/mouse-events-have-key-events
              // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
              onFocus={() => {}}
              onBlur={() => {}}
              // end
            >
              {content}
            </div>
          )}
        >
          {title}
        </ConditionalWrap>
      }
      {...props}
      modalRender={modal => (
        <Draggable disabled={state?.disabled} bounds={state?.bounds} onStart={onStart}>
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      {children}
    </Modal>
  );
};
