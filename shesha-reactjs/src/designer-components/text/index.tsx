import { LineHeightOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { ITextTypographyProps } from './models';
import TypographyComponent from './typography';
import { legacyColor2Hex } from '@/designer-components/_common-migrations/migrateColor';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { getStyle, isValidGuid, pickStyleFromModel, useSheshaApplication, ValidationErrors } from '@/index';
import { removeUndefinedProps } from '@/utils/object';
import { getSizeStyle } from '../_settings/utils/dimensions/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';

const TextComponent: IToolboxComponent<ITextTypographyProps> = {
  type: 'text',
  name: 'Text',
  icon: <LineHeightOutlined />,
  isOutput: true,
  isInput: false,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  Factory: ({ model }) => {
    const { httpHeaders, backendUrl } = useSheshaApplication();
    const data = model;
    const font = model?.font;
    const border = model?.border;
    const shadow = model?.shadow;
    const dimensions = model?.dimensions;
    const background = model?.background;
    const jsStyle = getStyle(model.style, data);
    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);
    const dimensionsStyles = useMemo(() => getSizeStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const [backgroundStyles, setBackgroundStyles] = useState({});


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

        const style = getBackgroundStyle(background, jsStyle, storedImageUrl);
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

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      textShadow: `${shadow?.offsetX}px ${shadow?.offsetY}px ${shadow?.blurRadius}px ${shadow?.color}`,
      ...dimensionsStyles,
      ...jsStyle,
    });

    return (
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {(value) => (
          <TypographyComponent
            {...model}
            styles={additionalStyles}
            value={model?.contentDisplay === 'name' ? value : model?.content}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => ({
    code: false,
    copyable: false,
    delete: false,
    ellipsis: false,
    mark: false,
    italic: false,
    underline: false,
    level: 1,
    textType: 'span',
    ...model,
  }),
  migrator: (m) =>
    m
      .add<ITextTypographyProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ITextTypographyProps)
      .add<ITextTypographyProps>(1, (prev) => ({
        ...prev,
        color: legacyColor2Hex(prev.color),
        backgroundColor: legacyColor2Hex(prev.backgroundColor),
      }))
      .add<ITextTypographyProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ITextTypographyProps>(3, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev.textType)) })),
};

export default TextComponent;
