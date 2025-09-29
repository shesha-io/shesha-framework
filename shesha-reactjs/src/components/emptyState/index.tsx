import React from 'react';
import { Typography } from 'antd';
import { ShaIcon, IconType } from '@/index';
import { useStyles } from './styles/styles';

const { Title, Paragraph } = Typography;

export interface IEmptyStateProps {
  noDataIcon?: string;
  noDataText?: string;
  noDataSecondaryText?: string;
}

const EmptyState: React.FC<IEmptyStateProps> = ({ noDataIcon, noDataText, noDataSecondaryText }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.shaGlobalEmptyState}>
      {noDataIcon && <ShaIcon className="sha-icon" iconName={noDataIcon as IconType} />}
      <Title level={4} className="no-data-title">{noDataText}</Title>
      <Paragraph className="no-data-paragraph">{noDataSecondaryText}</Paragraph>
    </div>
  );
};

export default EmptyState;
