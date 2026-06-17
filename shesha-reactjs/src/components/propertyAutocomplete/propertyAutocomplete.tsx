import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { AutoComplete, Button, Select, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEntityMetadataFetcher, useFormOrUndefined, useMetadataOrUndefined, useMetadataDispatcher } from '@/providers';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { camelCase } from 'lodash';
import { IPropertyMetadata, asPropertiesArray, isIHasEntityType } from '@/interfaces/metadata';
import camelcase from 'camelcase';
import { getIconByPropertyMetadata } from '@/utils/metadata';
import { useConfigurableFormActionsOrUndefined } from '@/providers/form/actions';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { DataTypes } from '@/interfaces';

export interface IPropertyAutocompleteProps {
  value?: string | string[] | undefined;
  style?: CSSProperties | undefined;
  dropdownStyle?: CSSProperties | undefined;
  size?: SizeType | undefined;
  onChange?: ((value: string | string[]) => void) | undefined;
  onSelect?: ((value: string | string[], selectedProperty: IPropertyMetadata | undefined) => void) | undefined;
  onPropertiesLoaded?: ((properties: IPropertyMetadata[], prefix: string) => void) | undefined;
  mode?: 'single' | 'multiple' | 'tags' | undefined;
  autoFillProps?: boolean | undefined;
  readOnly?: boolean | undefined;
  allowClear?: boolean | undefined;
  propertyModelType?: string | IEntityTypeIdentifier | undefined;
}

interface IOption {
  value: string;
  label: string | React.ReactNode;
}

interface IAutocompleteState {
  options: IOption[];
  properties: IPropertyMetadata[];
}

const getFullPath = (path: string, prefix: string | undefined): string => {
  return prefix ? `${prefix}.${camelcase(path)}` : camelcase(path);
};

const properties2options = (properties: IPropertyMetadata[], prefix: string): IOption[] => {
  return properties.map((p) => {
    const value = getFullPath(p.path, prefix);
    const icon = getIconByPropertyMetadata(p);
    const label = (
      <div>{icon} {value}</div>
    );
    return {
      value: value,
      label: label,
    };
  });
};

