import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { IToolboxComponent } from '@/interfaces';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { useForm } from '@/providers/form';
import { getLayoutStyle, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { nanoid } from '@/utils/uuid';
import { CodeSandboxSquareFilled } from '@ant-design/icons';
import { Card } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { ICardComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import classNames from 'classnames';
import { useStyles } from './styles';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { removeNullUndefined } from '@/providers/utils';
import { defaultStyles } from './utils';


const CardComponent: IToolboxComponent<ICardComponentProps> = {
  type: 'card',
  isInput: false,
  name: 'Card',
  icon: <CodeSandboxSquareFilled />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { formMode } = useForm();
    const { globalState } = useGlobalState();
    const { styles } = useStyles();
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const title = model.hideHeading ? null : model.label;

    const border = model?.border;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model.style, model);

    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
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
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders, jsStyle]);

    const newStyles = {
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...jsStyle
    };

    const headerComponents = model?.header?.components ?? [];

    const extra =
      (headerComponents?.length > 0 || formMode === 'designer') && !model.hideHeading ? (
        <ComponentsContainer
          containerId={model.header?.id}
          direction="horizontal"
          dynamicComponents={model?.isDynamic ? headerComponents : []}
        />
      ) : null;

    if (model.hidden) return null;

    return (
      <ParentProvider model={model}>
        <Card
          className={classNames(model.className, { [styles.hideWhenEmpty]: model.hideWhenEmpty })}
          title={title}
          extra={extra}
          style={{ ...removeNullUndefined(newStyles), ...getLayoutStyle(model, { data, globalState }) }}
        >
          <ComponentsContainer
            containerId={model?.content?.id}
            dynamicComponents={model?.isDynamic ? model?.content.components : []}
          />
        </Card>
      </ParentProvider>
    );
  },
  initModel: (model) => ({
    ...model,
    header: { id: nanoid(), components: [] },
    content: { id: nanoid(), components: [] },
    stylingBox: "{\"marginBottom\":\"5\"}"
  }),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  customContainerNames: ['header', 'content'],
  migrator: (m) => m
    .add<ICardComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ICardComponentProps>(2, (prev) => removeComponents(prev))
    .add<ICardComponentProps>(3, (prev) => ({ ...prev, desktop: { ...defaultStyles(prev) }, mobile: { ...defaultStyles(prev) }, tablet: { ...defaultStyles(prev) } })),

};

export default CardComponent;
