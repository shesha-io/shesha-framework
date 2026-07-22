import React, { ReactNode, useMemo } from "react";
import { Tooltip, Select } from "antd";
import { SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth } from "../domUtils";
const { Option, OptGroup } = Select;
import { FactoryWithContext, FieldItem, FieldProps } from '@react-awesome-query-builder/antd';
import { StringSubtype } from "@/interfaces/utilityTypes";
import { getStringEnumOrDefault } from "@/utils/object";
import { SizeType } from "antd/es/config-provider/SizeContext";

const VALID_PLACEMENTS = ["bottomLeft", "bottomRight", "topLeft", "topRight"] as const;
export type Placements = StringSubtype<typeof VALID_PLACEMENTS>;

export const FuncSelect: FactoryWithContext<FieldProps> = (props) => {
  const onChange = (key: string | undefined): void => {
    props.setField(key ?? "");
  };

  const {
    config, customProps, items: allItems, placeholder,
    selectedKey, selectedLabel, selectedAltLabel, selectedFullLabel, readonly = false,
  } = props;
  const { showSearch } = customProps || {};

  const items = useMemo<FieldItem[]>(() => {
    // workaround to filter out evaluation from the LHS
    const evaluates = allItems.filter((item) => item.key && item.key.startsWith('EVALUATE_'));

    return evaluates.length > 1
      ? allItems.filter((item) => !item.key || !item.key.startsWith('EVALUATE_'))
      : allItems;
  }, [allItems]);

  const selectText = selectedLabel || placeholder;
  const selectWidth = calcTextWidth(selectText ?? "");
  const isFieldSelected = !!selectedKey;

  const dropdownPlacement = getStringEnumOrDefault<Placements>(config?.settings ?? {}, "dropdownPlacement", VALID_PLACEMENTS);
  const size: SizeType | undefined = config?.settings.renderSize === 'medium' ? 'middle' : config?.settings.renderSize;

  const width = isFieldSelected && !showSearch ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;
  let tooltipText = selectedAltLabel || selectedFullLabel;
  if (tooltipText === selectedLabel)
    tooltipText = null;

  const renderSelectItems = (fields: FieldItem[], level: number = 0): ReactNode[] => {
    return fields.map((field) => {
      const { items, key, path, label, altLabel, tooltip, grouplabel, disabled } = field;
      const groupPrefix = level > 0 ? "\u00A0\u00A0".repeat(level) : "";
      const prefix = level > 1 ? "\u00A0\u00A0".repeat(level - 1) : "";
      const pathKey = path || key;
      if (items) {
        const simpleItems = items.filter((it) => !it.items);
        const complexItems = items.filter((it) => !!it.items);
        const gr = simpleItems.length
          ? [<OptGroup key={pathKey} label={groupPrefix + label}>{renderSelectItems(simpleItems, level + 1)}</OptGroup>]
          : [];
        const list = complexItems.length ? renderSelectItems(complexItems, level + 1) : [];
        return [...gr, ...list];
      } else {
        const option = tooltip ? <Tooltip title={tooltip}>{prefix + label}</Tooltip> : prefix + label;
        return (
          <Option
            key={pathKey}
            value={pathKey}
            title={altLabel}
            grouplabel={grouplabel}
            label={label}
            disabled={disabled}
          >
            {option}
          </Option>
        );
      }
    }).flat(Infinity);
  };

  const fieldSelectItems = renderSelectItems(items);

  return (
    <Select
      {...(dropdownPlacement ? { placement: dropdownPlacement } : {})}
      popupMatchSelectWidth={false}
      {...(width ? { style: { width } } : {})}
      placeholder={placeholder}
      size={size}
      onChange={onChange}
      value={selectedKey || undefined}
      showSearch={{ filterOption: (input, option) => {
        const dataForFilter = option;
        const keysForFilter = ["title", "value", "grouplabel", "label"];
        const valueForFilter = keysForFilter
          .map((k) => (dataForFilter && typeof dataForFilter[k] === "string" ? dataForFilter[k] : ""))
          .join("\0");
        return valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      } }}
      disabled={readonly}
      {...customProps}
    >{fieldSelectItems}
    </Select>
  );
};
