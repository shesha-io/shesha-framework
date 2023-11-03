import { LineHeightOutlined } from '@ant-design/icons';
import React from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../interfaces/formDesigner';
import { ColorResult } from 'react-color';
import { ContentType, ITextTypographyProps, TypographyFontSize } from '../../text/models';
import { migratePropertyName, migrateCustomFunctions } from 'designer-components/_common-migrations/migrateSettings';

declare const TITLE_ELE_LIST: [1, 2, 3, 4, 5];

type LevelType = typeof TITLE_ELE_LIST[number];

export interface ITitleProps extends IConfigurableFormComponent {
  content: string;
  contentType: ContentType;
  color?: ColorResult;
  level?: LevelType | TypographyFontSize;
  code?: boolean;
  italic?: boolean;
  copyable?: boolean;
  delete?: boolean;
  ellipsis?: boolean;
  mark?: boolean;
  underline?: boolean;
}

const TitleComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'title',
  name: 'Title',
  icon: <LineHeightOutlined />,
  tooltip: "Deprecated! Please use 'Text (Full)'",
  Factory: () => {
    throw new Error('`title` component is deprecated');
  },
  migrator: (m) => m.add<ITextTypographyProps>(0, (prev) => {
    const props: ITextTypographyProps = {
      ...prev,
      content: prev['content'] ?? '',
      contentDisplay: 'content',

      type: 'text',
      textType: 'title',
    };
    return migratePropertyName(migrateCustomFunctions(props)) as ITextTypographyProps;
  })
};

export default TitleComponent;