import React, { FC } from "react";
import { Tooltip, Select } from "antd";
import { BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth } from "../domUtils";
const { Option, OptGroup } = Select;
import { Config } from 'react-awesome-query-builder';


export interface IFieldSelectProps {
    config: Config,
    customProps?: { [key: string]: any },
    items: [],
    placeholder?: string,
    selectedKey?: string,
    selectedKeys?: [],
    selectedPath?: [],
    selectedLabel?: string,
    selectedAltLabel?: string,
    selectedFullLabel?: string,
    selectedOpts?: object,
    readonly?: boolean,
    //actions
    setField: (key: string) => void,
}

export const FieldSelect: FC<IFieldSelectProps> = (props) => {
    const onChange = (key) => {
        console.log('FieldSelect.onChange', items)
        props.setField(key);
    };

    const filterOption = (input, option) => {
        const dataForFilter = option;
        const keysForFilter = ["title", "value", "grouplabel", "label"];
        const valueForFilter = keysForFilter
            .map(k => (typeof dataForFilter[k] == "string" ? dataForFilter[k] : ""))
            .join("\0");
        return valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    const {
        config, customProps, items, placeholder,
        selectedKey, selectedLabel, /*selectedOpts,*/ selectedAltLabel, selectedFullLabel, readonly,
    } = props;
    const { showSearch } = customProps || {};

    const selectText = selectedLabel || placeholder;
    const selectWidth = calcTextWidth(selectText);
    const isFieldSelected = !!selectedKey;
    const dropdownPlacement = config.settings.dropdownPlacement;
    const dropdownAlign = dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined;
    const width = isFieldSelected && !showSearch ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;
    let tooltipText = selectedAltLabel || selectedFullLabel;
    if (tooltipText == selectedLabel)
        tooltipText = null;

    const renderSelectItems = (fields, level = 0) => {
        return fields.map(field => {
            const { items, key, path, label, altLabel, tooltip, grouplabel, disabled } = field;
            const groupPrefix = level > 0 ? "\u00A0\u00A0".repeat(level) : "";
            const prefix = level > 1 ? "\u00A0\u00A0".repeat(level - 1) : "";
            const pathKey = path || key;
            if (items) {
                const simpleItems = items.filter(it => !it.items);
                const complexItems = items.filter(it => !!it.items);
                const gr = simpleItems.length
                    ? [<OptGroup
                        key={pathKey}
                        label={groupPrefix + label}
                    >{renderSelectItems(simpleItems, level + 1)}</OptGroup>]
                    : [];
                const list = complexItems.length ? renderSelectItems(complexItems, level + 1) : [];
                return [...gr, ...list];
            } else {
                const option = tooltip ? <Tooltip title={tooltip}>{prefix + label}</Tooltip> : prefix + label;
                return <Option
                    key={pathKey}
                    value={pathKey}
                    title={altLabel}
                    grouplabel={grouplabel}
                    label={label}
                    disabled={disabled}
                >
                    {option} !
                </Option>;
            }
        }).flat(Infinity);
    }

    console.log('items', items)
    const fieldSelectItems = renderSelectItems(items);

    let res = (
        <Select
            dropdownAlign={dropdownAlign}
            dropdownMatchSelectWidth={false}
            style={{ width }}
            placeholder={placeholder}
            size={ config.settings.renderSize == 'medium' ? 'middle' : config.settings.renderSize }
            onChange={onChange}
            value={selectedKey || undefined}
            filterOption={filterOption}
            disabled={readonly}
            {...customProps}
        >{fieldSelectItems}</Select>
    );

    // if (tooltipText && !selectedOpts.tooltip) {
    //     res = <Tooltip title={tooltipText}>{res}</Tooltip>;
    // }

    return res;
}