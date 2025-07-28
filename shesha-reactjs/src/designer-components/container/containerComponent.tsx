import { GroupOutlined } from '@ant-design/icons';
import React from 'react';
import { ICommonContainerProps, IContainerComponentProps, IToolboxComponent } from '@/interfaces';
import { getStyle, getLayoutStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { useFormData, useGlobalState } from '@/providers';
import { ComponentsContainer } from '@/components';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import ParentProvider from '@/providers/parentProvider/index';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './data';
import { removeUndefinedProps } from '@/utils/object';
import { addPx } from '@/utils/style';
import { useStyles } from './styles';

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  isInput: false,
  name: 'Container',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const { styles, cx } = useStyles();

    const {
      dimensionsStyles,
      borderStyles,
      backgroundStyles,
      shadowStyles,
      stylingBoxAsCSS,
    } = model.allStyles;

    const wrapperStyles = removeUndefinedProps({
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...stylingBoxAsCSS
    });

    if (model.hidden) return null;

    const flexAndGridStyles = {
      display: model.display,
      flexDirection: model.flexDirection,
      direction: model.direction,
      justifyContent: model.justifyContent,
      alignItems: model.alignItems,
      alignSelf: model.alignSelf,
      justifyItems: model.justifyItems,
      textJustify: model.textJustify,
      justifySelf: model.justifySelf,
      noDefaultStyling: model.noDefaultStyling,
      gridColumnsCount: model.gridColumnsCount,
      flexWrap: model.flexWrap,
      gap: addPx(model.gap),
    };

    return (
      <ParentProvider model={model}>
        <ComponentsContainer
          containerId={model.id}
          wrapperStyle={{
            ...wrapperStyles,
            alignSelf: model.alignSelf,
            justifySelf: model.justifySelf,
            ...getLayoutStyle({ ...model, style: model?.wrapperStyle }, { data: formData, globalState })
          }}
          style={{
            ...getStyle(model?.style, formData),
            width: '100%',
            height: '100%',
          }}
          noDefaultStyling={model.noDefaultStyling}
          className={cx(model.className, styles.container)}
          dynamicComponents={model?.isDynamic ? model?.components : []}
          {...flexAndGridStyles}
        />
      </ParentProvider>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) =>
    m
      .add<IContainerComponentProps>(0, (prev) => ({
        ...prev,
        direction: prev['direction'] ?? 'vertical',
        justifyContent: prev['justifyContent'] ?? 'left',
        display: prev['display'],
        flexWrap: prev['flexWrap'] ?? 'wrap',
        components: prev['components'] ?? [],
        editMode: 'inherited',
      }))
      .add<IContainerComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IContainerComponentProps>(2, (prev) => migrateVisibility(prev))
      .add<IContainerComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IContainerComponentProps>(4, (prev) => (
        {
          ...prev,
          backgroundDataSource: prev.backgroundDataSource ?? prev['dataSource'],
          backgroundBase64: prev.backgroundBase64 ?? prev['base64'],
          backgroundStoredFileId: prev.backgroundStoredFileId ?? prev['storedFileId'],
        }))
      .add<IContainerComponentProps>(5, (prev) => {
        const styles = {
          style: prev.style,
          wrapperStyle: prev.wrapperStyle,
          className: prev.className,
          stylingBox: prev.stylingBox,
          width: prev.width,
          height: prev.height,
          minWidth: prev.minWidth,
          minHeight: prev.minHeight,
          maxHeight: prev.maxHeight,
          maxWidth: prev.maxWidth
        };
        const showAdvanced = prev.showAdvanced ?? false;
        return { ...prev, showAdvanced: showAdvanced, desktop: { ...styles, showAdvanced }, tablet: { ...styles, showAdvanced }, mobile: { ...styles, showAdvanced } };
      })
      .add<IContainerComponentProps>(6, (prev) => {
        const flexAndGridStyles: ICommonContainerProps = {
          display: prev?.display,
          flexDirection: prev?.flexDirection,
          direction: prev?.direction,
          justifyContent: prev?.justifyContent,
          alignItems: prev?.alignItems,
          alignSelf: prev?.alignSelf,
          justifySelf: prev?.justifySelf,
          justifyItems: prev?.justifyItems,
          textJustify: prev?.textJustify,
          noDefaultStyling: prev?.noDefaultStyling,
          gridColumnsCount: prev?.gridColumnsCount,
          flexWrap: prev?.flexWrap,
          gap: prev?.gap || 8,
          overflow: prev?.overflow || true,
        };

        return {
          ...prev, desktop: { ...prev.desktop, ...flexAndGridStyles },
          tablet: { ...prev.tablet, ...flexAndGridStyles }, mobile: { ...prev.mobile, ...flexAndGridStyles }
        };
      })
      .add<IContainerComponentProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),
};

export default ContainerComponent;