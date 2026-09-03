
import { FolderOpenOutlined } from '@ant-design/icons';
import { IToolboxComponent } from '@/interfaces';
import { ChevronControl } from '@/components/chevron';
import { RefListItemGroupConfiguratorProvider } from '@/components/refListSelectorDisplay/provider';
import { getSettings } from './settingsForm';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { IChevronProps } from '@/components/chevron/models';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible, migrateStylingBoxToJson } from '../_common-migrations';
import { isDefined } from '@/utils';

const ChevronComponent: IToolboxComponent<IChevronProps> = {
  allowInherit: true,
  type: 'chevron',
  isInput: true,
  name: 'Chevron',
  preserveDimensionsInDesigner: true,
  icon: <FolderOpenOutlined />,
  Factory: ({ model }) => {
    if (model.hidden === true) return null;
    return (
      <ConfigurableFormItem<number> model={model}>
        {(value, onChange) => (
          <RefListItemGroupConfiguratorProvider items={model.items ?? []} referenceList={model.referenceList} readOnly={model.readOnly}>
            {/* `onChange` is passed after the model spread so clicking a step writes the selected
                item value back to the bound property. */}
            <ChevronControl {...model} value={value} onChange={onChange} />
          </RefListItemGroupConfiguratorProvider>
        )}
      </ConfigurableFormItem>
    );
  },
  getDefaultStyles: () => defaultStyles(),
  settingsFormMarkup: getSettings,
  migrator: (m) => m
    .add<IChevronProps>(1, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
    .add<IChevronProps>(2, (prev, ctx) => {
      // Fix color settings - move to the device specific settings
      const newModel: IChevronProps = ctx.isNew === true ? prev : {
        ...prev,
        desktop: { ...prev.desktop, colorSource: prev.colorSource, activeColor: prev.activeColor, showIcons: prev.showIcons },
        ...(isDefined(prev.tablet) ? { tablet: { ...prev.tablet, colorSource: prev.colorSource, activeColor: prev.activeColor, showIcons: prev.showIcons } } : {}),
        ...(isDefined(prev.mobile) ? { mobile: { ...prev.mobile, colorSource: prev.colorSource, activeColor: prev.activeColor, showIcons: prev.showIcons } } : {}),
      };
      return migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(newModel)));
    }),
};

export default ChevronComponent;
