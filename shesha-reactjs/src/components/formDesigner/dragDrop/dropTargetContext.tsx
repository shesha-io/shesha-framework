import { forwardRef, HTMLAttributes, useContext, useMemo } from 'react';
import { createNamedContext } from '@/utils/react';
import { ContainerDirection } from '../common/interfaces';
import { DROP_TARGET_DIRECTION_ATTR, DROP_TARGET_FRAME_ATTR, DROP_TARGET_LABEL_ATTR } from './models';
import { DropTargetFrame, getDropTargetInfo, IDropTargetOwner, ROOT_DROP_TARGET_LABEL } from './dropTargetInfo';

/**
 * The designer component whose containers are rendered below, e.g. a Panel. Set by every designer component wrapper
 * so a container can tell the user which component, and which part of it, they are dropping into.
 */
const DropTargetOwnerContext = createNamedContext<IDropTargetOwner | undefined>(undefined, 'DropTargetOwnerContext');

export const DropTargetOwnerProvider = DropTargetOwnerContext.Provider;

interface IDropContainerElementState {
  label: string;
  frame: DropTargetFrame;
  direction: ContainerDirection;
}

const DropContainerElementContext = createNamedContext<IDropContainerElementState>({ label: ROOT_DROP_TARGET_LABEL, frame: 'container', direction: 'vertical' }, 'DropContainerElementContext');

export const DropContainerElementProvider = DropContainerElementContext.Provider;

/** Drop target details of a container, for `DropContainerElementProvider`. */
export const useDropContainerElementState = (containerId: string, direction: ContainerDirection): IDropContainerElementState => {
  const owner = useContext(DropTargetOwnerContext);
  return useMemo(() => ({ ...getDropTargetInfo(owner, containerId), direction }), [owner, containerId, direction]);
};

/**
 * Element rendered by `ReactSortable` for a designer drop container. react-sortablejs only passes `className`, `style`
 * and `id` to its element, so the drop target details are read from context.
 */
export const DropContainerElement = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { label, frame, direction } = useContext(DropContainerElementContext);
  return <div ref={ref} {...props} {...{ [DROP_TARGET_LABEL_ATTR]: label, [DROP_TARGET_FRAME_ATTR]: frame, [DROP_TARGET_DIRECTION_ATTR]: direction }} />;
});

DropContainerElement.displayName = 'DropContainerElement';
