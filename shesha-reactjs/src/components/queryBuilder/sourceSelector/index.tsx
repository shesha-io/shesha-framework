import React, { FC } from 'react';
import { AppstoreOutlined, CaretDownOutlined, FunctionOutlined, NumberOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

export type SourceSelectorVariant = 'field' | 'value';

type SourceItem = [string, { label: string }];

export interface ISourceSelectorProps {
  /** Items provided by the library: tuples of [sourceKey, { label }] */
  valueSources: SourceItem[];
  valueSrc?: string;
  setValueSrc: (source: string) => void;
  readonly?: boolean;
  /** Controls visual sizing/style — 'field' is wider, 'value' is compact */
  variant?: SourceSelectorVariant;
}

const SOURCE_PREFERRED_ORDER = ['func', 'field', 'value'];

const getSourceOrder = (key: string): number => {
  const index = SOURCE_PREFERRED_ORDER.indexOf(key);
  return index >= 0 ? index : SOURCE_PREFERRED_ORDER.length + 1;
};

const getSourceIcon = (key: string): React.ReactNode => {
  switch (key) {
    case 'field': return <AppstoreOutlined />;
    case 'func': return <FunctionOutlined />;
    case 'value': return <NumberOutlined />;
    default: return <AppstoreOutlined />;
  }
};

export const SourceSelector: FC<ISourceSelectorProps> = ({
  valueSources,
  valueSrc,
  setValueSrc,
  readonly,
  variant = 'value',
}) => {
  const orderedSources = [...valueSources].sort(([a], [b]) => getSourceOrder(a) - getSourceOrder(b));

  const fallbackKey = variant === 'field' ? 'field' : 'value';
  const activeSource = orderedSources.some(([key]) => key === valueSrc)
    ? valueSrc
    : (orderedSources.find(([key]) => key === fallbackKey)?.[0] ?? orderedSources[0]?.[0] ?? fallbackKey);

  const menuItems: MenuProps['items'] = orderedSources.map(([key, info]) => ({
    key,
    label: info.label,
    icon: getSourceIcon(key),
    className: 'sha-query-builder-source-option',
  }));

  const menu: MenuProps = {
    selectable: true,
    selectedKeys: [activeSource],
    items: menuItems,
    onClick: ({ key, domEvent }) => {
      domEvent?.stopPropagation();
      setValueSrc(String(key));
    },
  };

  const activeLabel = orderedSources.find(([key]) => key === activeSource)?.[1]?.label ?? activeSource;

  const stopPropagation = (e: React.MouseEvent | React.PointerEvent): void => {
    e.stopPropagation();
  };

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomLeft" disabled={readonly}>
      <span
        className={`sha-query-builder-source-dropdown-trigger sha-query-builder-source-dropdown-trigger--${variant}`}
        onMouseDown={stopPropagation}
        onPointerDown={stopPropagation}
      >
        <button
          type="button"
          className={`sha-query-builder-source-trigger sha-query-builder-source-trigger--${variant}`}
          title={activeLabel}
          aria-label={activeLabel}
          disabled={readonly}
        >
          <span className="sha-query-builder-source-trigger-icon">{getSourceIcon(activeSource)}</span>
          <CaretDownOutlined className="sha-query-builder-source-trigger-arrow" />
        </button>
      </span>
    </Dropdown>
  );
};
