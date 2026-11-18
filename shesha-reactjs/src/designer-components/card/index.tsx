import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
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
import { defaultHeaderStyles, defaultStyles, legacyHeaderStyles } from './utils';
import { migrateCardHeaderLayout } from './migrations/migrateHeaderLayout';
import { shaHeaderComponentsContainer } from '@/components/panel/styles/styles';
import { getHeaderGroupStyle } from '../_common/styles/headerStyles';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { isDefined } from '@/utils';
import { EMPTY_STYLE } from '@/styles/variables';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible, migrateStylingBoxToJson } from '../_common-migrations';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { useMemo } from 'react';

const CARD_EVENTS = ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'] as const;

const CardComponent: IToolboxComponent<ICardComponentProps> = {
  themeGroup: 'layout',
  // The header follows the Layout Components theme: the body's style, unless the theme's Header Defaults
  // override it. The component's Header Style overrides both.
  nestedGroupStyles: { headerStyles: getHeaderGroupStyle },
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
    const events = useMemo(() => getComponentEvents<void>(model, CARD_EVENTS, { handleEvent }), [handleEvent, model]);
    const headerEvents = useMemo(() => getComponentEvents<void>(model, CARD_EVENTS, { handleEvent }, undefined, undefined, 'headerEvents'), [handleEvent, model]);
    if (model.hidden === true) return null;

    // The header is a configurable container (heading text + extra area, see migrateCardHeaderLayout), as a
    // panel's. A card whose header holds nothing falls back to its label.
    const { header } = model;
    const headerComponents = header?.components ?? [];
    const title = model.hideHeading === true
      ? null
      : isDefined(header) && (headerComponents.length > 0 || formMode === 'designer')
        ? (
          <ComponentsContainer
            containerId={header.id}
            dynamicComponents={model.isDynamic === true ? headerComponents : []}
            className={shaHeaderComponentsContainer}
            additionalDomProperties={headerEvents}
          />
        )
        : model.label;

    return (
      <ParentProvider model={model} name={`Card-${model.id}`}>
        <Card
          className={classNames(model.className, styles.shaCardComponent, { [styles.hideWhenEmpty]: model.hideWhenEmpty })}
          title={title}
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
  getDefaultStyles: () => ({ ...defaultStyles(), headerStyles: defaultHeaderStyles() }),
  settingsFormMarkup: getSettings,
  // antd only renders a card's body when it has content, so an empty card has nowhere to show its
  // padding. The theme preview gives it sample content so the configured padding (and the margins
  // around a card that has a body) are visible.
  previewConfiguration: {
    type: 'card',
    id: 'card-preview',
    componentName: 'cardPreview',
    propertyName: 'cardPreview',
    label: 'Card',
    version: 'latest',
    header: { id: 'card-preview-header', components: [] },
    content: {
      id: 'card-preview-content',
      components: [
        {
          type: 'text',
          id: 'card-preview-text',
          componentName: 'cardPreviewText',
          propertyName: 'cardPreviewText',
          parentId: 'card-preview-content',
          content: 'Card content',
          version: 'latest',
        } as IConfigurableFormComponent,
      ],
    },
  },

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
    .add<ICardComponentProps>(5, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev))))
    // Configurable header, as a panel's: the heading becomes a Text component in the header container.
    .add<ICardComponentProps>(6, migrateCardHeaderLayout)
    // Existing cards keep antd's header look, whatever the theme's Header Defaults say; it can be changed in Header Style.
    .add<ICardComponentProps>(7, (prev, ctx) => ctx.isNew === true
      ? prev
      : {
        ...prev,
        desktop: { ...prev.desktop, headerStyles: { ...legacyHeaderStyles(), ...prev.desktop?.headerStyles } },
        tablet: { ...prev.tablet, headerStyles: { ...legacyHeaderStyles(), ...prev.tablet?.headerStyles } },
        mobile: { ...prev.mobile, headerStyles: { ...legacyHeaderStyles(), ...prev.mobile?.headerStyles } },
      }),
};

export default CardComponent;
