/* eslint-disable react-hooks/rules-of-hooks */
import { FolderOpenOutlined } from '@ant-design/icons';
import {
  IConfigurableFormComponent,
  IToolboxComponent,
  ShaIcon,
  validateConfigurableComponentSettings,
} from '@shesha-io/reactjs';
import { Empty } from 'antd';
import React from 'react';
import { getSettings } from './settings';

export interface IEmptyProps extends IConfigurableFormComponent {
  description: string;
  image?: string;
  imageStyle?: boolean;
  imageSize?: number;
}

const EmptyComponent: IToolboxComponent<IEmptyProps> = {
  type: 'empty',
  isInput: false,
  name: 'Empty',
  icon: <FolderOpenOutlined />,
  Factory: ({ model }) => {
    const { description, image } = model;

    if (model.hidden) return null;

    return (
      <Empty
        description={description}
        image={image ? <ShaIcon iconName={image as any} size={45} /> : Empty.PRESENTED_IMAGE_DEFAULT}
      />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default EmptyComponent;
