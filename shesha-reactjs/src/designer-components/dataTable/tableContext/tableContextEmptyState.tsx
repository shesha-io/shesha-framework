import React from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { useFormDesignerSelectedComponentId } from '@/providers/formDesigner';
import { useTheme } from '@/providers/theme';
import { useStyles } from './styles';

export interface ITableContextEmptyStateProps {
  containerId: string;
  componentId: string;
  className?: string;
  style?: React.CSSProperties;
}

export const TableContextEmptyState: React.FC<ITableContextEmptyStateProps> = ({
  containerId,
  componentId,
  className,
  style,
}) => {
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isSelected = selectedComponentId === componentId;
  const { theme } = useTheme();
  const { styles, cx } = useStyles();

  const iconColor = isSelected ? theme?.application.primaryColor : '#8c8c8c';
  const titleColor = isSelected ? theme?.application.primaryColor : '#8c8c8c';

  return (
    <div style={style} className={cx(styles.emptyStateContainer, className)}>
      {/* Visual overlay showing the empty state message */}
      <div className={styles.emptyStateOverlay}>
        <DatabaseOutlined
          className={styles.emptyStateIcon}
          style={{ color: iconColor }}
        />
        <div className={styles.emptyStateContent}>
          <div className={styles.emptyStateTitle} style={{ color: titleColor }}>
            Data Context Component
          </div>
          <div className={styles.emptyStateSubtitle}>
            Drag & Drop a Form Component
          </div>
        </div>
      </div>

      {/* ComponentsContainer that handles the actual dropping */}
      <ComponentsContainer
        containerId={containerId}
        itemsLimit={-1}
        className={styles.emptyStateComponentsContainer}
        emptyInsertThreshold={5}
      />
    </div>
  );
};

export default TableContextEmptyState;
