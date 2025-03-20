/* eslint-disable react-hooks/rules-of-hooks */
import { FolderOpenOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { ChevronControl } from '@/components/chevron';
import { RefListItemGroupConfiguratorProvider } from '@/providers/refList/provider';
import { getSettings } from './settingsForm';
import { ConfigurableFormItem } from '@/components';
import { IChevronProps } from '@/components/chevron/models';

const ChevronComponent: IToolboxComponent<IChevronProps> = {
  type: 'chevron',
  isInput: true,
  name: 'Chevron',
  icon: <FolderOpenOutlined />,
  Factory: ({ model }) => {
    if (model.hidden) return null;
    return (
      <ConfigurableFormItem model={model}>
        {value => (
          <RefListItemGroupConfiguratorProvider value={value} items={model.items} referenceList={model.referenceList} readOnly={model.readOnly}>        
            <ChevronControl 
              value={value}
              {...model}/>
          </RefListItemGroupConfiguratorProvider>
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (props) => getSettings(props),
};

export default ChevronComponent;
