import React from 'react';
import { Select } from 'antd';
import type { ConjsProps, ConjunctionOption, FactoryWithContext } from '@react-awesome-query-builder/antd';

const NOT_OPTION_VALUE = '__NOT__';

export const ConjunctionSelect: FactoryWithContext<ConjsProps> = (props) => {
  const {
    conjunctionOptions,
    selectedConjunction,
    setConjunction,
    setNot,
    not,
    readonly,
    disabled,
    config,
    notLabel,
  } = props;

  const options = Object.values(conjunctionOptions ?? {}) as ConjunctionOption[];
  const conjunctionItems = options.map((option) => ({
    value: option.key,
    label: option.label,
  }));

  const selectedFallback = conjunctionItems[0]?.value ?? 'AND';
  const selectedValue = not ? NOT_OPTION_VALUE : (selectedConjunction ?? selectedFallback);

  const selectOptions = [
    ...conjunctionItems,
    { value: NOT_OPTION_VALUE, label: notLabel ?? 'Not' },
  ];

  const handleChange = (value: string): void => {
    if (value === NOT_OPTION_VALUE) {
      setNot(true);
      return;
    }

    if (not)
      setNot(false);

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
        options={selectOptions}
        onChange={handleChange}
        disabled={Boolean(readonly || disabled)}
        popupMatchSelectWidth={false}
        size={config?.settings?.renderSize === 'medium' ? 'middle' : config?.settings?.renderSize}
      />
    </div>
  );
};

