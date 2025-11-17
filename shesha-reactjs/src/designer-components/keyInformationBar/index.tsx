import KeyInformationBar from '@/components/keyInformationBar';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { nanoid } from '@/utils/uuid';
import { BorderLeftOutlined } from '@ant-design/icons';
import React from 'react';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { removeComponents } from '../_common-migrations/removeComponents';
import { ColumnsComponentDefinition, IKeyInformationBarProps } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

const ColumnsComponent: ColumnsComponentDefinition = {
  type: 'KeyInformationBar',
  isInput: false,
  name: 'Key Information Bar',
  icon: <BorderLeftOutlined />,
  Factory: ({ model }) => {
    return (
      <ParentProvider model={model}>
        <KeyInformationBar {...model} />
      </ParentProvider>
    );
  },
  migrator: (m) =>
    m
      .add<IKeyInformationBarProps>(
        0,
        (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IKeyInformationBarProps,
      )
      .add<IKeyInformationBarProps>(1, (prev) => migrateVisibility(prev))
      .add<IKeyInformationBarProps>(2, (prev) => removeComponents(prev))
      .add<IKeyInformationBarProps>(3, (prev) => {
        const prevDividerStyles = {
          orientation: prev?.orientation,
          dividerWidth: prev?.dividerWidth,
          dividerMargin: prev?.dividerMargin,
          dividerColor: prev?.dividerColor,
          gap: prev?.gap,
        };

        return ({
          ...prev,
          desktop: { ...prev.desktop, ...prevDividerStyles },
          mobile: { ...prev.mobile, ...prevDividerStyles },
          tablet: { ...prev.tablet, ...prevDividerStyles },
        });
      })
      .add<IKeyInformationBarProps>(4, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  initModel: (model) => {
    const tabsModel: IKeyInformationBarProps = {
      ...model,
      propertyName: 'column 1',
      columns: [
        {
          id: nanoid(),
          width: 200,
          textAlign: 'center',
          flexDirection: 'column',
          components: [],
          padding: '0px',
        },
      ],
    };

    return tabsModel;
  },
  settingsFormMarkup: () => getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
  customContainerNames: ['columns'],
};

export default ColumnsComponent;
