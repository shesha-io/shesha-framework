import React, { FC } from 'react';
import { AppstoreOutlined, CaretDownOutlined, FunctionOutlined, NumberOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

export type SourceSelectorVariant = 'field' | 'value';

/** The three places a rule operand can come from, in the order the menu lists them. */
export type SourceKey = 'func' | 'field' | 'value';
export type SourceItem = [SourceKey, { label: string }];

const SOURCE_ORDER: readonly SourceKey[] = ['func', 'field', 'value'];

export const isSourceKey = (key: unknown): key is SourceKey => typeof key === 'string' && (SOURCE_ORDER as readonly string[]).includes(key);

export interface ISourceSelectorProps {
  valueSources: SourceItem[];
  valueSrc?: SourceKey;
  setValueSrc: (source: SourceKey) => void;
  readonly?: boolean;
  /** 'field' is wider, 'value' is compact */
  variant?: SourceSelectorVariant;
}

const getSourceIcon = (key: SourceKey): React.ReactNode => {
  switch (key) {
    case 'field': return <AppstoreOutlined />;
    case 'func': return <FunctionOutlined />;
    case 'value': return <NumberOutlined />;
  }
};

interface SourceBadgeProps {
  source: SourceKey;
  variant?: SourceSelectorVariant;
}

/** The trigger's glyph for a column with one possible source: nothing to choose, so nothing to focus. */
export const SourceBadge: FC<SourceBadgeProps> = ({ source, variant = 'value' }) => (
  <span className={`sha-query-builder-source-dropdown-trigger sha-query-builder-source-dropdown-trigger--${variant}`}>
    <span
      className={`sha-query-builder-source-trigger sha-query-builder-source-trigger--${variant} sha-query-builder-source-trigger--static`}
      aria-hidden="true"
    >
      <span className="sha-query-builder-source-trigger-icon">{getSourceIcon(source)}</span>
    </span>
  </span>
);

export const SourceSelector: FC<ISourceSelectorProps> = ({
  valueSources,
  valueSrc,
  setValueSrc,
  readonly,
  variant = 'value',
}) => {
  const [open, setOpen] = React.useState(false);
  const orderedSources = [...valueSources].sort(([a], [b]) => SOURCE_ORDER.indexOf(a) - SOURCE_ORDER.indexOf(b));

  const fallbackKey: SourceKey = variant === 'field' ? 'field' : 'value';
  const activeSource: SourceKey = valueSrc !== undefined && orderedSources.some(([key]) => key === valueSrc)
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
      domEvent.stopPropagation();
      if (isSourceKey(key)) setValueSrc(key);
    },
  };

  const activeLabel = orderedSources.find(([key]) => key === activeSource)?.[1]?.label ?? activeSource;

  const stopPropagation = (e: React.MouseEvent | React.PointerEvent): void => {
    e.stopPropagation();
  };

  return (
    <Dropdown menu={menu} trigger={['click']} placement="bottomLeft" onOpenChange={setOpen} {...(readonly !== undefined ? { disabled: readonly } : {})}>
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
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={readonly}
        >
          <span className="sha-query-builder-source-trigger-icon">{getSourceIcon(activeSource)}</span>
          <CaretDownOutlined className="sha-query-builder-source-trigger-arrow" />
        </button>
      </span>
    </Dropdown>
  );
};
