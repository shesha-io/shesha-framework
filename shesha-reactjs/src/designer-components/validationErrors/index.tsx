import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { WarningOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';
import { getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IStyleType, useFormData, useSheshaApplication } from '@/providers';
import ValidationErrors from '@/components/validationErrors';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { removeUndefinedProps } from '@/utils/object';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { defaultStyles } from './utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';

export interface IValidationErrorsComponentProps extends IConfigurableFormComponent, IStyleType {
  className?: string;
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  stylingBox?: string;
  height?: string | number;
  width?: string | number;
  backgroundColor?: string;
  hideBorder?: boolean;
}

const ValidationErrorsComponent: IToolboxComponent<IValidationErrorsComponentProps> = {
  type: 'validationErrors',
  isInput: false,
  name: 'Validation Errors',
  icon: <WarningOutlined />,
  Factory: ({ model }) => {
    const { validationErrors, formMode } = useShaFormInstance();
    const { data: formData } = useFormData();

    const { backendUrl, httpHeaders } = useSheshaApplication();

    const font = model?.font;
    const dimensions = model?.dimensions;
    const border = model?.border;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model.style, formData);

    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [jsStyle, border]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {
      const fetchStyles = async () => {
        const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
            { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              return URL.createObjectURL(blob);
            }) : '';

        const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (model.hidden) return null;

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return (
        <ValidationErrors error="The provided StoredFileId is invalid" />
      );
    }
    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);
    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...fontStyles,
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    if (formMode === 'designer')
      return (
        <ValidationErrors
          className={model?.className}
          style={{ ...getStyle(model?.style, formData), ...finalStyle }}
          error="Validation Errors (visible in the runtime only)"
        />
      );

    return (
      <ValidationErrors
        className={model?.className}
        style={{ ...getStyle(model?.style, formData), ...finalStyle }}
        error={validationErrors}
      />
    );
  },
  /** validationErrors should not have any settings and should be never in hidden mode and depends on permission */
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) => m.add<IValidationErrorsComponentProps>(0, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default ValidationErrorsComponent;
