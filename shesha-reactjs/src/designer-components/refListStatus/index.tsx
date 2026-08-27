import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { RefListStatus } from '@/components/refListStatus/index';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateReadOnly, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

import { useEffectOnce } from '@/hooks/useEffectOnce';
import { DataTypes } from '@/interfaces/dataTypes';
import { IInputStyles, useForm } from '@/providers';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { isDefined } from '@/utils/nullables';
import { FileSearchOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { RefListStatusApi } from '../../componentsApi/componentApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE, getComponentEvents } from '../_common/events';
import { IRefListStatusComponentProps, IRefListStatusComponentPropsV1, RefListStatusComponentDefinition } from './interfaces';
import { IRefListStatusPropsV0 } from './migrations/models';
import { getSettings } from './settings';
import { useStyles } from './styles';
import { defaultStyles } from './utils';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const RefListStatusComponent: RefListStatusComponentDefinition = {
  allowInherit: true,
  type: 'refListStatus',
  isInput: true,
  isOutput: true,
  // Component manages its own dimensions in designer mode
  preserveDimensionsInDesigner: true,
  name: 'Reference list status',
  icon: <FileSearchOutlined />,
  Factory: ({ model, apiContext }) => {
    const { formMode } = useForm();
    const { solidBackground = true, referenceListId, showReflistName = true } = model;

    const [itemText, setItemText] = useState<string | undefined>(undefined);
    const onItemTextChange = useCallback((value: string | null | undefined) => setItemText(value ?? undefined), []);

    const componentApi = useComponentApiProvider();

    useEffect(() => {
      componentApi?.updateApi<RefListStatusApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'RefListStatusApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'itemText', getter: () => itemText },
        ],
      });
    }, [apiContext, componentApi, itemText, model.componentName, model.id]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    const { styles } = useStyles(model);

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
        {(value, _onChange, _propertyName, ctx) => {
          // The tag renders in every interaction mode. Read only is a status tag's natural state -
          // rendering it as plain text instead threw away the icon, colour and badge, which is the
          // whole of what the component displays. Disabled keeps the tag but greys it out and
          // blocks pointer interaction; the two are independent settings of Interaction Mode.
          return (
            <div
              className={styles.refListStatus}
              {...getComponentEvents<number>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE, ctx, value, DataTypes.number)}
            >
              <RefListStatus
                value={value ?? undefined}
                referenceListId={referenceListId}
                showIcon={model.showIcon}
                showReflistName={showReflistName}
                solidBackground={solidBackground}
                isDesigner={formMode === 'designer'}
                readOnly={model.readOnly === true}
                disabled={model.disabled === true}
                onItemTextChange={onItemTextChange}
              />
            </div>
          );
        }}
      </ConfigurableFormItem>
    );
  },

  initModel: (model) => {
    const customModel: IRefListStatusComponentProps = {
      ...model,
      hideLabel: true,
    };
    return customModel;
  },
  getDefaultStyles: () => defaultStyles(),
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
    .add<IRefListStatusComponentPropsV1>(1, (prev) => {
      const { module, nameSpace, ...restProps } = prev;
      const result: IRefListStatusComponentPropsV1 = {
        ...restProps,
        referenceListId: nameSpace
          ? { module: module, name: nameSpace /* note the property was named wrong initially */ }
          : undefined,
      };
      return result;
    })
    .add<IRefListStatusComponentPropsV1>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IRefListStatusComponentPropsV1>(3, (prev) => migrateVisibility(prev))
    .add<IRefListStatusComponentPropsV1>(4, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IRefListStatusComponentPropsV1>(5, (prev, context) => {
      if (context.isNew === true) return prev;

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
    .add<IRefListStatusComponentPropsV1>(6, (prev, context) => context.isNew === true
      ? prev
      : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IRefListStatusComponentProps>(7, (prev) => migrateReadOnly(prev))
    .add<IRefListStatusComponentProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  settingsFormMarkup: getSettings,

  linkToModelMetadata: (model, metadata): IRefListStatusComponentProps => {
    return {
      ...model,
      referenceListId: isDefined(model.referenceListId)
        ? model.referenceListId
        : metadata.referenceListName
          ? {
            module: metadata.referenceListModule ?? null,
            name: metadata.referenceListName,
          }
          : undefined,
    };
  },
  previewConfiguration: {
    type: 'refListStatus',
    id: 'refListStatus',
    propertyName: 'refListStatusAppearance',
    label: 'Reference List Status Label',
    version: 'latest',
    showReflistName: true,
    solidBackground: true,
  },
};

export default RefListStatusComponent;
