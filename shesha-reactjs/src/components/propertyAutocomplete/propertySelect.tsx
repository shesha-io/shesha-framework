import camelcase from 'camelcase';
import React, {
  CSSProperties,
  FC,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { BulbOutlined, BulbTwoTone } from '@ant-design/icons';
import { DataTypes } from '@/interfaces/dataTypes';
import { getIconByPropertyMetadata } from '@/utils/metadata';
import {
  IModelMetadata,
  IPropertyMetadata,
  isEntityMetadata,
  ISpecification,
  metadataHasNestedProperties
} from '@/interfaces/metadata';
import { Select, Tooltip } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useQueryBuilder } from '@/providers';

export interface IPropertySelectProps {
  id?: string;
  value?: string;
  style?: CSSProperties;
  dropdownStyle?: CSSProperties;
  size?: SizeType;
  onChange?: (value: string) => void;
  onSelect?: (value: string, selectedProperty: IPropertyItem) => void;
  readOnly?: boolean;
}

export interface IQbItem {
  label: string;
  key: string;
  items?: IQbItem[];
}

interface IOption {
  value: string;
  label: string | React.ReactNode;
}

interface IAutocompleteState {
  options: IOption[];
  propertyItems: IPropertyItem[];
}

const getFullPath = (path: string, prefix: string) => {
  return prefix ? `${prefix}.${camelcase(path)}` : camelcase(path);
};

export interface IHasPropertyType {
  itemType: 'property' | 'specification';
}

export type IPropertyItem = (IPropertyMetadata | ISpecification) & IHasPropertyType;

const isPropertyMetadata = (item: IPropertyItem): item is IPropertyMetadata & IHasPropertyType => {
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

const propertyItem2option = (item: IPropertyItem, prefix: string): IOption => {
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
      label: label
    };
  }

  if (isPropertyMetadata(item)) {
    const property = item as IPropertyMetadata;
    const value = getPropertyItemIdentifier(item, prefix);
    const icon = getIconByPropertyMetadata(property);
    const label = <div>{icon} {value}</div>;

    return {
      value: value,
      label: label
    };
  }

  throw new Error('Unknown type of item');
};

const propertyItems2options = (properties: IPropertyItem[], prefix: string): IOption[] => {
  return properties.filter(p => !(p.itemType === 'property' && (p as IPropertyMetadata).dataType === DataTypes.array)).map(p => propertyItem2option(p, prefix));
};

const modelMetadata2Properties = (modelMetadata?: IModelMetadata): IPropertyItem[] => {
  if (!modelMetadata)
    return [];

  const properties = metadataHasNestedProperties(modelMetadata)
    ? (modelMetadata.properties).map<IPropertyItem>(p => ({ ...p, itemType: 'property' }))
    : [];

  const specifications = isEntityMetadata(modelMetadata)
    ? (modelMetadata.specifications ?? []).map<IPropertyItem>(p => ({ ...p, itemType: 'specification' }))
    : [];

  return [...properties, ...specifications];
};

export const PropertySelect: FC<IPropertySelectProps> = ({ readOnly = false, ...props }) => {

  const { fetchContainer } = useQueryBuilder();

  const initialProperties = [];

  const [state, setState] = useState<IAutocompleteState>({ options: propertyItems2options(initialProperties, null), propertyItems: initialProperties });

  const setProperties = (properties: IPropertyItem[], prefix: string) => {
    setState({
      propertyItems: properties,
      options: propertyItems2options(properties, prefix)
    });
  };

  const containerPath = useMemo(() => {
    if (!props.value || Array.isArray(props.value))
      return null;

    const lastIdx = props.value.lastIndexOf('.');

    if (state.propertyItems && state.propertyItems.length > 0 && lastIdx > -1) {
      // Check specifications, specification name may contain namespace and it shouldn't be recognized as a container
      const spec = state.propertyItems.find(s => isSpecification(s) && s.name === props.value);
      if (spec)
        return null;
    }

    return lastIdx === -1
      ? null
      : props.value.substring(0, lastIdx);
  }, [props.value]);

  const isFirstLoading = useRef<boolean>(true);
  useEffect(() => {
    if (!containerPath && !isFirstLoading.current)
      return;

    if (isFirstLoading.current === true) {
      isFirstLoading.current = false;
    }

    // fetch container if changed
    fetchContainer(containerPath).then(m => {
      const propertyItems = modelMetadata2Properties(m);
      setProperties(propertyItems, containerPath);
    });
  }, [containerPath]);

  const getPropertyItem = (path: string): IPropertyItem => {
    return state.propertyItems.find(p => getPropertyItemIdentifier(p, containerPath) === path);
  };

  const onSelect = (data: string) => {
    if (props.onChange) props.onChange(data);
    if (props.onSelect) {
      const property = getPropertyItem(data);
      props.onSelect(data, property);
    }
  };

  const onSearch = (data: string) => {
    if (props.onChange)
      props.onChange(data);

    const filteredOptions: IOption[] = [];
    state.propertyItems.forEach(p => {
      const fullPath = p.itemType === 'property'
        ? getFullPath((p as IPropertyMetadata).path, containerPath)
        : (p as ISpecification).friendlyName;

      if (fullPath.toLowerCase()?.startsWith(data?.toLowerCase())) {
        const option = propertyItem2option(p, containerPath);
        filteredOptions.push(option);
      }
    });

    setState({ propertyItems: state.propertyItems, options: filteredOptions });
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

      dropdownStyle={props?.dropdownStyle}
      popupMatchSelectWidth={false}
    >
    </Select>
  );
};

export default PropertySelect;
