import React /*, { useState } */ from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { MetadataProvider, IMetadataProviderProps, useMetadata } from './';
import { AutoComplete } from 'antd';

export default {
  title: 'Providers/MetadataProvider',
  component: MetadataProvider,
  argTypes: {},
} as Meta;

// Create a master template
const Template: Story<IMetadataProviderProps> = args => {
  return (
    <MetadataProvider {...args}>
      <MetadataConsumer />
    </MetadataProvider>
  );
};

const MetadataConsumer = () => {
  const { properties = [] } = useMetadata();

  const opts = properties.map(p => ({ value: p.path, label: p.label }));
  /*
  const [options, setOptions] = useState<{ value: string }[]>(opts);
  
  const onSearch = (searchText: string) => {
    setOptions(
      !searchText ? [] : opts.filter(o => o.label.),
    );
  };
  */

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
