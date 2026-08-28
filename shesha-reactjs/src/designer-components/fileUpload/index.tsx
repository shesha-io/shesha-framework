import { FileAddOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
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
import { displayStyleFromListType, displayStyleToListType, presetThumbnailSize } from '../attachmentsEditor/interfaces';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { getIdOrUndefined } from '@/utils/entity';
import { getFirstNonEmptyStringPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { FileUploadValue } from '@/providers/storedFile/models';
import { useComponentApiProvider } from '@/providers/componentApi/provider';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { FileUploadApi } from '../../componentsApi/componentApi';
import { FILE_EVENTS_WITHOUT_CHANGE, getComponentEvents } from '../_common/events';

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

    /* Display Style is the single control: whether the file reads as a name or a tile, and how big
       that tile is. A preset overrides the configured dimensions, which the settings form hides
       unless Custom is chosen, so the two can never disagree on screen. */
    const displayStyle = model.displayStyle ?? displayStyleFromListType(
      model.listType, model.dimensions?.width, model.dimensions?.height,
    );
    const listType = displayStyleToListType(displayStyle);
    const presetSize = presetThumbnailSize(displayStyle);
    const sizedModel = useMemo<IFileUploadProps>(
      () => ({
        ...model,
        /* The derived value, not the stored one: the styles switch on listType, and a model whose
           two properties disagree would otherwise style a tile as a file name or the reverse. */
        listType,
        ...(isDefined(presetSize)
          ? { dimensions: { ...model.dimensions, width: `${presetSize}px`, height: `${presetSize}px` } }
          : {}),
      }),
      [model, listType, presetSize],
    );

    const { styles } = useStyles(sizedModel);

    // Read-only presents the attached file without the controls that would change it; disabled
    // greys the whole uploader out. The two are independent booleans, so both are honoured here.
    const readOnly = model.readOnly === true;
    const disabled = model.disabled === true;
    const enabled = !readOnly && !disabled;

    const allowUpload = enabled && model.allowUpload === true;
    const allowReplace = enabled && model.allowReplace === true;
    const allowDelete = enabled && model.allowDelete === true;

    const componentApi = useComponentApiProvider();
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
                {...getComponentEvents<FileUploadValue>(model, FILE_EVENTS_WITHOUT_CHANGE, ctx, value, DataTypes.file)}
              >
                <FileUpload
                  isStub={formMode === 'designer'}
                  allowUpload={allowUpload}
                  allowDelete={allowDelete}
                  allowReplace={allowReplace}
                  allowedFileTypes={model.allowedFileTypes}
                  isDragger={model.isDragger}
                  listType={listType}
                  hideFileName={model.hideFileName}
                  thumbnailWidth={model.thumbnailWidth}
                  thumbnailHeight={model.thumbnailHeight}
                  disabled={disabled}
                  styles={model.styleCss}
                  /* The three floating surfaces are portalled to the body, so no descendant selector
                     from the field reaches them — each needs its class handed over explicitly. */
                  popupClassName={styles.popup}
                  modalClassName={styles.modal}
                  imagePreviewClassName={styles.imagePreview}
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
    displayStyle: 'text',
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

        /* Only carry across the legacy root fields that are actually set. Spreading the object
           wholesale would overwrite an existing `desktop` value with `undefined` for every root
           field that is absent — which is the normal case for a model whose styles already moved to
           the device sets — wiping the very values this step is meant to preserve. */
        const styles: IInputStyles = {
          ...(isDefined(prev.size) ? { size: prev.size } : {}),
          ...(isDefined(prev.hideBorder) ? { hideBorder: prev.hideBorder } : {}),
          ...(isDefined(prev.stylingBox) ? { stylingBox: prev.stylingBox } : {}),
          ...(isDefined(prev.style) ? { style: prev.style } : {}),
        };

        return { ...migratePrevStyles({ ...prev, desktop: { ...(prev.desktop ?? {}), ...styles } }, defaultStyles()) };
      })
      .add<IFileUploadProps>(8, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev))))
      /* Display Style replaces List Type. A thumbnail keeps the size it already stores — Medium
         where that is the 54px default, Custom otherwise — so nothing saved changes size. A new
         component has nothing to read and takes its default from initModel instead. */
      .add<IFileUploadProps>(9, (prev, context) => context.isNew === true
        ? prev
        : {
          ...prev,
          displayStyle: prev.displayStyle ?? displayStyleFromListType(
            prev.listType,
            prev.desktop?.dimensions?.width ?? prev.dimensions?.width,
            prev.desktop?.dimensions?.height ?? prev.dimensions?.height,
          ),
        }),
  settingsFormMarkup: getSettings,

};

export default FileUploadComponent;
