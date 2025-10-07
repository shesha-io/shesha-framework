import camelcase from 'camelcase';
import React, {
  CSSProperties,
  FC,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BulbOutlined, BulbTwoTone } from '@ant-design/icons';
import { DataTypes } from '@/interfaces/dataTypes';
import { getIconByPropertyMetadata } from '@/utils/metadata';
import {
  asPropertiesArray,
  IModelMetadata,
  IPropertyMetadata,
  isEntityMetadata,
  ISpecification,
  metadataHasNestedProperties,
} from '@/interfaces/metadata';
import { Select, Tooltip } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useQueryBuilder } from '@/providers';

type PropertyPredicate = (property: IPropertyItem) => boolean;

export interface IPropertySelectProps {
  id?: string;
  value?: string;
  style?: CSSProperties;
  dropdownStyle?: CSSProperties;
  size?: SizeType;
  onChange?: (value: string) => void;
  onSelect?: (value: string, selectedProperty: IPropertyItem) => void;
  readOnly?: boolean;
  isPropertyVisible?: PropertyPredicate;
  isPropertySelectable?: PropertyPredicate;
}

export interface IQbItem {
  label: string;
  key: string;
  items?: IQbItem[];
}

interface IOption {
  value: string;
  label: string | React.ReactNode;
  disabled?: boolean;
}

interface IAutocompleteState {
  options: IOption[];
  propertyItems: IPropertyItem[];
  prefix: string;
}

const getFullPath = (path: string, prefix: string): string => {
  return prefix ? `${prefix}.${camelcase(path)}` : camelcase(path);
};

export interface IHasPropertyType {
  itemType: 'property' | 'specification';
}

export type IPropertyItem = (IPropertyMetadata | ISpecification) & IHasPropertyType;

export const isPropertyMetadata = (item: IPropertyItem): item is IPropertyMetadata & IHasPropertyType => {
  return item.itemType === 'property';
};

const isSpecification = (item: IPropertyItem): item is ISpecification & IHasPropertyType => {
  return item.itemType === 'specification';
};

export const getPropertyItemIdentifier = (item: IPropertyItem, prefix: string): string => {
  if (isPropertyMetadata(item))
    return getFullPath(item.path, prefix);

  if (isSpecification(item))
    return item.name;

  return null;
};

const propertyItem2option = (item: IPropertyItem, prefix: string, isSelectable: PropertyPredicate): IOption => {
  if (isSpecification(item)) {
    const value = item.name;
    const label = (
      <div>
        {item.description ? <Tooltip title={item.description}><BulbTwoTone twoToneColor="orange" style={{ cursor: 'help' }} /></Tooltip> : <BulbOutlined />}
        {item.friendlyName}
      </div>
    );

    return {
      value: value,
      label: label,
    };
  }

  if (isPropertyMetadata(item)) {
    const property = item as IPropertyMetadata;
    const value = getPropertyItemIdentifier(item, prefix);
    const icon = getIconByPropertyMetadata(property);
    const label = <div>{icon} {value}</div>;

    return {
      value: value,
      label: label,
      disabled: isSelectable ? !isSelectable(item) : undefined,
    };
  }

  throw new Error('Unknown type of item');
};

const propertyItems2options = (properties: IPropertyItem[], prefix: string, isSelectable: PropertyPredicate): IOption[] => {
  return properties.filter((p) => !(p.itemType === 'property' && (p as IPropertyMetadata).dataType === DataTypes.array)).map((p) => propertyItem2option(p, prefix, isSelectable));
};

const modelMetadata2Properties = (modelMetadata?: IModelMetadata): IPropertyItem[] => {
  if (!modelMetadata)
    return [];

  const properties = metadataHasNestedProperties(modelMetadata)
    ? asPropertiesArray(modelMetadata.properties, []).map<IPropertyItem>((p) => ({ ...p, itemType: 'property' }))
    : [];

  const specifications = isEntityMetadata(modelMetadata)
    ? (modelMetadata.specifications ?? []).map<IPropertyItem>((p) => ({ ...p, itemType: 'specification' }))
    : [];

  return [...properties, ...specifications];
};

export const PropertySelect: FC<IPropertySelectProps> = ({ readOnly = false, isPropertySelectable, isPropertyVisible, ...props }) => {
  const { fetchContainer } = useQueryBuilder();

  const initialProperties = [];

  const [state, setState] = useState<IAutocompleteState>({ options: propertyItems2options(initialProperties, null, isPropertySelectable), propertyItems: initialProperties, prefix: null });

  const setProperties = (properties: IPropertyItem[], prefix: string): void => {
    const filteredProperties = isPropertyVisible
      ? properties.filter((p) => isPropertyVisible(p))
      : properties;

    setState({
      propertyItems: filteredProperties,
      options: propertyItems2options(filteredProperties, prefix, isPropertySelectable),
      prefix,
    });
  };

  const getPrefixFromString = (value: string): string | null => {
    if (!value)
      return null;

    const lastIdx = value.lastIndexOf('.');

    if (state.propertyItems && state.propertyItems.length > 0 && lastIdx > -1) {
      // Check specifications, specification name may contain namespace and it shouldn't be recognized as a container
      const spec = state.propertyItems.find((s) => isSpecification(s) && s.name === value);
      if (spec)
        return null;
    }

    return lastIdx === -1
      ? null
      : value.substring(0, lastIdx);
  };

  const containerPath = useMemo(() => {
    if (!props.value || Array.isArray(props.value))
      return null;

    return getPrefixFromString(props.value);
  }, [props.value]);

  const isFirstLoading = useRef<boolean>(true);
  useEffect(() => {
    const firstLoad = isFirstLoading.current;

    if (isFirstLoading.current === true) {
      isFirstLoading.current = false;
    }

    if (firstLoad || containerPath !== state.prefix) {
      // fetch container if changed
      fetchContainer(containerPath).then((m) => {
        const propertyItems = modelMetadata2Properties(m);
        setProperties(propertyItems, containerPath);
      });
    }
  }, [containerPath]);

  const getPropertyItem = (path: string): IPropertyItem => {
    return state.propertyItems.find((p) => getPropertyItemIdentifier(p, containerPath) === path);
  };

  const onSelect = (data: string): void => {
    if (props.onChange) props.onChange(data);
    if (props.onSelect) {
      const property = getPropertyItem(data);
      props.onSelect(data, property);
    }
  };

  const onSearch = (data: string): void => {
    const filteredOptions: IOption[] = [];
    state.propertyItems.forEach((p) => {
      const fullPath = p.itemType === 'property'
        ? getFullPath((p as IPropertyMetadata).path, containerPath)
        : (p as ISpecification).friendlyName;

      if (fullPath.toLowerCase()?.startsWith(data?.toLowerCase())) {
        const option = propertyItem2option(p, containerPath, isPropertySelectable);
        filteredOptions.push(option);
      }
    });

    setState((s) => ({ propertyItems: state.propertyItems, options: filteredOptions, prefix: s.prefix }));

    if (props.onChange)
      props.onChange(data);
  };

  const onClear = (): void => {
    props.onChange?.(null);
  };

  return (
    <Select
      onSelect={onSelect}
      value={props.value}
      showSearch
      onSearch={onSearch}
      size={props.size}
      disabled={readOnly}
      options={state.options}
      style={{ minWidth: "150px" }}
      styles={props.dropdownStyle ? { popup: { root: props.dropdownStyle } } : undefined}
      popupMatchSelectWidth={false}
      allowClear
      onClear={onClear}
    >
    </Select>
  );
};

export default PropertySelect;
