import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { IToolboxComponent } from '@/interfaces';
import { useForm } from '@/providers/form';

import ParentProvider from '@/providers/parentProvider/index';
import { nanoid } from '@/utils/uuid';
import { CodeSandboxSquareFilled } from '@ant-design/icons';
import { Card } from 'antd';
import { ICardComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import classNames from 'classnames';
import { useStyles } from './styles';
import { removeComponents } from '../_common-migrations/removeComponents';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { isDefined } from '@/utils';
import { EMPTY_STYLE } from '@/styles/variables';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible, migrateStylingBoxToJson } from '../_common-migrations';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { useMemo } from 'react';

const CardComponent: IToolboxComponent<ICardComponentProps> = {
  allowInherit: true,
  type: 'card',
  isInput: false,
  name: 'Card',
  preserveDimensionsInDesigner: true,
  icon: <CodeSandboxSquareFilled />,
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const { styles } = useStyles(model);
    const handleEvent = useEvents<void>(model.componentName);
    const events = useMemo(() => getComponentEvents<void>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent }), [handleEvent, model]);
    if (model.hidden === true) return null;

    const title = model.hideHeading === true ? null : model.label;
    const headerComponents = model.header?.components ?? [];

    const extra = (headerComponents.length > 0 || formMode === 'designer') && model.hideHeading !== true && isDefined(model.header)
      ? (
        <ComponentsContainer
          containerId={model.header.id}
          direction="horizontal"
          dynamicComponents={model.isDynamic === true ? headerComponents : []}
        />
      )
      : null;

    return (
      <ParentProvider model={model} name={`Card-${model.id}`}>
        <Card
          className={classNames(model.className, styles.shaCardComponent, { [styles.hideWhenEmpty]: model.hideWhenEmpty })}
          title={title}
          extra={extra}
          style={model.styleCss ?? EMPTY_STYLE}
          {...events}
        >
          {model.content && (
            <ComponentsContainer
              containerId={model.content.id}
              dynamicComponents={model.isDynamic === true ? model.content.components : []}
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
  }),
  getDefaultStyles: defaultStyles,
  settingsFormMarkup: getSettings,

  customContainerNames: ['header', 'content'],
  migrator: (m) => m
    .add<ICardComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ICardComponentProps>(2, (prev) => removeComponents(prev))
    .add<ICardComponentProps>(3, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<ICardComponentProps>(4, (prev, ctx) => ctx.isNew === true
      ? prev
      : {
        ...prev,
        // fix wrong dimensions, old versions of the component didn't use dimensions
        desktop: { ...prev.desktop, dimensions: { ...prev.desktop?.dimensions, width: 'auto', height: 'fit-content' } },
        tablet: { ...prev.tablet, dimensions: { ...prev.tablet?.dimensions, width: 'auto', height: 'fit-content' } },
        mobile: { ...prev.mobile, dimensions: { ...prev.mobile?.dimensions, width: 'auto', height: 'fit-content' } },
      })
    .add<ICardComponentProps>(5, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
};

export default CardComponent;
