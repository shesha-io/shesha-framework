import { IModelMetadata } from "@/interfaces";
import { IPropertyMetadata, asPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
import { useMetadata } from "@/providers";
import { getIconByPropertyMetadata } from "@/utils/metadata";
import { Cascader, CascaderProps, GetProp } from "antd";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import React, { CSSProperties, FC, useEffect, useMemo } from "react";
import { useState } from "react";

type DefaultOptionType = GetProp<CascaderProps, "options">[number];

export interface PropertySelectorSingleProps {
    value?: string[];
    onChange?: (value: string[]) => void;
    multiple?: false;
}
export interface PropertySelectorMultipleProps {
    value?: string[][];
    onChange?: (value: string[]) => void;
    multiple?: true;
}

type UnionProps = PropertySelectorSingleProps | PropertySelectorMultipleProps;

const isMultiple = (props: UnionProps): props is PropertySelectorMultipleProps =>
    (props as PropertySelectorMultipleProps).multiple === true;

export type IPropertyCascaderProps = UnionProps & {
    multiple?: boolean;
    meta: IModelMetadata;
    size?: SizeType;
    readOnly?: boolean;
    style?: CSSProperties;
};

interface Option extends DefaultOptionType {
    value: string;
    label: React.ReactNode;
    labelText: string;
    children?: Option[];
    disabled?: boolean;
    icon?: React.ReactNode;
    isLeaf: boolean;
    childState: "none" | "waiting" | "loading" | "ready" | "error";
    /**
     * Children loader. Returns true if children are loaded
     */
    childrenLoader?: () => Promise<boolean>;
}

const filter = (inputValue: string, path: Option[]) =>
    path.some(
        (option) =>
            option.labelText.toLowerCase().indexOf(inputValue.toLowerCase()) >
            -1
    );

const renderDotNotation = (
    labels: string[],
    selectedOptions: Option[]
) => {
    return labels.map((label, index) => {
        const option = selectedOptions && index <= selectedOptions.length - 1
            ? selectedOptions[index]
            : undefined;
        const value = option ? option.value : label;
        return (
            <span key={value}>
                {value}
                {index < labels.length - 1 && "."}
            </span>
        );
    });
};

const mapProperty2Option = (property: IPropertyMetadata): Option => {
    const value = property.path;
    const icon = getIconByPropertyMetadata(property);

    const hasProps = Boolean(property.properties);
    const loadedProperties = property.properties && Array.isArray(property.properties)
        ? property.properties.map(p => mapProperty2Option(p))
        : undefined;

    const option: Option = {
        value: value,
        //label: value,
        label: (<>{icon} {value}</>),
        labelText: value,
        icon,
        isLeaf: !hasProps,

        childState: !hasProps ? "none" : loadedProperties ? "ready" : "waiting",
        children: loadedProperties,
    };
    if (hasProps && isPropertiesLoader(property.properties)) {
        const loader = property.properties;
        option.childrenLoader = () => {
            if (option.childState === "loading" || option.childState === "ready")
                return Promise.resolve(false);

            option.childState = "loading";
            option.children = undefined;
            return loader().then(properties => {
                option.children = properties.map(p => mapProperty2Option(p));
                option.childState = "ready";
                return true;
            });
        };
    }
    return option;
};

const properties2options = (properties: IPropertyMetadata[]): Option[] => {
    return properties.map(p => mapProperty2Option(p));
};

export const PropertyCascader: React.FC<IPropertyCascaderProps> = (props) => {
    const { /*value,*/ style, meta, multiple } = props;

    const [options, setOptions] = useState<Option[]>(() => {
        const initialProperties = asPropertiesArray(meta?.properties, []);
        const result = properties2options(initialProperties);

        return result;
    });

    useEffect(() => {
        const metaProperties = asPropertiesArray(meta?.properties, []);
        const options = properties2options(metaProperties);
        setOptions(options);
    }, [meta]);

    const onSingleChange = (value: string[], _selectedOptions: Option[]) => {
        if (isMultiple(props))
            return;

        props.onChange(value);
    };

    const onMultipleChange = (value: string[], _selectedOptions: Option[]) => {
        if (!isMultiple(props))
            return;

        props.onChange(value);
    };

    const loadData = (selectedOptions: Option[]) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        if (targetOption.childrenLoader)
            targetOption.childrenLoader().then(loaded => {
                if (loaded)
                    setOptions([...options]);
            });
    };
    return (
        <>
            <Cascader<Option>
                style={style}
                //value={value}
                options={options}
                onChange={(value, selectedOptions) => {
                    if (multiple)
                        onMultipleChange(value, selectedOptions);
                    else
                        onSingleChange(value, selectedOptions);
                }}
                placeholder="Please select"
                showSearch={{ filter }}
                displayRender={renderDotNotation}
                loadData={loadData}
                multiple={multiple}
            />
        </>
    );
};

export interface IPropertyCascaderDotNotationProps extends Omit<IPropertyCascaderProps, "value" | "onChange" | "meta"> {
    value?: string;
    onChange: (newValue: string) => void;
}
const dotNotationDelimiter = '.';
export const PropertyCascaderDotNotation: FC<IPropertyCascaderDotNotationProps> = (props) => {
    const { value, onChange, ...restProps } = props;
    const meta = useMetadata(false);
    const { metadata } = meta || {};

    const cascaderValue = useMemo(() => {
        return value ? value.split(dotNotationDelimiter) : [];
    }, [value]);

    const cascaderChange = (newValue: string[]) => {
        onChange(newValue?.join(dotNotationDelimiter));
    };

    return (
        <PropertyCascader
            {...restProps}
            value={cascaderValue}
            onChange={cascaderChange}
            multiple={false}
            meta={metadata}
        />
    );
};