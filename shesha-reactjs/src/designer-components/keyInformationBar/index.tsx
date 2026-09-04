import KeyInformationBar from '@/components/keyInformationBar';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

import ParentProvider from '@/providers/parentProvider/index';
import { nanoid } from '@/utils/uuid';
import { BorderLeftOutlined } from '@ant-design/icons';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { removeComponents } from '../_common-migrations/removeComponents';
import { KeyInformationBarComponentDefinition, IKeyInformationBarComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';

const KeyInformationBarComponent: KeyInformationBarComponentDefinition = {
  styleGroup: 'common-containers',
  allowInherit: true,
  type: 'KeyInformationBar',
  isInput: false,
  name: 'Key Information Bar',
  icon: <BorderLeftOutlined />,
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model }) => {
    return (
      <ParentProvider model={model} name={`KeyInformationBar-${model.id}`}>
        <KeyInformationBar {...model} />
      </ParentProvider>
    );
  },
  getDefaultStyles: defaultStyles,
  migrator: (m) => m
    .add<IKeyInformationBarComponentProps>(
      0,
      (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IKeyInformationBarComponentProps,
    )
    .add<IKeyInformationBarComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IKeyInformationBarComponentProps>(2, (prev) => removeComponents(prev))
    .add<IKeyInformationBarComponentProps>(3, (prev, ctx) => {
      if (ctx.isNew === true) return prev;
      const prevDividerStyles = {
        orientation: prev.orientation,
        dividerWidth: prev.dividerWidth,
        dividerMargin: prev.dividerMargin,
        dividerHeight: prev.dividerHeight,
        dividerThickness: prev.dividerThickness,
        dividerColor: prev.dividerColor,
        alignItems: prev.alignItems,
        gap: prev.gap,
      };

      return ({
        ...prev,
        desktop: { ...prev.desktop, ...prevDividerStyles },
        mobile: { ...prev.mobile, ...prevDividerStyles },
        tablet: { ...prev.tablet, ...prevDividerStyles },
      });
    })
    .add<IKeyInformationBarComponentProps>(4, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IKeyInformationBarComponentProps>(5, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  initModel: (model) => {
    const tabsModel: IKeyInformationBarComponentProps = {
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
  settingsFormMarkup: getSettings,

  customContainerNames: ['columns'],
  previewConfiguration: {
    version: 'latest',
    type: 'KeyInformationBar',
    id: 'KeyInformationBar',
    propertyName: 'column 1',
    columns: [
      { id: nanoid(), width: 200, textAlign: 'center', flexDirection: 'column', padding: '0px', components: [
        { type: 'textField', id: 'textField', label: 'Text Field' },
      ],
      },
      { id: nanoid(), width: 200, textAlign: 'center', flexDirection: 'column', padding: '0px', components: [
        { type: 'textField', id: 'textField1', label: 'Text Field1' },
      ],
      },
    ],
  },
};

export default KeyInformationBarComponent;
