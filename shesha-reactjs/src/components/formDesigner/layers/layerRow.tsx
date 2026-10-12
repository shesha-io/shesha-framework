import { CSSProperties, ReactElement, useMemo } from 'react';
import { Tooltip } from 'antd';
import { DownOutlined, EyeInvisibleOutlined, FunctionOutlined, LockOutlined, RightOutlined } from '@ant-design/icons';
import { useFormDesigner } from '@/providers/formDesigner';
import { isDefined } from '@/utils/nullables';
import { highlightComponentOnCanvas } from './canvasBridge';
import { highlightMatch } from './highlightMatch';
import { useIsSelected } from './hooks/useDesignerSelection';
import { useRowComponent } from './hooks/useRowComponent';
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
  onRowClick: (rowId: string) => void;
  onToggle: (rowId: string, withSubtree: boolean) => void;
}

export type LayerRowProps = ILayerRowSharedProps & {
  ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; 'role': 'listitem' };
  index: number;
  style: CSSProperties;
};

/** DOM id of a row, for aria-activedescendant */
export const getLayerRowDomId = (rowId: string): string => `layer-row-${rowId}`;

export const LayerRow = ({ index, style, rows, layers, activeId, hoverColor, highlightText, onRowClick, onToggle }: LayerRowProps): ReactElement | null => {
  const designer = useFormDesigner();
  const { styles, cx } = useStyles();
  const row = rows[index];
  const node = isDefined(row) ? layers.nodes.get(row.id) : undefined;
  const componentId = node?.kind === 'pane' ? node.ownerId ?? '' : node?.id ?? '';
  const component = useRowComponent(componentId);
  const isSelected = useIsSelected(node?.kind === 'component' ? node.id : '');
  const view = useMemo(
    () => (isDefined(node) && isDefined(component) ? buildRowView(node, component, designer.getComponentDefinition) : undefined),
    [node, component, designer],
  );

  if (!isDefined(row) || !isDefined(view))
    return null;

  return (
    <div
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
    </div>
  );
};
