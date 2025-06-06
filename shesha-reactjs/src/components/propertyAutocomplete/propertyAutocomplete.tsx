import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { AutoComplete, Button, Select, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useForm, useMetadata, useMetadataDispatcher } from '@/providers';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { camelCase } from 'lodash';
import { IPropertyMetadata, asPropertiesArray } from '@/interfaces/metadata';
import camelcase from 'camelcase';
import { getIconByPropertyMetadata } from '@/utils/metadata';
import { useConfigurableFormActions } from '@/providers/form/actions';

export interface IPropertyAutocompleteProps {
  id?: string;
  value?: string | string[];
  style?: CSSProperties;
  dropdownStyle?: CSSProperties;
  size?: SizeType;
  onChange?: (value: string | string[]) => void;
  onSelect?: (value: string | string[], selectedProperty: IPropertyMetadata) => void;
  onPropertiesLoaded?: (properties: IPropertyMetadata[], prefix: string) => void;
  mode?: 'single' | 'multiple' | 'tags';
  autoFillProps?: boolean;
  readOnly?: boolean;
  allowClear?: boolean;
}

interface IOption {
  value: string;
  label: string | React.ReactNode;
}

interface IAutocompleteState {
  options: IOption[];
  properties: IPropertyMetadata[];
}

const getFullPath = (path: string, prefix: string) => {
  return prefix ? `${prefix}.${camelcase(path)}` : camelcase(path);
};

const properties2options = (properties: IPropertyMetadata[], prefix: string): IOption[] => {
  return properties.map(p => {
    const value = getFullPath(p.path, prefix);
    const icon = getIconByPropertyMetadata(p);
    const label = (
      <div>{icon} {value}</div>
    );
    return {
      value: value,
      label: label
    };
  });
};

