import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import {
  confirmModel,
  defaultStyles,
  getDefaultModel,
  getFormItemProps,
  getInputProps,
  IPasswordComponentProps
} from './utils';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { IToolboxComponent } from '@/interfaces';
import { LockOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { PasswordCombo } from './passwordCombo';
import { IInputStyles, useForm, useSheshaApplication } from '@/providers';
import { getStyle, pickStyleFromModel, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getFontStyle } from '../_settings/utils/font/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { ValidationErrors } from '@/components';
import { removeUndefinedProps } from '@/utils/object';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';

const PasswordComboComponent: IToolboxComponent<IPasswordComponentProps> = {
  type: 'passwordCombo',
  isInput: true,
  name: 'Password combo',
  icon: <LockOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) =>
    dataType === DataTypes.string && dataFormat === StringFormats.password,
  Factory: ({ model }) => {
    const defaultModel = getDefaultModel(model);
    const { placeholder, confirmPlaceholder, message, minLength } = defaultModel || {};
    const { formData } = useForm();

    const options = { hidden: model.hidden, formData };

    const { backendUrl, httpHeaders } = useSheshaApplication();
    const { styles } = useStyles({ fontFamily: model?.font?.type, fontWeight: model?.font?.weight, textAlign: model?.font?.align });

    const dimensions = model?.dimensions;
    const border = model?.border;
    const font = model?.font;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model.style, model);

    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
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
    }, [background, backendUrl, httpHeaders, jsStyle]);

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }

    const styling = JSON.parse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...jsStyle
    });


    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    return (

      <PasswordCombo
        inputProps={{ ...getInputProps(defaultModel, formData), disabled: defaultModel.readOnly, className: styles.passwordCombo }}
        placeholder={placeholder}
        confirmPlaceholder={confirmPlaceholder}
        formItemProps={getFormItemProps(defaultModel, options)}
        formItemConfirmProps={getFormItemProps(confirmModel(defaultModel), options)}
        passwordLength={minLength}
        errorMessage={message}
        style={finalStyle}
        className={styles.passwordCombo}
      />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IPasswordComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPasswordComponentProps>(1, (prev) => migrateReadOnly(prev))
    .add<IPasswordComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IPasswordComponentProps>(6, (prev) => {
      const styles: IInputStyles = {
        size: prev.size,
        hideBorder: prev.hideBorder,
        style: prev.style
      };

      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IPasswordComponentProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()), editMode: 'inherited' })),
};

export default PasswordComboComponent;
