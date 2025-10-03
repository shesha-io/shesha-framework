import React, { FC } from 'react';
import {
  SaveOutlined,
} from '@ant-design/icons';
import { componentsFlatStructureToTree } from '@/providers/form/utils';
import {
  App,
  Button,
  ButtonProps,
} from 'antd';
import { FormMarkupWithSettings } from '@/providers/form/models';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useFormPersister } from '@/providers/formPersisterProvider';

export interface ISaveButtonProps extends Pick<ButtonProps, 'size' | 'type'> {
  onSaved?: () => void;
}

export const SaveButton: FC<ISaveButtonProps> = (props) => {
  const { saveForm } = useFormPersister();
  const formFlatMarkup = useFormDesignerStateSelector((x) => x.formFlatMarkup);
  const formSettings = useFormDesignerStateSelector((x) => x.formSettings);
  const toolboxComponents = useFormDesignerComponents();
  const { message } = App.useApp();
  const isModified = true;

  const saveFormInternal = (): Promise<void> => {
    const payload: FormMarkupWithSettings = {
      components: componentsFlatStructureToTree(toolboxComponents, formFlatMarkup),
      formSettings: formSettings,
    };
    return saveForm(payload);
  };

  const onSaveClick = () => {
    message.loading('Saving..', 0);
    saveFormInternal()
      .then(() => {
        message.destroy();

        if (props.onSaved)
          props.onSaved();
        else {
          message.success('Form saved successfully');
        }
      })
      .catch(() => {
        message.destroy();
        message.error('Failed to save form');
      });
  };

  return (
        <Button
          icon={<SaveOutlined />}
          onClick={onSaveClick}
          type={props.type}
          size={props.size}
          disabled={!isModified}
        />
  );
};
