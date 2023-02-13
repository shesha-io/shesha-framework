import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { AutoComplete, Button, Input, Select, Tag } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useForm, useMetadata, useMetadataDispatcher } from '../../providers';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { camelCase } from 'lodash';
import { IPropertyMetadata } from '../../interfaces/metadata';
import camelcase from 'camelcase';
import { getIconByPropertyMetadata } from '../../utils/metadata';

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
  showFillPropsButton?: boolean;
  readOnly?: boolean;
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
}

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
}

export const PropertyAutocomplete: FC<IPropertyAutocompleteProps> = ({ mode = 'single', readOnly = false, ...props }) => {
  const { style = { width: '32px' } } = props;

  const meta = useMetadata(false);
  const { getContainerProperties } = useMetadataDispatcher();
  const { metadata } = meta || {};

  const initialProperties = metadata?.properties ?? [];
  const [state, setState] = useState<IAutocompleteState>({ options: properties2options(initialProperties, null), properties: initialProperties });
  const [multipleValue, setMultipleValue] = useState('');

  const setProperties = (properties: IPropertyMetadata[], prefix: string) => {
    if (props.onPropertiesLoaded)
      props.onPropertiesLoaded(properties, prefix);
    setState({
      properties: properties,
      options: properties2options(properties, prefix)
    });
  }

  const form = useForm(false);

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

  // todo: move to metadata dispatcher
  // todo: add `loadProperties` method with callback:
  //    modelType, properties[] (dot notation props list)
  useEffect(() => {
    getContainerProperties({ metadata, containerPath: containerPath ?? containerPathMultiple }).then(properties => {
      setProperties(properties, containerPath ?? containerPathMultiple)
    });
  }, [metadata?.properties, containerPath, containerPathMultiple]);

  const getProperty = (path: string): IPropertyMetadata => {
    return state.properties.find(p => getFullPath(p.path, containerPath ?? containerPathMultiple) === path);
  }

  const onSelect = (data: string) => {
    if (props.onChange) props.onChange(data);
    if (props.onSelect) {
      const property = getProperty(data);
      props.onSelect(data, property);
    }
  };

  const onSelectMultiple = (data: string) => {
    if (data != multipleValue) {
      setMultipleValue(data);
    } else {
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

  const selectedProperty = useMemo(() => {
    return typeof (props.value) === 'string'
      ? getProperty(props.value)
      : null;
  }, [props.value, state.properties]);

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

  const onFillPropsClick = () => {
    if (!form || !props.id)
      return;
    const action = form.getAction(props.id, 'linkToModelMetadata');

    if (typeof action === 'function') {
      action(selectedProperty);
    }
  };

  const showFillPropsButton = props.showFillPropsButton !== false && Boolean(form) && !readOnly;

  const autoComplete = (
    <AutoComplete
      disabled={readOnly}
      value={props.value}
      options={state.options}
      style={showFillPropsButton ? { width: 'calc(100% - 32px)' } : props.style}
      onSelect={onSelect}
      onSearch={onSearch}
      notFoundContent="Not found"
      size={props.size}
      dropdownStyle={props?.dropdownStyle}
      dropdownMatchSelectWidth={false}
    />
  );

  const forMap = (tag: string) => {
    const tagElem = (
      <>
        <Tag
          closable
          onClose={e => {
            e.preventDefault();
            if (Array.isArray(props.value))
              if (props.onChange) props.onChange(props.value.filter(item => item != tag));
          }}
          onClick={e => {
            e.preventDefault();
            setMultipleValue(tag);
            if (Array.isArray(props.value))
              if (props.onChange) props.onChange(props.value.filter(item => item != tag));
          }}
        >
          {tag}
        </Tag>
      </>
    );
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    );
  };

  const tagChild = Boolean(props.value) && Array.isArray(props.value) ? props.value?.map(forMap) : null;

  const multiple = (
    <>
      <AutoComplete
        disabled={readOnly}
        value={multipleValue}
        options={state.options}
        style={showFillPropsButton ? { width: 'calc(100% - 32px)' } : props.style}
        //onChange={setMultipleValue}
        onSelect={onSelectMultiple}
        onSearch={onSearchMultiple}
        notFoundContent="Not found"
        size={props.size}
        dropdownStyle={props?.dropdownStyle}
        dropdownMatchSelectWidth={false}
      />
      <div style={{ marginTop: 16 }}>
        {tagChild}
      </div>
    </>
  );

  return (
    <>
      {mode === 'single' ? (
        showFillPropsButton
          ? (
            <Input.Group style={props.style}>
              {autoComplete}
              <Button
                icon={<ThunderboltOutlined />}
                onClick={onFillPropsClick}
                disabled={!Boolean(selectedProperty)}
                style={style}
                size={props.size}
              />
            </Input.Group>
          )
          : <>{autoComplete}</>
      ) : mode === 'multiple' ? (
        <>{multiple}</>
      ) :
        (
          <Select allowClear onChange={props?.onChange} value={props.value} mode={mode} /*showSearch*/ size={props.size} disabled={readOnly}>
            {state.options.map((option, index) => (
              <Select.Option key={index} value={camelCase(option.value)}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )}
    </>
  );
};

export default PropertyAutocomplete;
