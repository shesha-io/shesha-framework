import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { IInputStyles } from '@/providers';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { LinkOutlined } from '@ant-design/icons';
import React, { CSSProperties, ReactNode } from 'react';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { ILinkComponentProps, LinkComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

const LinkComponent: LinkComponentDefinition = {
  type: 'link',
  isInput: false,
  name: 'link',
  icon: <LinkOutlined />,
  calculateModel: (model, allData) => ({
    isDesignerMode: allData.form.formMode === 'designer',
    href: evaluateString(model.href, allData.data),
  }),
  Factory: ({ model, calculatedModel }) => {
    const {
      content = 'Link',
      target,
      direction,
      justifyContent,
      id,
      alignItems,
      justifyItems,
      hasChildren,
    } = model;
    // Create link container style with textAlign from fontStyles
    const linkStyle: CSSProperties = {};

    if (direction === 'horizontal' && justifyContent) {
      linkStyle['display'] = 'flex';
      linkStyle['justifyContent'] = justifyContent;
      linkStyle['alignItems'] = alignItems;
      linkStyle['justifyItems'] = justifyItems;
    }

    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {() => {
          if (!hasChildren) {
            return (
              <div style={{ ...linkStyle }}>
                <a href={calculatedModel.href} target={target} className="sha-link" style={model.allStyles.fullStyle}>
                  {content}
                </a>
              </div>
            );
          }

          const containerHolder = (): ReactNode => (
            <ParentProvider model={model}>
              <ComponentsContainer
                style={{ ...linkStyle, ...model.allStyles.fullStyle }}
                containerId={id}
                direction={direction}
                justifyContent={model.direction === 'horizontal' ? model?.justifyContent : null}
                alignItems={model.direction === 'horizontal' ? model?.alignItems : null}
                justifyItems={model.direction === 'horizontal' ? model?.justifyItems : null}
                className={model.className}
                itemsLimit={1}
                dynamicComponents={model?.isDynamic ? model?.components : []}
              />
            </ParentProvider>
          );
          if (calculatedModel.isDesignerMode) {
            return containerHolder();
          }
          return (
            <a href={calculatedModel.href} target={target} className="sha-link">
              {containerHolder()}
            </a>
          );
        }}
      </ConfigurableFormItem>
    );
  },
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
  migrator: (m) =>
    m
      .add<ILinkComponentProps>(0, (prev) => ({ ...prev }) as ILinkComponentProps)
      .add<ILinkComponentProps>(1, (prev) => {
        return {
          ...prev,
          label: prev.label ?? prev['name'],
          href: prev.content,
          content: prev['name'],
        };
      })
      .add<ILinkComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ILinkComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ILinkComponentProps>(4, (prev) => {
        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<ILinkComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
};

export default LinkComponent;
