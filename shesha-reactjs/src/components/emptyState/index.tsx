import React from 'react';
import { Typography } from 'antd';
import { ShaIcon, IconType } from '@/index'; 
import {useStyles} from './styles/styles'

const { Title, Paragraph } = Typography;

export interface IEmptyStateProps {
  noDataIcon?: string; 
  noDataText?: string;
  noDataSecondaryText?: string;
}

const EmptyState: React.FC<IEmptyStateProps> = ({ noDataIcon, noDataText, noDataSecondaryText }) => {

  const { styles } = useStyles();

  return (
    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", margin: "30px" }}>
      {noDataIcon && <ShaIcon style={{ fontSize: "50px" }} iconName={noDataIcon as IconType} />}
      <Title level={4} style={{ fontSize: "40px", margin: "0", marginTop: "10px" }}>{noDataText}</Title>
      <Paragraph style={{ margin: "0", marginTop: "5px" }}>{noDataSecondaryText}</Paragraph>
    </div>
  );
}

export default EmptyState;
