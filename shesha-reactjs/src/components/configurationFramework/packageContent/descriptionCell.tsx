import { EyeOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { PackageItemDto } from '../itemsImport/models';
import { Popover, Typography } from 'antd';
import { useTheme } from 'antd-style';

const { Text } = Typography;

export interface IStatusCellProps {
  row: PackageItemDto;
}

const ItemCard = ({ row }: IStatusCellProps): JSX.Element => {
  return (
    <div>
      <div>
        <Text type="secondary">Label: </Text>
        {row.label}
      </div>
      {row.description && (
        <div>
          <Text type="secondary">Descriprion: </Text>
          {row.description}
        </div>
      )}
    </div>
  );
};

export const DescriptionCell: FC<IStatusCellProps> = ({ row }) => {
  const theme = useTheme();
  return (
    <div>
      <Popover content={<ItemCard row={row} />}>
        <EyeOutlined style={{ color: theme.colorPrimary }} />
      </Popover>
    </div>
  );
};
