import { FileAddOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { FileUpload } from '@/components/fileUpload';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { DataTypes } from '@/interfaces';
import { FileUploadProvider, IInputStyles, useFormData } from '@/providers';
import { useForm } from '@/providers/form';
import { evaluateString, useAvailableConstantsData } from '@/providers/form/utils';
import {
  migrateCustomFunctions,
  migrateHiddenToVisible,
  migratePropertyName,
  migrateReadOnly,
  migrateStylingBoxToJson,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { FileUploadComponentDefinition, IFileUploadProps } from './interfaces';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { getIdOrUndefined } from '@/utils/entity';
import { getFirstNonEmptyStringPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { FileUploadValue } from '@/providers/storedFile/models';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { FileUploadApi } from '../../componentsApi/componentApi';
import { ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, getComponentEvents } from '../_common/events';

import apiCode from "../../componentsApi/componentApi.ts?raw";

const FileUploadComponent: FileUploadComponentDefinition = {
  allowInherit: true,
  type: 'fileUpload',
  name: 'File',
  icon: <FileAddOutlined />,
  isInput: true,
  isOutput: true,
  // FileUpload has its own intrinsic size and should not be forced to fill wrapper
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.file,
  Factory: ({ model, apiContext }) => {
    // TODO: refactor and implement a generic way for values evaluation
    const { formSettings, formMode } = useForm();
    const { data } = useFormData();
    /* Resolve the template against the DataContext model (application/page/form/contexts) rather
       than the deprecated GlobalState. The context bag still exposes `globalState`, so an existing
       `{{globalState.x}}` owner template keeps resolving. */
    const executionContext = useAvailableConstantsData();
    const ownerId = evaluateString(model.ownerId, executionContext);

    const { styles } = useStyles(model);

    // Read-only presents the attached file without the controls that would change it; disabled
    // greys the whole uploader out. The two are independent booleans, so both are honoured here.
    const readOnly = model.readOnly === true;
    const disabled = model.disabled === true;
    const enabled = !readOnly && !disabled;

    const allowUpload = enabled && model.allowUpload === true;
    const allowReplace = enabled && model.allowReplace === true;
    const allowDelete = enabled && model.allowDelete === true;

    const componentApi = useComponentApi();
    useEffect(() => {
      componentApi?.updateApi<FileUploadApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'FileUploadApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'allowUpload', getter: () => allowUpload },
          { name: 'allowReplace', getter: () => allowReplace },
          { name: 'allowDelete', getter: () => allowDelete },
          {
            name: 'allowedFileTypes',
            getter: () => model.allowedFileTypes,
            setter: (value) => apiContext?.updateApiModel({ allowedFileTypes: value }),
          },
        ],
      });
    }, [apiContext, componentApi, model.componentName, model.id, model.allowedFileTypes, allowUpload, allowReplace, allowDelete]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    return (
      <ConfigurableFormItem<FileUploadValue> model={model} autoAlignLabel={false}>
        {(value, onChange, _, ctx) => {
          return (
            <FileUploadProvider
              value={value}
              onChange={(newValue) => {
                /* Update the form value first, so a script reading the field sees the new value
                   rather than the previous one, and only run the handler when one is configured —
                   matching the attachments editor. */
                onChange(newValue);
                if (isNotNullOrWhiteSpace(model.onChangeCustom))
                  ctx?.handleEvent(undefined, { value: newValue }, model.onChangeCustom);
              }}
              ownerId={!isNullOrWhiteSpace(ownerId) ? ownerId : getIdOrUndefined(data) ?? ""}
              ownerType={!isEntityTypeIdEmpty(model.ownerType)
                ? model.ownerType
                : !isEntityTypeIdEmpty(formSettings?.modelType)
                  ? formSettings.modelType
                  : ''}
              propertyName={model.propertyName}
              uploadMode={model.useSync === true ? 'sync' : 'async'}
            >
              {/* The events wrapper also carries the Custom style: the box half applies here, while the
                  text half is merged into the emotion class (a class rule on a child would otherwise
                  beat an inherited inline value). */}
              <div
                className={styles.fileUpload}
                {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
                {...getComponentEvents<FileUploadValue>(model, ALL_INPUT_EVENTS_WITHOUT_CHANGE_AND_DOUBLE_CLICK, ctx, value, DataTypes.file)}
              >
                <FileUpload
                  isStub={formMode === 'designer'}
                  allowUpload={allowUpload}
                  allowDelete={allowDelete}
                  allowReplace={allowReplace}
                  allowedFileTypes={model.allowedFileTypes}
                  isDragger={model.isDragger}
                  listType={model.listType}
                  hideFileName={model.hideFileName}
                  thumbnailWidth={model.thumbnailWidth}
                  thumbnailHeight={model.thumbnailHeight}
                  disabled={disabled}
                />
              </div>
            </FileUploadProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => ({
    // Functional defaults only. Styles are deliberately left empty so a new component inherits from
    // the theme and from metadata (see getDefaultStyles / linkToModelMetadata) rather than shipping
    // hard-coded appearance.
    ...model,
    allowUpload: true,
    allowReplace: true,
    allowDelete: true,
  }),
  getDefaultStyles: () => defaultStyles(),
  migrator: (m) =>
    m
      .add<IFileUploadProps>(0, (prev) => {
        return {
          ...prev,
          allowReplace: true,
          allowDelete: true,
          allowUpload: true,
          hideFileName: true,
          ownerId: getStringPropertyOrUndefined(prev, 'ownerId') ?? "",
          ownerType: getStringPropertyOrUndefined(prev, 'ownerType') ?? "",
        };
      })
      .add<IFileUploadProps>(1, (prev, context) => ({
        ...prev,
        useSync: prev.useSync === undefined ? isEntityTypeIdEmpty(context.formSettings?.modelType) : prev.useSync,
      }))
      .add<IFileUploadProps>(2, (prev) => {
        const pn = getFirstNonEmptyStringPropertyOrUndefined(prev, ['name', 'propertyName']);
        const model = migratePropertyName(migrateCustomFunctions(prev));
        model.propertyName = pn;
        return model;
      })
      .add<IFileUploadProps>(3, (prev) => migrateVisibility(prev))
      .add<IFileUploadProps>(4, (prev) => migrateReadOnly(prev))
      .add<IFileUploadProps>(5, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IFileUploadProps>(6, (prev, context) => context.isNew === true
        ? prev
        : { ...migratePrevStyles(prev, defaultStyles()) })
      // Freeze the appearance of components saved before the refactor: bake the component's real
      // defaults into all three device models so their look no longer follows the code-level
      // defaults. New components skip this and inherit from metadata/theme instead.
      .add<IFileUploadProps>(7, (prev, context) => {
        if (context.isNew === true) return prev;

        const styles: IInputStyles = {
          size: prev.size,
          hideBorder: prev.hideBorder,
          stylingBox: prev.stylingBox,
          style: prev.style,
        };

        return { ...migratePrevStyles({ ...prev, desktop: { ...(prev.desktop ?? {}), ...styles } }, defaultStyles()) };
      })
      .add<IFileUploadProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  settingsFormMarkup: getSettings,

};

export default FileUploadComponent;
