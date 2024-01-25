import React, { FC, useMemo } from 'react';
import { MetadataProvider, useMetadata } from '@/providers';
import { Select, SelectProps } from 'antd';

interface IPropertiesWrapperProps extends SelectProps {
  modelType: string;
  mode?: 'multiple' | 'tags';
}

export interface IFormProperty {
  label: string;
  propertyName: string;
  dataType: string;
}

interface PropertiesEditorProps extends SelectProps {
  mode?: 'multiple' | 'tags';
}

const PropertiesEditor: FC<PropertiesEditorProps> = ({ mode, ...props }) => {
  const metadata = useMetadata(false);

  const fields = useMemo<IFormProperty[]>(() => {
    if (metadata) {
      const properties = metadata?.metadata?.properties || [];
      if (Boolean(properties))
        return properties.map<IFormProperty>(property => ({
          label: property.label,
          propertyName: property.path,
          dataType: property.dataType,
        }));
    }
    return null;
  }, [metadata, metadata?.metadata]);

  return (
    <Select mode={mode} showSearch allowClear {...props}>
      {fields?.map(({ label, propertyName }) => (
        <Select.Option value={propertyName} key={propertyName}>
          {label}
        </Select.Option>
      ))}
    </Select>
  );
};

const Properties: FC<IPropertiesWrapperProps> = ({ modelType, children, ...props }) => {
  return (
    <MetadataProvider modelType={modelType}>
      <PropertiesEditor {...props}>{children}</PropertiesEditor>
    </MetadataProvider>
  );
};

export default Properties;
