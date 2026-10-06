import { MenuOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Dropdown, App } from 'antd';
import { FC } from 'react';
import { downloadAsJson } from '@/utils/configurationFramework/actions';
import { useFormPersister } from '@/providers/formPersisterProvider';
import { ItemType } from 'antd/es/menu/interface';
import { isDefined } from '@/utils';
import { useDynamicModals, useHttpClient } from '@/providers';
import { useFormDesigner } from '@/providers/formDesigner';
import { extractErrorMessage } from '@/utils/errors';

export type ICustomActionsProps = Pick<ButtonProps, 'size'>;

export const CustomActions: FC<ICustomActionsProps> = (props) => {
  const { formProps, loadForm } = useFormPersister();
  const { validateFormAndSaveResultsAsync, getValidationResults } = useFormDesigner();
  const formId = formProps?.id;
  const httpClient = useHttpClient();
  const { open: openModal } = useDynamicModals();
  const { message } = App.useApp();
  if (!isDefined(formId))
    return null;

  const items: ItemType[] = [
    {
      key: 'exportMarkup',
      label: 'Export Markup',
      onClick: () => {
        return downloadAsJson({ id: formId, httpClient });
      },
    },
    {
      key: 'importMarkup',
      label: 'Import Markup',
      onClick: () => {
        openModal({
          title: 'Import JSON',
          formId: { module: 'Shesha', name: 'form-import-json' },
          mode: 'edit',
          formArguments: {
            itemId: formId,
          },
          id: `import-form-${formId}`,
          isVisible: true,
          width: '60%',
          onSubmitted: () => {
            message.success('Form imported successfully');
            loadForm({ skipCache: true }).catch((error) => {
              console.error('Failed to load form', error);
              throw error;
            });
          },
        });
      },
    },
    { type: 'divider' },
    {
      key: 'validateForm',
      label: 'Validate Form',
      onClick: async () => {
        try {
          await validateFormAndSaveResultsAsync();
          message.success('Form validated successfully');
        } catch (e) {
          message.error('Form validated failed. ' + extractErrorMessage(e));
        }
      },
    },
    {
      key: 'copyValidationResults',
      label: 'Copy form problems to clipboard',
      onClick: async () => {
        const results = getValidationResults();
        if (results.length === 0) {
          message.info('No problems found');
        }

        await navigator.clipboard.writeText(JSON.stringify(results, null, 2));
        message.info('Form problems copied to clipboard');
      },
    },
  ];
  return (
    <Dropdown menu={{ items: items }} placement="bottomRight" arrow>
      <Button type="default" size={props.size} icon={<MenuOutlined />}></Button>
    </Dropdown>
  );
};
