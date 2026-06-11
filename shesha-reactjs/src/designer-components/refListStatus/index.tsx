import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { RefListStatus } from '@/components/refListStatus/index';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { IInputStyles, useForm } from '@/providers';
import { isDefined } from '@/utils/nullables';
import { FileSearchOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { IRefListStatusPropsV0 } from './migrations/models';
import { IRefListStatusProps } from './models';
import { getSettings } from './settings';
import { defaultStyles } from './utils';

const RefListStatusComponent: IToolboxComponent<IRefListStatusProps> = {
  type: 'refListStatus',
  isInput: true,
  isOutput: true,
  // Component manages its own dimensions in designer mode
  preserveDimensionsInDesigner: true,
  name: 'Reference list status',
  icon: <FileSearchOutlined />,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const { solidBackground = true, referenceListId, showReflistName = true } = model;

    if (model.hidden && formMode !== 'designer') return null;

    if (!isDefined(referenceListId)) {
      return formMode === 'designer'
        ? (
          <Alert
            showIcon
            title="ReflistStatus configuration is incomplete"
            description="Please make sure that you've select a reference list."
            type="warning"
          />
        )
        : undefined;
    }

    return (
      <ConfigurableFormItem<number> model={{ ...model }}>
        {(value) => {
          return (
            <RefListStatus
              value={value ?? undefined}
              referenceListId={referenceListId}
              showIcon={model.showIcon}
              showReflistName={showReflistName}
              solidBackground={solidBackground}
              style={model.allStyles?.fullStyle ?? {}}
              isDesigner={formMode === 'designer'}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },

  initModel: (model) => {
    const customModel: IRefListStatusProps = {
      ...model,
      hideLabel: true,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IRefListStatusPropsV0>(0, (prev) => {
      const result: IRefListStatusPropsV0 = {
        ...prev,
        name: 'name' in prev && typeof (prev.name) === "string" ? prev.name : "",
        module: '',
        nameSpace: '',
      };
      return result;
    })
    .add<IRefListStatusProps>(1, (prev) => {
      const { module, nameSpace, ...restProps } = prev;
      const result: IRefListStatusProps = {
        ...restProps,
        referenceListId: nameSpace
          ? { module: module, name: nameSpace /* note the property was named wrong initially */ }
          : undefined,
      };
      return result;
    })
    .add<IRefListStatusProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IRefListStatusProps>(3, (prev) => migrateVisibility(prev))
    .add<IRefListStatusProps>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IRefListStatusProps>(5, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        fontSize: prev.fontSize,
        fontColor: prev.fontColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox,
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IRefListStatusProps>(6, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  linkToModelMetadata: (model, metadata): IRefListStatusProps => {
    return {
      ...model,
      referenceListId: metadata.referenceListName
        ? {
          module: metadata.referenceListModule ?? null,
          name: metadata.referenceListName,
        }
        : undefined,
    };
  },
};

export default RefListStatusComponent;
