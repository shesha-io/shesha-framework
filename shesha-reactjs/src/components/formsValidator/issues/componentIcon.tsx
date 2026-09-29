import { ShaForm } from '@/providers';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';
import { isDefined } from '@/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FC } from 'react';

export interface IComponentIconProps {
  componentId: string;
}

export const ComponentIcon: FC<IComponentIconProps> = ({ componentId }) => {
  const componentTypeGetter = useFormDesignerComponentGetter();
  const componentModel = ShaForm.useComponentModel(componentId);
  const componentDefinition = componentTypeGetter(componentModel.type);

  return isDefined(componentDefinition)
    ? (
      <>{componentDefinition.icon}</>
    )
    : <QuestionCircleOutlined />;
};
