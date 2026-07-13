import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { IToolboxComponent } from '@/interfaces';
import { useFormData, useGlobalState } from '@/providers';
import { useForm } from '@/providers/form';
import { getLayoutStyle, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { nanoid } from '@/utils/uuid';
import { CodeSandboxSquareFilled } from '@ant-design/icons';
import { Card } from 'antd';
import React, { useMemo } from 'react';
import { ICardComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import classNames from 'classnames';
import { useStyles } from './styles';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { removeNullUndefined } from '@/providers/utils';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { useBackgroundStyles } from '../_settings/utils/background/useBackground';


const CardComponent: IToolboxComponent<ICardComponentProps> = {
  type: 'card',
  isInput: false,
  name: 'Card',
  preserveDimensionsInDesigner: true,
  icon: <CodeSandboxSquareFilled />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { formMode } = useForm();
    const { globalState } = useGlobalState();
    const { styles } = useStyles();

    const title = model.hideHeading ? null : model.label;

    const border = model.border;
    const shadow = model.shadow;
    const background = model.background;
    const jsStyle = getStyle(model.style, model);

    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border, jsStyle]);
    const backgroundStyles = useBackgroundStyles({ background, jsStyle });
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    const newStyles = {
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...jsStyle,
    };

    const headerComponents = model.header?.components ?? [];

    const extra =
      (headerComponents.length > 0 || formMode === 'designer') && !model.hideHeading && model.header
        ? (
          <ComponentsContainer
            containerId={model.header.id}
            direction="horizontal"
            dynamicComponents={model.isDynamic ? headerComponents : []}
          />
        )
        : null;

    if (model.hidden) return null;

    return (
      <ParentProvider model={model} name={`Card-${model.id}`}>
        <Card
          className={classNames(model.className, { [styles.hideWhenEmpty]: model.hideWhenEmpty })}
          title={title}
          extra={extra}
          styles={{}}
          style={{ ...removeNullUndefined(newStyles), ...getLayoutStyle(model, { data, globalState }) }}
        >
          {model.content && (
            <ComponentsContainer
              containerId={model.content.id}
              dynamicComponents={model.isDynamic ? model.content.components : []}
            />
          )}
        </Card>
      </ParentProvider>
    );
  },
  initModel: (model) => ({
    ...model,
    header: { id: nanoid(), components: [] },
    content: { id: nanoid(), components: [] },
    stylingBox: "{\"marginBottom\":\"5\"}",
  }),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  customContainerNames: ['header', 'content'],
  migrator: (m) => m
    .add<ICardComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ICardComponentProps>(2, (prev) => removeComponents(prev))
    .add<ICardComponentProps>(3, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),

};

export default CardComponent;
