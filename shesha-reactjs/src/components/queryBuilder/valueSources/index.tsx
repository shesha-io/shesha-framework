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

  const preferredOrder = ['func', 'field', 'value'];
  const getSourceOrder = (sourceKey: string): number => {
    const preferredIndex = preferredOrder.indexOf(sourceKey);
    return preferredIndex >= 0 ? preferredIndex : preferredOrder.length + 1;
  };

  const orderedSources = [...valueSources]
    .sort(([leftKey], [rightKey]) => getSourceOrder(leftKey) - getSourceOrder(rightKey));

  const fallbackSource = variant === 'field' ? 'field' : 'value';
  const selectedValueSource = orderedSources.some(([sourceKey]) => sourceKey === valueSrc)
    ? valueSrc
    : (
      orderedSources.find(([sourceKey]) => sourceKey === fallbackSource)?.[0] ??
      orderedSources?.[0]?.[0] ??
      fallbackSource
    );

  const menuItems: MenuProps['items'] = orderedSources.map(([sourceKey, info]) => {
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
    onClick: ({ key, domEvent }) => {
      domEvent?.stopPropagation();
      setValueSrc(String(key));
    },
  };

  const stopEventPropagation = (event: React.MouseEvent<HTMLSpanElement> | React.PointerEvent<HTMLSpanElement>): void => {
    event.stopPropagation();
  };

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomLeft" disabled={readonly}>
      <span
        className="sha-query-builder-source-dropdown-trigger"
        onMouseDown={stopEventPropagation}
        onPointerDown={stopEventPropagation}
      >
        <PackedSourceTrigger
          variant={variant}
          title={title}
          disabled={readonly}
          icon={getSourceIcon(selectedValueSource)}
        />
      </span>
    </Dropdown>
  );
};
