import { LineHeightOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { ITextTypographyProps } from '../../../components/formDesigner/components/text/models';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';

const TitleComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'title',
  name: 'Title',
  icon: <LineHeightOutlined />,
  tooltip: "Deprecated! Please use 'Text (Full)'",
  Factory: () => {
    throw new Error('`title` component is deprecated');
  },
  migrator: (m) =>
    m.add<ITextTypographyProps>(0, (prev) => {
      const props = {
        ...prev,
        content: prev['content'] ?? '',
        contentDisplay: 'content',

        type: 'text',
        textType: 'title',
      };
      return migratePropertyName(migrateCustomFunctions(props)) as ITextTypographyProps;
    }),
};

export default TitleComponent;
