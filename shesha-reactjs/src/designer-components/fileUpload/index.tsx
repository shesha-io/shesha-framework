import { FileAddOutlined } from '@ant-design/icons';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { FileUpload } from '@/components';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IFormItem, IToolboxComponent } from '@/interfaces';
import { IStyleType, StoredFileProvider, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { useForm } from '@/providers/form';
import { IConfigurableFormComponent } from '@/providers/form/models';
import {
  evaluateValue,
  getStyle,
  pickStyleFromModel,
  validateConfigurableComponentSettings,
} from '@/providers/form/utils';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { removeUndefinedProps } from '@/utils/object';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { listType } from '../attachmentsEditor/attachmentsEditor';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';

export interface IFileUploadProps extends IConfigurableFormComponent, Omit<IFormItem, 'name'>, IStyleType {
  ownerId: string;
  ownerType: string;
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  useSync?: boolean;
  allowedFileTypes?: string[];
  isDragger?: boolean;
  listType?: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
}

const FileUploadComponent: IToolboxComponent<IFileUploadProps> = {
  type: 'fileUpload',
  name: 'File',
  icon: <FileAddOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model?.style, model);

    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {
      let objectUrl = '';

      const fetchStyles = async () => {
        let storedImageUrl = '';

        try {
          if (background?.storedFile?.id && background?.type === 'storedFile') {
            const response = await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`, {
              headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch background: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            storedImageUrl = objectUrl;
          }
        } catch (error) {
          console.error('Error fetching background image:', error);
        }

        const style = getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();

      // Cleanup function to revoke the object URL when component unmounts or when dependencies change
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [background, backendUrl, httpHeaders]);

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
      jsStyle,
    });

    const finalStyle = removeUndefinedProps(additionalStyles);

    // TODO: refactor and implement a generic way for values evaluation
    const { formSettings, formMode } = useForm();
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const ownerId = evaluateValue(model.ownerId, { data, globalState });

    const enabled = !model.readOnly;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return (
            <StoredFileProvider
              value={value}
              onChange={onChange}
              fileId={model.value?.Id ?? model.value}
              baseUrl={backendUrl}
              ownerId={Boolean(ownerId) ? ownerId : Boolean(data?.id) ? data?.id : ''}
              ownerType={
                Boolean(model.ownerType)
                  ? model.ownerType
                  : Boolean(formSettings?.modelType)
                    ? formSettings?.modelType
                    : ''
              }
              propertyName={model.propertyName}
              uploadMode={model.useSync ? 'sync' : 'async'}
            >
              <FileUpload
                {...model}
                isStub={formMode === 'designer'}
                allowUpload={enabled && model.allowUpload}
                allowDelete={enabled && model.allowDelete}
                allowReplace={enabled && model.allowReplace}
                allowedFileTypes={model?.allowedFileTypes}
                isDragger={model?.isDragger}
                styles={finalStyle}
              />
            </StoredFileProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    const customModel: IFileUploadProps = {
      ...model,
      allowReplace: true,
      allowDelete: true,
      allowUpload: true,
      hideFileName: true,
      ownerId: '',
      ownerType: '',
      isDragger: false,
      editMode: 'inherited',
    };
    return customModel;
  },
  migrator: (m) =>
    m
      .add<IFileUploadProps>(0, (prev) => {
        return {
          ...prev,
          allowReplace: true,
          allowDelete: true,
          allowUpload: true,
          hideFileName: true,
          ownerId: prev['ownerId'],
          ownerType: prev['ownerType'],
          owner: prev['owner'],
        } as IFileUploadProps;
      })
      .add<IFileUploadProps>(1, (prev, context) => ({ ...prev, useSync: !Boolean(context.formSettings?.modelType) }))
      .add<IFileUploadProps>(2, (prev) => {
        const pn = prev['name'] ?? prev.propertyName;
        const model = migratePropertyName(migrateCustomFunctions(prev));
        model.propertyName = pn;
        return model;
      })
      .add<IFileUploadProps>(3, (prev) => migrateVisibility(prev))
      .add<IFileUploadProps>(4, (prev) => migrateReadOnly(prev))
      .add<IFileUploadProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IFileUploadProps>(6, (prev) => ({
        ...prev,
        ...defaultStyles(),
        desktop: { ...defaultStyles() },
        mobile: { ...defaultStyles() },
        tablet: { ...defaultStyles() },
      })),
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
};

export default FileUploadComponent;
