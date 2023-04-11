import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { GroupOutlined } from '@ant-design/icons';
import ComponentsContainer from '../../componentsContainer';
import { useForm } from '../../../../providers/form';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { getSettings } from './settingsForm';
import { useFormData } from '../../../../providers';
import { ICommonContainerProps, IContainerComponentProps } from './interfaces';

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  name: 'Container',
  icon: <GroupOutlined />,
  factory: (model: IContainerComponentProps) => {
    const { isComponentHidden } = useForm();
    const { data: formData } = useFormData();

    if (isComponentHidden(model)) return null;

    const flexAndGridStyles: ICommonContainerProps = {
      display: model?.display,
      flexDirection: model?.flexDirection,
      direction: model?.direction,
      justifyContent: model?.justifyContent,
      alignItems: model?.alignItems,
      alignSelf: model?.alignSelf,
      justifyItems: model?.justifyItems,
      textJustify: model?.textJustify,
      justifySelf: model?.justifySelf,
      noDefaultStyling: model?.noDefaultStyling,
      gridColumnsCount: model?.gridColumnsCount,
      flexWrap: model?.flexWrap,
      gap: model?.gap,
    };

    return (
      <ComponentsContainer
        containerId={model.id}
        {...flexAndGridStyles}
        // display={model?.display}
        // direction={model.direction}
        // justifyContent={model.direction === 'horizontal' ? model?.justifyContent : null}
        // alignItems={model.direction === 'horizontal' ? model?.alignItems : null}
        // justifyItems={model.direction === 'horizontal' ? model?.justifyItems : null}
        className={model.className}
        wrapperStyle={getStyle(model?.wrapperStyle, formData)}
        style={getStyle(model?.style, formData)}
        dynamicComponents={model?.isDynamic ? model?.components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []}
      />
    );
  },
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: m =>
    m.add<IContainerComponentProps>(0, prev => ({
      ...prev,
      direction: prev['direction'] ?? 'vertical',
      justifyContent: prev['justifyContent'] ?? 'left',
      display: prev['display'] ?? 'block',
      flexWrap: prev['flexWrap'] ?? 'wrap',
      components: prev['components'] ?? []
    })),
};

export default ContainerComponent;
