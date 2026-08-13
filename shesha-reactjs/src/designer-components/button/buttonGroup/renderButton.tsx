import { ButtonGroupItemProps } from '@/providers';
import { FC, useMemo } from 'react';
import ConfigurableButton from '../configurableButton';
import { useShaComponentStyles } from '@/components/formDesigner/styles/shaComponentStyles';
import { IToolboxComponent } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { ShaIcon } from '@/components/shaIcon';

interface IRenderButtonProps {
  props: ButtonGroupItemProps;
  buttonComponent: IToolboxComponent;
}

export const RenderButton: FC<IRenderButtonProps> = ({ props, buttonComponent: toolboxComponent }) => {
  const componentModel = useMemo(() => ({ ...props, type: 'button' }), [props]);
  const { styles: shaComponentStyles } = useShaComponentStyles({ componentModel, toolboxComponent, isDesigner: false });

  const label = useMemo(() => (
    <>
      {isDefined(props.label) ? props.label : null}
      {!isNullOrWhiteSpace(props.downIcon) ? <ShaIcon iconName={props.downIcon} /> : null}
    </>
  ), [props.label, props.downIcon]);

  return (
    <div className={shaComponentStyles.shaComponent}>
      <ConfigurableButton key={props.id} {...props} label={label} />
    </div>
  );
};
