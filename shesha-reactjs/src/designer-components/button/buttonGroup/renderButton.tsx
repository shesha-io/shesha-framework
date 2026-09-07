import { ButtonGroupItemProps } from '@/providers';
import { FC, useMemo } from 'react';
import ConfigurableButton from '../configurableButton';
import { useShaComponentStyles } from '@/components/formDesigner/styles/shaComponentStyles';
import { IToolboxComponent } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { ShaIcon } from '@/components/shaIcon';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '@/designer-components/_common/events';

interface IRenderButtonProps {
  props: ButtonGroupItemProps;
  buttonComponent: IToolboxComponent;
}

export const RenderButton: FC<IRenderButtonProps> = ({ props, buttonComponent: toolboxComponent }) => {
  const componentModel = useMemo(() => ({ ...props, type: 'button' }), [props]);
  const { styles: shaComponentStyles } = useShaComponentStyles({ componentModel, toolboxComponent, isDesigner: false });
  const handleEvent = useEvents<void>(props.name);

  const label = useMemo(() => (
    <>
      {isDefined(props.label) ? props.label : null}
      {!isNullOrWhiteSpace(props.downIcon) ? <ShaIcon iconName={props.downIcon} /> : null}
    </>
  ), [props.label, props.downIcon]);

  const isIconOnly = props.itemType === 'item' && props.buttonType === 'link' && (!isDefined(props.label) || (typeof props.label === 'string' && isNullOrWhiteSpace(props.label)));

  return (
    <div className={shaComponentStyles.shaComponent}>
      <ConfigurableButton
        key={props.id}
        {...props}
        label={label}
        className={isIconOnly ? 'ant-btn-icon-only' : ''}
        additionalDomProperties={getComponentEvents<void, ButtonGroupItemProps>(props, ['onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
      />
    </div>
  );
};
