import React from 'react';
import {
  AppstoreOutlined,
  FunctionOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PackedControlVariant, PackedSourceTrigger } from '../packedControl';

type ValueSourceItem = [string, { label: string }];

interface IValueSourcesProps {
  valueSources: ValueSourceItem[];
  valueSrc?: string;
  setValueSrc: (valueSrc: string) => void;
  readonly?: boolean;
  title: string;
  variant?: PackedControlVariant;
}

const getSourceIcon = (sourceKey: string): React.ReactNode => {
  switch (sourceKey) {
    case 'field':
      return <AppstoreOutlined />;
    case 'func':
      return <FunctionOutlined />;
    case 'value':
      return <NumberOutlined />;
    default:
      return <AppstoreOutlined />;
  }
};

export const ValueSources = (props: IValueSourcesProps): JSX.Element => {
  const { valueSources, valueSrc, setValueSrc, readonly, title, variant = 'value' } = props;

  const selectedValueSource = valueSrc ?? valueSources?.[0]?.[0] ?? 'value';

  const menuItems: MenuProps['items'] = valueSources.map(([sourceKey, info]) => {
    return {
      key: sourceKey,
      label: info.label,
      icon: getSourceIcon(sourceKey),
      className: 'sha-query-builder-source-option',
    };
  });

  const menu: MenuProps = {
    selectable: true,
    selectedKeys: [selectedValueSource],
    items: menuItems,
    onClick: ({ key }) => setValueSrc(key),
  };

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomLeft" disabled={readonly}>
      <PackedSourceTrigger
        variant={variant}
        title={title}
        disabled={readonly}
        icon={getSourceIcon(selectedValueSource)}
      />
    </Dropdown>
  );
};
