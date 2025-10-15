import React, { FC } from 'react';
import {
  CopyOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { componentsFlatStructureToTree } from '@/providers/form/utils';
import {
  App,
  Button,
} from 'antd';
import { FormMarkupWithSettings } from '@/providers/form/models';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { getFormFullName } from '@/utils/form';
import { useStyles } from '../styles/styles';


export interface ISaveMenuProps {
  onSaved?: () => void;
}

export const SaveMenu: FC<ISaveMenuProps> = ({ onSaved }) => {
  const { saveForm, formProps } = useFormPersister();
  const formFlatMarkup = useFormDesignerStateSelector((x) => x.formFlatMarkup);
  const formSettings = useFormDesignerStateSelector((x) => x.formSettings);
  const toolboxComponents = useFormDesignerComponents();
  const { message } = App.useApp();

  const { styles } = useStyles();

  const fullName = formProps ? getFormFullName(formProps.module, formProps.name) : null;

  const saveFormInternal = (): Promise<void> => {
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

  const copyFormName = (): void => {
    navigator.clipboard.writeText(fullName);
    message.success("Form name copied");
  };

  return (
    <div
      className={styles.formNameParent}
    >
      <Button
        icon={<SaveOutlined />}
        onClick={onSaveClick}
        type="primary"
      >
        Save
      </Button>
      <p
        className={styles.formName}
        title={fullName}
        onClick={() => copyFormName()}
      >
        <span className={styles.formTitle}> {fullName}
        </span>
        <CopyOutlined color="#555" size={12} title={fullName} />
      </p>
    </div>

  );
};
