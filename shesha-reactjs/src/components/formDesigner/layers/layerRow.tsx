import { CSSProperties, ReactElement, useMemo, useRef } from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, EllipsisOutlined, EyeInvisibleOutlined, FunctionOutlined, LockOutlined, RightOutlined } from '@ant-design/icons';
import { useFormDesigner } from '@/providers/formDesigner';
import { isDefined } from '@/utils/nullables';
import { highlightComponentOnCanvas } from './canvasBridge';
import { ILayersDndContext } from './hooks/dndData';
import { useIsSelected } from './hooks/useDesignerSelection';
import { useLayerRowDnd } from './hooks/useLayerRowDnd';
import { useRowComponent } from './hooks/useRowComponent';
import { highlightMatch } from './highlightMatch';
import { LayerDropIndicator } from './layerDropIndicator';
import { isLayerMenuAction, LayerMenuAction } from './layerRowMenu';
import { buildRowView } from './model/labels';
import { ILayerRow, ILayersIndex } from './model/types';
import { LAYER_INDENT, useStyles } from './styles/styles';

const PERMISSIONS_TOOLTIP = 'This field is hidden and disabled by permissions.';
const CUSTOM_LOGIC_TOOLTIP = 'This field is hidden by custom logic.';
const HIDDEN_TOOLTIP = 'This field is set to hidden.';

export interface ILayerRowSharedProps {
  rows: readonly ILayerRow[];
  layers: ILayersIndex;
  activeId: string | undefined;
  hoverColor: string;
  highlightText: string;
  menuOpenId: string | undefined;
  dnd: ILayersDndContext;
  onRowClick: (rowId: string) => void;
  onToggle: (rowId: string, withSubtree: boolean) => void;
  onMenuOpenChange: (rowId: string | undefined) => void;
  onMenuAction: (rowId: string, action: LayerMenuAction) => void;
  getMenuItems: (rowId: string) => NonNullable<MenuProps['items']>;
}

export type LayerRowProps = ILayerRowSharedProps & {
  ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; 'role': 'listitem' };
  index: number;
  style: CSSProperties;
};

/** DOM id of a row, for aria-activedescendant */
export const getLayerRowDomId = (rowId: string): string => `layer-row-${rowId}`;

export const LayerRow = ({
  index, style, rows, layers, activeId, hoverColor, highlightText, menuOpenId, dnd,
  onRowClick, onToggle, onMenuOpenChange, onMenuAction, getMenuItems,
}: LayerRowProps): ReactElement | null => {
  const designer = useFormDesigner();
  const { styles, cx } = useStyles();
  const elementRef = useRef<HTMLDivElement>(null);
  const row = rows[index];
  const node = isDefined(row) ? layers.nodes.get(row.id) : undefined;
  const componentId = node?.kind === 'pane' ? node.ownerId ?? '' : node?.id ?? '';
  const component = useRowComponent(componentId);
  const isSelected = useIsSelected(node?.kind === 'component' ? node.id : '');
  const dropState = useLayerRowDnd(elementRef, row?.id ?? '', dnd);
  const view = useMemo(
    () => (isDefined(node) && isDefined(component) ? buildRowView(node, component, designer.getComponentDefinition) : undefined),
    [node, component, designer],
  );

  if (!isDefined(row) || !isDefined(node) || !isDefined(view))
    return null;

  const hasMenu = node.kind === 'component';
  const isMenuOpen = hasMenu && menuOpenId === row.id;

  const rowElement = (
    <div
      ref={elementRef}
      id={getLayerRowDomId(row.id)}
      role="treeitem"
      aria-level={row.depth + 1}
      aria-posinset={row.posInSet}
      aria-setsize={row.setSize}
      aria-expanded={row.hasChildren ? row.isExpanded : undefined}
      aria-selected={isSelected}
      data-layer-row-id={row.id}
      className={cx(styles.row, isSelected && 'is-selected', row.id === activeId && 'is-active', view.indicators.showHidden && 'is-hidden')}
      style={{ ...style, paddingLeft: row.depth * LAYER_INDENT }}
      onClick={() => onRowClick(row.id)}
      onMouseEnter={() => highlightComponentOnCanvas(componentId, hoverColor)}
      onMouseLeave={() => highlightComponentOnCanvas(null, hoverColor)}
    >
      <span
        className={styles.chevron}
        aria-hidden
        onClick={row.hasChildren
          ? (event) => {
            event.stopPropagation();
            onToggle(row.id, event.altKey);
          }
          : undefined}
      >
        {row.hasChildren ? (row.isExpanded ? <DownOutlined /> : <RightOutlined />) : null}
      </span>
      <span className={styles.icon} aria-hidden>{view.icon}</span>
      <span className={styles.label}>{highlightMatch(view.label, highlightText, styles.mark)}</span>
      {view.isEmptyPane && <span className={styles.emptyHint}>Empty</span>}
      {isDefined(view.secondaryText) && <span className={styles.secondary}>{view.secondaryText}</span>}
      <span className={styles.badges}>
        {view.indicators.showPermissions && (
          <Tooltip title={PERMISSIONS_TOOLTIP}><LockOutlined aria-label="Restricted by permissions" /></Tooltip>
        )}
        {view.indicators.showCustomLogic && (
          <Tooltip title={CUSTOM_LOGIC_TOOLTIP}><FunctionOutlined aria-label="Visibility set by code" /></Tooltip>
        )}
        {view.indicators.showHidden && (
          <Tooltip title={HIDDEN_TOOLTIP}><EyeInvisibleOutlined aria-label="Hidden" /></Tooltip>
        )}
      </span>
      {hasMenu && (
        <Button
          type="text"
          size="small"
          className={styles.menuButton}
          aria-label="Row actions"
          icon={<EllipsisOutlined />}
          onClick={(event) => {
            event.stopPropagation();
            onMenuOpenChange(row.id);
          }}
        />
      )}
      {dropState !== null && <LayerDropIndicator drop={dropState} depth={row.depth} />}
    </div>
  );

  if (!hasMenu)
    return rowElement;

  return (
    <Dropdown
      open={isMenuOpen}
      autoFocus
      trigger={['contextMenu']}
      onOpenChange={(open) => onMenuOpenChange(open ? row.id : undefined)}
      menu={{
        items: isMenuOpen ? getMenuItems(row.id) : [],
        onClick: ({ key, domEvent }) => {
          domEvent.stopPropagation();
          if (isLayerMenuAction(key))
            onMenuAction(row.id, key);
        },
      }}
    >
      {rowElement}
    </Dropdown>
  );
};
