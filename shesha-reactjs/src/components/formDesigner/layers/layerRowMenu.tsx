import type { MenuProps } from 'antd';
import { IFlatComponentsStructure } from '@/providers/form/models';
import { IContainerOwnership } from '@/providers/formDesigner/structure/containers';
import { getMoveDownAction, getMoveOutAction, getMoveUpAction, RowActionState } from './model/rowActions';

const LAYER_MENU_ACTIONS = ['move-up', 'move-down', 'move-out', 'duplicate', 'delete'] as const;
export type LayerMenuAction = typeof LAYER_MENU_ACTIONS[number];

export const isLayerMenuAction = (value: string): value is LayerMenuAction => (LAYER_MENU_ACTIONS as readonly string[]).includes(value);

type MenuItem = NonNullable<MenuProps['items']>[number];

const moveItem = (key: LayerMenuAction, label: string, state: RowActionState): MenuItem => ({
  key,
  label: state.enabled ? label : <span title={state.reason}>{label}</span>,
  disabled: !state.enabled,
});

/** Row menu: Move up, Move down, Move out of container, Duplicate, Delete. Disabled moves say why */
export const buildRowMenuItems = (markup: IFlatComponentsStructure, ownership: IContainerOwnership, componentId: string): MenuItem[] => [
  moveItem('move-up', 'Move Up', getMoveUpAction(markup, componentId)),
  moveItem('move-down', 'Move Down', getMoveDownAction(markup, componentId)),
  moveItem('move-out', 'Move Out of Container', getMoveOutAction(markup, ownership, componentId)),
  { type: 'divider' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'delete', label: 'Delete', danger: true },
];
