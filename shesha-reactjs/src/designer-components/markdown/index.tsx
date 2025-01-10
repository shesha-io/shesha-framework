import { EditOutlined } from '@ant-design/icons';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { IInputStyles } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IMarkdownProps } from './interfaces';
import Markdown from './markdown';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { getFontStyle } from '../_settings/utils/font/utils';
import { removeUndefinedProps } from '@/utils/object';
import { getStyle, pickStyleFromModel, useSheshaApplication, ValidationErrors } from '@/index';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { defaultStyles } from './utils';

const MarkdownComponent: IToolboxComponent<IMarkdownProps> = {
  type: 'markdown',
  name: 'Markdown',
  icon: <EditOutlined />,
  isInput: false,
  isOutput: true,
  Factory: ({ model }) => {
    const data = model;
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const { font, style, border, background, shadow, stylingBox, dimensions } = model;
    const jsStyle = getStyle(style, data);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);

    useEffect(() => {
      const fetchStyles = async () => {
        const storedImageUrl =
          background?.storedFile?.id && background?.type === 'storedFile'
            ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`, {
                headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' },
              })
                .then((response) => {
                  return response.blob();
                })
                .then((blob) => {
                  return URL.createObjectURL(blob);
                })
            : '';

        const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (
      model?.background?.type === 'storedFile' &&
      model?.background.storedFile?.id &&
      !isValidGuid(model?.background.storedFile.id)
    ) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...jsStyle,
    });
    return (
      <ConfigurableFormItem model={{ ...model, label: undefined, hideLabel: true }}>
        {(value) => {
          const content = model.content || value;
          return <Markdown {...model} content={content} style={additionalStyles} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => ({
    ...model,
  }),
  migrator: (m) =>
    m
      .add<IMarkdownProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IMarkdownProps)
      .add<IMarkdownProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IMarkdownProps>(2, (prev) => {
        const styles: IInputStyles = {
          size: prev.size,
          hideBorder: prev.hideBorder,
          borderSize: prev.borderSize,
          borderRadius: prev.borderRadius,
          borderColor: prev.borderColor,
          fontSize: prev.fontSize,
          fontColor: prev.fontColor,
          backgroundColor: prev.backgroundColor,
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<IMarkdownProps>(3, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default MarkdownComponent;
