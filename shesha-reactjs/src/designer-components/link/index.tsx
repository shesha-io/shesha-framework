import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { IInputStyles } from '@/providers';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { LinkOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { ILinkComponentProps, LinkComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { getFirstNonEmptyStringPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { useStyles } from './styles';
import classNames from 'classnames';

const LinkComponent: LinkComponentDefinition = {
  allowInherit: true,
  type: 'link',
  isInput: false,
  name: 'link',
  preserveDimensionsInDesigner: true,
  icon: <LinkOutlined />,
  getWrapperStyle: () => ({ style: { dimensions: { width: 'auto' } } }),
  calculateModel: (model, allData) => ({
    isDesignerMode: allData.form?.formMode === 'designer',
    href: evaluateString(model.href, allData.data ?? {}),
  }),
  Factory: ({ model, calculatedModel }) => {
    const { styles } = useStyles(model);

    const { content = 'Link', target, direction, id, hasChildren } = model;

    if (model.hidden === true) return null;

    return (
      <ConfigurableFormItem model={model}>
        {() => {
          if (hasChildren !== true) {
            return (
              <div className={styles.shaLinkWrapper} style={model.styleJson}>
                <a href={calculatedModel.href} target={target} className={styles.shaLink}>
                  {content}
                </a>
              </div>
            );
          }

          const containerHolder = (): ReactNode => (
            <ParentProvider
              name={`Link-${model.id}`}
              model={model}
            >
              <ComponentsContainer
                style={model.styleJson}
                containerId={id}
                direction={direction}
                className={classNames(styles.shaLinkContainer, model.className)}
                itemsLimit={1}
                dynamicComponents={model.isDynamic === true ? model.components : []}
              />
            </ParentProvider>
          );
          if (calculatedModel.isDesignerMode === true) {
            return containerHolder();
          }
          return (
            <a href={calculatedModel.href} target={target} className={styles.shaLink}>
              {containerHolder()}
            </a>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  getDefaultStyles: defaultStyles,
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  initModel: (model: ILinkComponentProps) => {
    const customProps: ILinkComponentProps = {
      ...model,
      direction: 'vertical',
      target: '_self',
      justifyContent: 'left',
      hideLabel: true,
    };

    return customProps;
  },
  migrator: (m) => m
    .add<ILinkComponentProps>(0, (prev) => ({ ...prev }) as ILinkComponentProps)
    .add<ILinkComponentProps>(1, (prev) => {
      return {
        ...prev,
        label: getFirstNonEmptyStringPropertyOrUndefined(prev, ["label", "name"]),
        href: prev.content,
        content: getStringPropertyOrUndefined(prev, "content"),
      };
    })
    .add<ILinkComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<ILinkComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ILinkComponentProps>(4, (prev, ctx) => {
      if (ctx.isNew === true) return prev;
      const styles: IInputStyles = { style: prev.style };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<ILinkComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default LinkComponent;
