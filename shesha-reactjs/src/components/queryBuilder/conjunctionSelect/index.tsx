import React from 'react';
import { Select } from 'antd';
import type { ConjsProps, ConjunctionOption, FactoryWithContext, Settings } from '@react-awesome-query-builder/antd';

type SettingsWithRenderSize = Settings & { renderSize?: 'small' | 'medium' | 'large' };

export const ConjunctionSelect: FactoryWithContext<ConjsProps> = (props) => {
  const {
    conjunctionOptions,
    selectedConjunction,
    setConjunction,
    readonly,
    disabled,
    config,
  } = props;

  const options = Object.values(conjunctionOptions ?? {}) as ConjunctionOption[];
  const conjunctionItems = options.map((option) => ({
    value: option.key,
    label: option.label,
  }));

  const selectedFallback = conjunctionItems[0]?.value ?? 'AND';
  const selectedValue = selectedConjunction ?? selectedFallback;

  const handleChange = (value: string): void => {
    setConjunction(value);
  };

  const stopEventPropagation = (event: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>): void => {
    event.stopPropagation();
  };

  return (
    <div
      className="sha-query-builder-conjunction-select"
      onMouseDown={stopEventPropagation}
      onPointerDown={stopEventPropagation}
    >
      <Select
        value={selectedValue}
        options={conjunctionItems}
        onChange={handleChange}
        disabled={Boolean(readonly || disabled)}
        popupMatchSelectWidth={false}
        size={(config?.settings as SettingsWithRenderSize)?.renderSize === 'medium' ? 'middle' : (config?.settings as SettingsWithRenderSize)?.renderSize as 'small' | 'large' | undefined}
      />
    </div>
  );
};
