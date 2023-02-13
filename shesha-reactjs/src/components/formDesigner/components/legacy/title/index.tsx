import { LineHeightOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '../../../../../interfaces/formDesigner';
import { ITextTypographyProps } from '../../text/models';
import TypographyComponent from '../../text/typography';

const TitleComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'title',
  name: 'Title',
  icon: <LineHeightOutlined />,
  tooltip: "Deprecated! Please use 'Text (Full)'",
  factory: model => <TypographyComponent {...model} />,
};

export default TitleComponent;
