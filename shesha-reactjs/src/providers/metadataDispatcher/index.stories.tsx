import React /*, { useState } */ from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { MetadataDispatcherProvider, IMetadataDispatcherProviderProps, useMetadataDispatcher } from './';
import { AutoComplete } from 'antd';
//import { IPropertyMetadata } from './contexts';
//import Autocomplete from '../../components/autocomplete';

export default {
  title: 'Providers/MetadataDispatcherProvider',
  component: MetadataDispatcherProvider,
  argTypes: {},
} as Meta;

// Create a master template
const Template: Story<IMetadataDispatcherProviderProps> = args => {
  return (
    <MetadataDispatcherProvider {...args}>
      <MetadataConsumer />
    </MetadataDispatcherProvider>
  );
};

const MetadataConsumer = () => {
  const { getActiveProvider } = useMetadataDispatcher(false) ?? {};
  const provider = Boolean(getActiveProvider) ? getActiveProvider() : null;
  const properties = provider?.metadata?.properties;

  const opts = properties.map(p => ({ value: p.path, label: p.label }));

  const onSelect = (data: string) => {
    console.log('onSelect', data);
  };

  return (
    <AutoComplete
      options={opts}
      style={{ width: 200 }}
      onSelect={onSelect}
      //onSearch={onSearch}
      filterOption={(inputValue, option) => option?.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
      placeholder="input here"
    />
  );
};

// Reuse that template for creating different stories
export const Basic = Template.bind({
  //containerType: 'Shesha.Core.Person'
});
Basic.args = {
  containerType: 'Shesha.Core.Person',
};
