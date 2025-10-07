import { ExclamationCircleOutlined, FileAddOutlined, FormOutlined, MinusOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { PackageItemDto, PackageItemStatus } from '../itemsImport/models';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';
import { Popover } from 'antd';
import { useTheme } from 'antd-style';

export interface IStatusCellProps {
  row: PackageItemDto;
}

const getIcon = (data: PackageItemDto): FC<AntdIconProps> | undefined => {
  switch (data.status) {
    case PackageItemStatus.New: return FileAddOutlined;
    case PackageItemStatus.Updated: return FormOutlined;
    case PackageItemStatus.Error: return ExclamationCircleOutlined;
    case PackageItemStatus.Unchanged: return MinusOutlined;
  }
  return undefined;
};

const getStatusText = (status: PackageItemStatus): string => {
  switch (status) {
    case PackageItemStatus.New: return 'New';
    case PackageItemStatus.Updated: return 'Updated';
    case PackageItemStatus.Error: return 'Error';
    case PackageItemStatus.Unchanged: return 'Unchanged';
  }
  return '';
};

export const StatusCell: FC<IStatusCellProps> = ({ row }) => {
  const Icon = getIcon(row);
  const theme = useTheme();

  const description = row.statusDescription ?? getStatusText(row.status);

  return Icon
    ? (
      <div>
        <Popover content={description}>
          <Icon
            style={{ color: row.status === PackageItemStatus.Error ? theme.colorError : theme.colorPrimary }}
          />
        </Popover>
      </div>
    )
    : undefined;
};
