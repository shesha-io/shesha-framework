import React, { ReactNode, useEffect, useMemo } from "react";
import { Tooltip, Select } from "antd";
const { Option, OptGroup } = Select;
import { FactoryWithContext, FieldItem, FieldProps } from '@react-awesome-query-builder/antd';
import { StringSubtype } from "@/interfaces/utilityTypes";
import { getStringEnumOrDefault } from "@/utils/object";
import { SizeType } from "antd/es/config-provider/SizeContext";

const VALID_PLACEMENTS = ["bottomLeft", "bottomRight", "topLeft", "topRight"] as const;
export type Placements = StringSubtype<typeof VALID_PLACEMENTS>;

const flattenItems = (value: FieldItem[]): FieldItem[] => {
  return value.flatMap((item) => item.items ? flattenItems(item.items) : [item]);
};

export const FuncSelect: FactoryWithContext<FieldProps> = (props) => {
  const onChange = (key: string | undefined): void => {
    props.setField(key ?? "");
  };

  const {
    config, customProps, items: allItems, placeholder,
    selectedKey, selectedLabel, selectedAltLabel, selectedFullLabel, readonly = false,
  } = props;

  const items = useMemo<FieldItem[]>(() => {
    const isTextCaseFunction = (item: FieldItem): boolean => {
      if (!item.key && !item.label)
        return false;

      const normalizedKey = String(item.key).toUpperCase();
      const normalizedLabel = String(item.label).toUpperCase();
      return /(LOWER|LOWERCASE|UPPER|UPPERCASE|TOLOWER|TOUPPER)/.test(normalizedKey) ||
        /(LOWER|LOWERCASE|UPPER|UPPERCASE|TOLOWER|TOUPPER)/.test(normalizedLabel);
    };

    return allItems
      .filter((item) => item.key !== 'expressionFunc')
      .filter((item) => !isTextCaseFunction(item));
  }, [allItems]);

  const leafItems = useMemo(() => flattenItems(items).filter((item) => Boolean(item.key)), [items]);
  const singleLeaf = leafItems.length === 1 ? leafItems[0] : null;
  const singleLeafPath = singleLeaf ? (singleLeaf.path || singleLeaf.key) : null;

  useEffect(() => {
    if (singleLeafPath && selectedKey !== singleLeafPath) {
      props.setField(singleLeafPath);
    }
  }, [singleLeafPath, selectedKey, props]);

  const dropdownPlacement = getStringEnumOrDefault<Placements>(config?.settings ?? {}, "dropdownPlacement", VALID_PLACEMENTS);
  const size: SizeType | undefined = config?.settings.renderSize === 'medium' ? 'middle' : config?.settings.renderSize;
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

  if (singleLeafPath && selectedKey === singleLeafPath) {
    return null;
  }

  return (
    <Select
      {...(dropdownPlacement ? { placement: dropdownPlacement } : {})}
      popupMatchSelectWidth={false}
      style={{ width: '100%', minWidth: 0 }}
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
