import React, { CSSProperties, ReactNode, useMemo } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { LinkOutlined } from '@ant-design/icons';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IInputStyles, useForm, useFormData } from '@/providers';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { AlignItems, JustifyContent, JustifyItems } from '@/designer-components/container/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import ParentProvider from '@/providers/parentProvider/index';
import { ContainerDirection } from '@/components/formDesigner/common/interfaces';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getFontStyle } from '../_settings/utils/font/utils';
import { IFontValue } from '../_settings/utils/font/interfaces';
import { removeUndefinedProps } from '@/utils/object';
import { defaultStyles } from './utils';

export interface IAlertProps extends IConfigurableFormComponent {
  text: string;
  description?: string;
  showIcon?: boolean;
  icon?: string;
}
export interface ILinkProps extends IConfigurableFormComponent {
  href?: string;
  content?: string;
  propertyName: string;
  target?: string;
  download?: string;
  direction?: ContainerDirection;
  hasChildren?: boolean;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  justifyItems?: JustifyItems;
  className?: string;
  icon?: ReactNode;
  font?: IFontValue;
  components?: IConfigurableFormComponent[];
}

const LinkComponent: IToolboxComponent<ILinkProps> = {
  type: 'link',
  isInput: false,
  name: 'link',
  icon: <LinkOutlined />,
  Factory: ({ model }) => {
    const { formMode } = useForm();

    const { data } = useFormData();

    const {
      href: initialHref = '',
      content = '',
      style,
      target,
      direction,
      justifyContent,
      id,
      alignItems,
      justifyItems,
      hasChildren,
      font,
    } = model;

    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const finalStyle = removeUndefinedProps({ ...fontStyles, ...getStyle(style, data) });

    const linkStyle: CSSProperties = {};

    if (direction === 'horizontal' && justifyContent) {
      linkStyle['display'] = 'flex';
      linkStyle['justifyContent'] = justifyContent;
      linkStyle['alignItems'] = alignItems;
      linkStyle['justifyItems'] = justifyItems;
    }

    const isDesignerMode = formMode === 'designer';

    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {() => {
          const href = evaluateString(initialHref || model?.href, data);

          if (!hasChildren) {
            return (
              <a href={href} target={target} className="sha-link" style={{ ...linkStyle, ...finalStyle }}>
                {content}
              </a>
            );
          }

          const containerHolder = () => (
            <ParentProvider model={model}>
              <ComponentsContainer
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
          if (isDesignerMode) {
            return containerHolder();
          }
          return (
            <a href={href} target={target} className="sha-link" style={finalStyle}>
              {containerHolder()}
            </a>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model: ILinkProps) => {
    const customProps: ILinkProps = {
      ...model,
      direction: 'vertical',
      target: '_self',
      justifyContent: 'left',
    };

    return customProps;
  },
  migrator: (m) =>
    m
      .add<ILinkProps>(0, (prev) => ({ ...prev }) as ILinkProps)
      .add<ILinkProps>(1, (prev) => {
        return {
          ...prev,
          label: prev.label ?? prev['name'],
          href: prev.content,
          content: prev['name'],
        };
      })
      .add<ILinkProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ILinkProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ILinkProps>(4, (prev) => {
        const styles: IInputStyles = {
          style: prev.style,
        };

        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<ILinkProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
};

export default LinkComponent;