export const PropertyAutocomplete: FC<IPropertyAutocompleteProps> = ({ mode = 'single', readOnly = false, allowClear = false, ...props }) => {
  const { style = { width: '32px' } } = props;

  const meta = useMetadata(false);
  const { getContainerProperties } = useMetadataDispatcher();
  const { metadata } = meta || {};

  const initialProperties = asPropertiesArray(metadata?.properties, []);
  const [state, setState] = useState<IAutocompleteState>({ options: properties2options(initialProperties, null), properties: initialProperties });
  const [multipleValue, setMultipleValue] = useState('');

  const setProperties = (properties: IPropertyMetadata[], prefix: string) => {
    if (props.onPropertiesLoaded)
      props.onPropertiesLoaded(properties, prefix);
    setState({
      properties: properties,
      options: properties2options(properties, prefix)
    });
  };

  const form = useForm(false);
  const { linkToModelMetadata } = useConfigurableFormActions(false) ?? {};

  const containerPath = useMemo(() => {
    if (!props.value || Array.isArray(props.value))
      return null;

    const lastIdx = props.value.lastIndexOf('.');
    return lastIdx === -1
      ? null
      : props.value.substring(0, lastIdx);
  }, [props.value]);

  const containerPathMultiple = useMemo(() => {
    if (!multipleValue)
      return null;

    const lastIdx = multipleValue.lastIndexOf('.');
    return lastIdx === -1
      ? null
      : multipleValue.substring(0, lastIdx);
  }, [multipleValue]);

  const getProperty = (path: string): IPropertyMetadata => {
    return state.properties.find(p => getFullPath(p.path, containerPath ?? containerPathMultiple) === path);
  };

  // TODO: move to metadata dispatcher
  // TODO: add `loadProperties` method with callback:
  //    modelType, properties[] (dot notation props list)
  useEffect(() => {
    getContainerProperties({ metadata, containerPath: containerPath ?? containerPathMultiple }).then(properties => {
      setProperties(properties, containerPath ?? containerPathMultiple);
    }).catch(() => {
      setProperties([], '');
    });
  }, [metadata?.properties, containerPath, containerPathMultiple]);

  const onSelect = (data: string) => {
    if (props.onChange) props.onChange(data);
    const property = getProperty(data);
    if (props.onSelect) {
      props.onSelect(data, property);
    }
    if (props.autoFillProps !== false && form && !readOnly && property && linkToModelMetadata) {
      linkToModelMetadata?.(property, form);
    }
  };

  const selectMultipleVlaue = (data: string) => {
    var list = props.value
      ? Array.isArray(props.value) ? props.value : []
      : [];

    list.push(data);
    setMultipleValue('');

    if (props.onChange) props.onChange(list);
    if (props.onSelect) {
      const property = getProperty(data);
      props.onSelect(list, property);
    }
  };

  const onAddMultipleClick = () => {
    selectMultipleVlaue(multipleValue);
  };

  const onSelectMultiple = (data: string) => {
    if (data !== multipleValue) {
      setMultipleValue(data);
    } else {
      selectMultipleVlaue(data);
    }
  };

  const onSearchMultiple = (data: string) => {
    setMultipleValue(data);
    const filteredOptions: IOption[] = [];
    state.properties.forEach(p => {
      const fullPath = getFullPath(p.path, containerPathMultiple);

      if (fullPath.toLowerCase()?.startsWith(data?.toLowerCase()))
        filteredOptions.push({ value: fullPath, label: fullPath });
    });

    setState({ properties: state.properties, options: filteredOptions });
  };


  const onSearch = (data: string) => {
    if (props.onChange) props.onChange(data);

    const filteredOptions: IOption[] = [];
    state.properties.forEach(p => {
      const fullPath = getFullPath(p.path, containerPath);

      if (fullPath.toLowerCase()?.startsWith(data?.toLowerCase()))
        filteredOptions.push({ value: fullPath, label: fullPath });
    });

    setState({ properties: state.properties, options: filteredOptions });
  };


  const autoComplete = (
    <AutoComplete
      disabled={readOnly}
      value={props.value}
      options={state.options}
      style={props.style}
      onSelect={onSelect}
      onSearch={onSearch}
      notFoundContent="Not found"
      size={props.size}
      dropdownStyle={props?.dropdownStyle}
      popupMatchSelectWidth={false}
      allowClear={allowClear}
    />
  );

  if (mode === 'single')
    return autoComplete;

  if (mode === 'tags')
    return (
      <Select allowClear onChange={props?.onChange} value={props.value} mode={mode} /*showSearch*/ size={props.size} disabled={readOnly}>
        {state.options.map((option, index) => (
          <Select.Option key={index} value={camelCase(option.value)}>
            {option.label}
          </Select.Option>
        ))}
      </Select>);

  const forMap = (tag: string) => {
    const tagElem = (
      <>
        <Tag
          closable
          onClose={e => {
            e.preventDefault();
            if (Array.isArray(props.value))
              if (props.onChange) props.onChange(props.value.filter(item => item !== tag));
          }}
          onClick={e => {
            e.preventDefault();
            setMultipleValue(tag);
            if (Array.isArray(props.value))
              if (props.onChange) props.onChange(props.value.filter(item => item !== tag));
          }}
        >
          {tag}
        </Tag>
      </>
    );
    return (
      <span key={tag} style={{ display: 'inline-block', marginTop:13 }}>
        {tagElem}
      </span>
    );
  };

  const tagChild = Boolean(props.value) && Array.isArray(props.value) ? props.value?.map(forMap) : null;

  return (
    <>
      <Space.Compact style={{ width: "100%", ...props.style, marginTop: tagChild?.length ? 4 : 0 }}>
        <AutoComplete
          disabled={readOnly}
          value={multipleValue}
          options={state.options}
          style={props.style}
          //onChange={setMultipleValue}
          onSelect={onSelectMultiple}
          onSearch={onSearchMultiple}
          notFoundContent="Not found"
          size={props.size}
          dropdownStyle={props?.dropdownStyle}
          popupMatchSelectWidth={false}
        />
        <Button
          icon={<PlusOutlined />}
          onClick={onAddMultipleClick}
          disabled={!Boolean(multipleValue)}
          style={style}
          size={props.size}
        />
      </Space.Compact>
      <div >
        {tagChild}
      </div>
    </>
  );
};

export default PropertyAutocomplete;