export const PropertyAutocomplete: FC<IPropertyAutocompleteProps> = ({ mode = 'single', readOnly = false, allowClear = false, onPropertiesLoaded, ...props }) => {
  const { style = { width: '32px' } } = props;

  const meta = useMetadataOrUndefined();
  const { getContainerProperties } = useMetadataDispatcher();
  const { getByEntityType } = useEntityMetadataFetcher();
  const [modelTypeHierarchy, setModelTypeHierarchy] = useState<IEntityTypeIdentifier[]>([]);

  const { metadata } = meta ?? {};

  const initialProperties = asPropertiesArray(metadata?.properties, []);
  const [state, setState] = useState<IAutocompleteState>({ options: properties2options(initialProperties, ""), properties: initialProperties });
  const [multipleValue, setMultipleValue] = useState('');

  const form = useFormOrUndefined();
  const { linkToModelMetadata } = useConfigurableFormActionsOrUndefined() ?? {};

  const containerPath = useMemo(() => {
    if (!props.value || Array.isArray(props.value))
      return undefined;

    const lastIdx = props.value.lastIndexOf('.');
    return lastIdx === -1
      ? undefined
      : props.value.substring(0, lastIdx);
  }, [props.value]);

  const containerPathMultiple = useMemo(() => {
    if (!multipleValue)
      return undefined;

    const lastIdx = multipleValue.lastIndexOf('.');
    return lastIdx === -1
      ? undefined
      : multipleValue.substring(0, lastIdx);
  }, [multipleValue]);

  const getProperty = (path: string): IPropertyMetadata | undefined => {
    return state.properties.find((p) => getFullPath(p.path, containerPath ?? containerPathMultiple) === path);
  };

  // update propertyModel type hierarchy
  const propModelUid = typeof (props.propertyModelType) === 'string' ? props.propertyModelType : `${props.propertyModelType?.module}.${props.propertyModelType?.name}`;
  useEffect(() => {
    let cancelled = false;

    if (!props.propertyModelType) {
      setModelTypeHierarchy([]);
      return () => {
        cancelled = true;
      };
    }

    const typeList: IEntityTypeIdentifier[] = [];

    const getParentAsync = async (entityType: string | IEntityTypeIdentifier): Promise<void> => {
      const entity = await getByEntityType(entityType);
      if (!entity) return;
      typeList.push({ name: entity.entityType, module: entity.entityModule } as IEntityTypeIdentifier);
      if (isIHasEntityType(entity) && entity.inheritedFromEntityType) {
        await getParentAsync({ name: entity.inheritedFromEntityType, module: entity.inheritedFromEntityModule } as IEntityTypeIdentifier);
      }
    };

    getParentAsync(props.propertyModelType)
      .then(() => {
        if (!cancelled) {
          setModelTypeHierarchy(typeList);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch entity type hierarchy:', error);
        if (!cancelled) {
          setModelTypeHierarchy([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getByEntityType, propModelUid, props.propertyModelType]);

  // TODO: move to metadata dispatcher
  // TODO: add `loadProperties` method with callback:
  //    modelType, properties[] (dot notation props list)
  useEffect(() => {
    const setProperties = (properties: IPropertyMetadata[], prefix: string): void => {
      if (onPropertiesLoaded)
        onPropertiesLoaded(properties, prefix);
      setState({
        properties: properties,
        options: properties2options(properties, prefix),
      });
    };

    if (!metadata) {
      setProperties([], '');
    } else {
      const realContainerPath = containerPath ?? containerPathMultiple ?? "";
      getContainerProperties({ metadata, containerPath: realContainerPath }).then((properties) => {
        const propertyModeltype = props.propertyModelType;
        const preparedProperties = Boolean(propertyModeltype)
          // Filter properties by propertyModelType
          ? properties.filter((p) =>
            p.dataType === DataTypes.entityReference &&
            modelTypeHierarchy.some((pmt) => (p.entityModule ?? null) === (pmt.module ?? null) && p.entityType === pmt.name))
          : properties;
        setProperties(preparedProperties, realContainerPath);
      }).catch(() => {
        setProperties([], '');
      });
    }
  }, [metadata, modelTypeHierarchy, containerPath, containerPathMultiple, props.propertyModelType, getContainerProperties, onPropertiesLoaded]);

  const onSelect = (data: string = ""): void => {
    if (props.onChange)
      props.onChange(data);
    const property = getProperty(data);
    if (props.onSelect) {
      props.onSelect(data, property);
    }
    if (props.autoFillProps !== false && form && !readOnly && property && linkToModelMetadata) {
      linkToModelMetadata(property, form);
    }
  };

  const selectMultipleVlaue = (data: string): void => {
    var list = props.value
      ? Array.isArray(props.value) ? [...props.value] : []
      : [];

    list.push(data);
    setMultipleValue('');

    if (props.onChange) props.onChange(list);
    if (props.onSelect) {
      const property = getProperty(data);
      props.onSelect(list, property);
    }
  };

  const onAddMultipleClick = (): void => {
    selectMultipleVlaue(multipleValue);
  };

  const onSelectMultiple = (data: string): void => {
    if (data !== multipleValue) {
      setMultipleValue(data);
    } else {
      selectMultipleVlaue(data);
    }
  };

  const onSearchMultiple = (data: string): void => {
    setMultipleValue(data);
    const filteredOptions: IOption[] = [];
    state.properties.forEach((p) => {
      const fullPath = getFullPath(p.path, containerPathMultiple);

      if (fullPath.toLowerCase()?.startsWith(data?.toLowerCase()))
        filteredOptions.push({ value: fullPath, label: fullPath });
    });

    setState({ properties: state.properties, options: filteredOptions });
  };


  const onSearch = (data: string): void => {
    if (props.onChange) props.onChange(data);

    const filteredOptions: IOption[] = [];
    state.properties.forEach((p) => {
      const fullPath = getFullPath(p.path, containerPath);

      if (fullPath.toLowerCase().startsWith(data.toLowerCase()))
        filteredOptions.push({ value: fullPath, label: fullPath });
    });

    setState({ properties: state.properties, options: filteredOptions });
  };


  const autoComplete = (
    <AutoComplete
      disabled={readOnly}
      value={props.value}
      options={state.options}
      {...(props.style ? { style: props.style } : {})}
      {...(props.dropdownStyle ? { popup: { root: props.dropdownStyle } } : {})}
      onSelect={onSelect}
      showSearch={{
        onSearch: onSearch,
      }}
      notFoundContent="Not found"
      size={props.size}
      popupMatchSelectWidth={false}
      allowClear={allowClear}
    />
  );

  if (mode === 'single')
    return autoComplete;

  if (mode === 'tags')
    return (
      <Select
        allowClear
        onChange={(value) => {
          props.onChange?.(value);
        }}
        value={props.value ?? null}
        mode={mode}
        size={props.size}
        disabled={readOnly}
        options={state.options.map((option) => ({ label: option.label, value: camelCase(option.value) }))}
      />
    );

  const forMap = (tag: string): React.JSX.Element => {
    const tagElem = (
      <>
        <Tag
          closable
          onClose={(e) => {
            e.preventDefault();
            if (Array.isArray(props.value))
              if (props.onChange) props.onChange(props.value.filter((item) => item !== tag));
          }}
          onClick={(e) => {
            e.preventDefault();
            setMultipleValue(tag);
            if (Array.isArray(props.value))
              if (props.onChange) props.onChange(props.value.filter((item) => item !== tag));
          }}
        >
          {tag}
        </Tag>
      </>
    );
    return (
      <span key={tag} style={{ display: 'inline-block', marginTop: 13 }}>
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
          {...(props.style ? { style: props.style } : {})}
          {...(props.dropdownStyle ? { styles: { popup: { root: props.dropdownStyle } } } : {})}
          onSelect={onSelectMultiple}
          showSearch={{
            onSearch: onSearchMultiple,
          }}
          notFoundContent="Not found"
          size={props.size}
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
      <div>
        {tagChild}
      </div>
    </>
  );
};

export default PropertyAutocomplete;
