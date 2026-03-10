import React, { FC } from 'react';
import { SaveOutlined } from '@ant-design/icons';
import { componentsFlatStructureToTree } from '@/providers/form/utils';
import { App, Button } from 'antd';
import { FormMarkupWithSettings } from '@/providers/form/models';
import { useFormDesigner } from '@/providers/formDesigner';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { useStyles } from '../styles/styles';
import { FormName } from './formName';


export interface ISaveMenuProps {
  onSaved?: () => void;
}

export const SaveMenu: FC<ISaveMenuProps> = ({ onSaved }) => {
  const { saveForm } = useFormPersister();
  const formDesigner = useFormDesigner();
  const toolboxComponents = useFormDesignerComponents();
  const { message } = App.useApp();

  const { styles } = useStyles();

  const saveFormInternal = (): Promise<void> => {
    const { formFlatMarkup, formSettings } = formDesigner.state;
    const payload: FormMarkupWithSettings = {
      components: componentsFlatStructureToTree(toolboxComponents, formFlatMarkup),
      formSettings: formSettings,
    };
    return saveForm(payload);
  };

  const onSaveClick = (): void => {
    message.loading('Saving..', 0);
    saveFormInternal()
      .then(() => {
        message.destroy();

        if (onSaved)
          onSaved();
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
    <div
      className={styles.formNameParent}
    >
      <Button
        icon={<SaveOutlined />}
        onClick={onSaveClick}
        type="primary"
        size="small"
      />
      <FormName />
    </div>
  );
};
