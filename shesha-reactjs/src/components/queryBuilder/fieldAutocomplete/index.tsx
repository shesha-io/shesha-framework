import React, { useState } from "react";
import { FactoryWithContext, FieldProps } from '@react-awesome-query-builder/antd';
import { SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth } from "../domUtils";
import { PropertySelect } from "../../propertyAutocomplete/propertySelect";
import { IPropertyMetadata } from "@/interfaces/metadata";

export const FieldAutocomplete: FactoryWithContext<FieldProps> = (props) => {
    const [text, setText] = useState(props.selectedKey);
    const onSelect = (key, _propertyMetadata: IPropertyMetadata) => {
        // check fields and expand if needed
        if (typeof (key) === 'string')
            props.setField(key);
    };

    const onChange = (key) => {
        setText(key);
    };

    const {
        config, customProps, /*items,*/ placeholder,
        selectedKey, selectedLabel, /*selectedOpts,*/ selectedAltLabel, selectedFullLabel, /*readonly,*/
    } = props;

    const { showSearch } = customProps || {};

    const selectText = text || selectedLabel || placeholder;
    const selectWidth = calcTextWidth(selectText);
    const isFieldSelected = !!selectedKey;

    const width = isFieldSelected && !showSearch ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;

    let tooltipText = selectedAltLabel || selectedFullLabel;
    if (tooltipText === selectedLabel)
        tooltipText = null;

    const readOnly = config.settings.immutableFieldsMode === true;

    return (
        <PropertySelect
            readOnly={readOnly}
            value={text}
            onChange={onChange}
            style={{ width }}
            size={config.settings.renderSize === 'medium' ? 'middle' : config.settings.renderSize}
            onSelect={onSelect}
        />
    );
};