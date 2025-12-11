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
  readOnly?: boolean;
}

export const TableContextEmptyState: React.FC<ITableContextEmptyStateProps> = ({
  containerId,
  componentId,
  className,
  style,
  readOnly,
}) => {
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isSelected = selectedComponentId === componentId;
  const { theme } = useTheme();
  const { styles } = useStyles();

  const primaryColor = theme?.application.primaryColor ?? '#8c8c8c';
  const iconColor = isSelected ? primaryColor : '#8c8c8c';
  const titleColor = isSelected ? primaryColor : '#8c8c8c';

  return (
    <div style={style} className={`${styles.emptyStateContainer} ${className || ''}`}>
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
            {readOnly ? 'Fix configuration errors to add / view child components' : 'Drag & Drop a Form Component'}
          </div>
        </div>
      </div>

      {/* ComponentsContainer that handles the actual dropping */}
      {readOnly ? null : (
        <ComponentsContainer
          containerId={containerId}
          itemsLimit={-1}
          className={styles.emptyStateComponentsContainer}
          emptyInsertThreshold={20}
          showHintWhenEmpty={false}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

export default TableContextEmptyState;
