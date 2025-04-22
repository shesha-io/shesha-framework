import React, { FC } from 'react';
import { App } from 'antd';
import { CreateNewVersionButton } from './createNewVersionButton';
import { FormConfigurationDto } from '@/providers/form/api';
import { SaveMenu } from './saveMenu';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useShaRouting, useSheshaApplication } from '@/providers';
import { PublishButton } from './publishButton';
import { DebugButton } from './debugButton';
import { UndoRedoButtons } from './undoRedoButtons';
import { PreviewButton } from './previewButton';
import { FormSettingsButton } from './formSettingsButton';
import { useStyles } from '../styles/styles';
import { CanvasConfig } from './canvasConfig';
import { CustomActions } from './customActions';

export interface IProps { }

export const FormDesignerToolbar: FC<IProps> = () => {
  const { routes } = useSheshaApplication();
  const { router } = useShaRouting(false) ?? {};
  const readOnly = useFormDesignerStateSelector(x => x.readOnly);
  const formSettings = useFormDesignerStateSelector(x => x.formSettings);
  const { styles } = useStyles();
  const { message } = App.useApp();

  const { anyOfPermissionsGranted } = useSheshaApplication();

  const isGranted = formSettings?.access !== 4 || anyOfPermissionsGranted(formSettings?.permissions || []);

  const onVersionCreated = (newVersion: FormConfigurationDto) => {
    const url = `${routes.formsDesigner}?id=${newVersion.id}`;
    if (router)
      router.push(url);
    else
      console.error('router not available, url: ', url);

    message.info('New version created successfully', 3);
  };

  return (
    <div className={styles.shaDesignerToolbar}>
      {isGranted &&
        <>
          <div className={styles.shaDesignerToolbarLeft}>
            {!readOnly && (
              <SaveMenu />
            )}
            <CreateNewVersionButton onSuccess={onVersionCreated} />
            <PublishButton />
          </div>
          <div className={styles.shaDesignerToolbarCenter}>
            <CanvasConfig/>
          </div>
          <div className={styles.shaDesignerToolbarRight}>
            <FormSettingsButton />
            <PreviewButton />
            <DebugButton />

            {!readOnly && (<UndoRedoButtons />)}
            <CustomActions />
          </div>
        </>
      }
    </div>
  );
};