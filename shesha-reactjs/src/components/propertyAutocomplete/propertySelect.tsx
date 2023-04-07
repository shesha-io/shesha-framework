import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { Select, Tooltip } from 'antd';
import { useMetadata, useQueryBuilder } from '../../providers';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IModelMetadata, IPropertyMetadata, ISpecification } from '../../interfaces/metadata';
import camelcase from 'camelcase';
import { getIconByPropertyMetadata } from '../../utils/metadata';
import { BulbOutlined, BulbTwoTone } from '@ant-design/icons';
import { DataTypes } from '../../interfaces/dataTypes';


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

export const getPropertyItemIdentifier = (item: IPropertyItem, prefix: string): string => {
  switch(item.itemType){
    case 'property': return getFullPath((item as IPropertyMetadata).path, prefix);
    case 'specification': return (item as ISpecification).name;
  }
  return null;
};

const propertyItem2option = (item: IPropertyItem, prefix: string): IOption => {
  if (item.itemType === 'specification') {
    const spec = item as ISpecification;
    const value = spec.name;
    const label = (
        <div>
          { spec.description ? <Tooltip title={spec.description}><BulbTwoTone twoToneColor="orange" style={{ cursor: 'help' }}/></Tooltip> : <BulbOutlined /> }
          {spec.friendlyName}
        </div>
    );

    return {
      value: value,
      label: label
    };
  } else {
    const property = item as IPropertyMetadata;
    const value = getPropertyItemIdentifier(item, prefix);
    const icon = getIconByPropertyMetadata(property);
    const label = <div>{icon} {value}</div>;

    return {
      value: value,
      label: label
    };
  }
};

const propertyItems2options = (properties: IPropertyItem[], prefix: string): IOption[] => {
  return properties.filter(p => !(p.itemType === 'property' && (p as IPropertyMetadata).dataType === DataTypes.array)).map(p => propertyItem2option(p, prefix));
};

export interface IHasPropertyType {
  itemType: 'property' | 'specification';
}

export type IPropertyItem = (IPropertyMetadata | ISpecification) & IHasPropertyType;

const getPropertiesWithSpecs = (metadata?: IModelMetadata): IPropertyItem[] => {
  if (!metadata)
    return [];
    
  const properties = (metadata.properties ?? []).map<IPropertyItem>(p => ({...p, itemType: 'property'}));
  const specifications = (metadata.specifications ?? []).map<IPropertyItem>(p => ({...p, itemType: 'specification'}));


  return [...properties, ...specifications];
};

export const PropertySelect: FC<IPropertySelectProps> = ({ readOnly = false, ...props }) => {
  const meta = useMetadata(false);
  const { fetchContainer } = useQueryBuilder();
  const { metadata } = meta || {};

  const initialProperties = getPropertiesWithSpecs(metadata);

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

    if (metadata && lastIdx > -1){
      // Check specifications, specification name may contain namespace and it shouldn't be recognized as a container
      const spec = metadata.specifications?.find(s => s.name === props.value);
      if (spec)
        return null;
    }

    return lastIdx === -1
      ? null
      : props.value.substring(0, lastIdx);
  }, [props.value]);

  useEffect(() => {
    // fetch container if changed
    fetchContainer(containerPath).then(m => {
      const propertyItems = getPropertiesWithSpecs(m);
      setProperties(propertyItems, containerPath);
    });
  }, [metadata?.properties, containerPath]);

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

      if (fullPath.toLowerCase()?.startsWith(data?.toLowerCase())){
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
      dropdownMatchSelectWidth={false}
    >
    </Select>
  );
};

export default PropertySelect;
