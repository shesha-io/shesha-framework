import React, { CSSProperties, ReactNode } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { LinkOutlined } from '@ant-design/icons';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData } from '../../../../providers';
import settingsFormJson from './settingsForm.json';
import ComponentsContainer from '../../containers/componentsContainer';
import { AlignItems, JustifyContent, JustifyItems } from '../../../../designer-components/container/interfaces';
import { ContainerDirection } from '../../common/interfaces';

export interface IAlertProps extends IConfigurableFormComponent {
  text: string;
  description?: string;
  showIcon?: boolean;
  icon?: string;
}
export interface ILinkProps extends IConfigurableFormComponent {
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
  components?: IConfigurableFormComponent[];
}

const settingsForm = settingsFormJson as FormMarkup;
const LinkComponent: IToolboxComponent<ILinkProps> = {
  type: 'link',
  name: 'link',
  icon: <LinkOutlined />,
  factory: (model: ILinkProps) => {
    const { isComponentHidden, formMode } = useForm();

    const { data } = useFormData();

    const {
      propertyName: name,
      content = '',
      style,
      target,
      direction,
      justifyContent,
      id,
      alignItems,
      justifyItems,
      hasChildren,
    } = model;

    const linkStyle: CSSProperties = {};

    if (direction === 'horizontal' && justifyContent) {
      linkStyle['display'] = 'flex';
      linkStyle['justifyContent'] = justifyContent;
      linkStyle['alignItems'] = alignItems;
      linkStyle['justifyItems'] = justifyItems;
    }

    const href = evaluateString(content, data);

    const isHidden = isComponentHidden(model);
    const isDesignerMode = formMode === 'designer';

    if (isHidden) return null;

    if (!hasChildren) {
      return (
        <a href={href} target={target} className="sha-link" style={{ ...linkStyle, ...getStyle(style, data) }}>
          {name}
        </a>
      );
    }

    const containerHolder = () => (
      <ComponentsContainer
        containerId={id}
        direction={direction}
        justifyContent={model.direction === 'horizontal' ? model?.justifyContent : null}
        alignItems={model.direction === 'horizontal' ? model?.alignItems : null}
        justifyItems={model.direction === 'horizontal' ? model?.justifyItems : null}
        className={model.className}
        itemsLimit={1}
        dynamicComponents={model?.isDynamic ? model?.components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []}
      />
    );
    if (isDesignerMode) {
      return containerHolder();
    }
    return (
      <a href={href} target="_self" style={getStyle(style, data)}>
        {containerHolder()}
      </a>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model: ILinkProps) => {
    const customProps: ILinkProps = {
      ...model,
      direction: 'vertical',
      target: '',
      justifyContent: 'left',
    };

    return customProps;
  },
};

export default LinkComponent;
