import React, { FC } from 'react';
import { message } from 'antd';
import { CreateNewVersionButton } from './createNewVersionButton';
import { FormConfigurationDto } from '@/providers/form/api';
import { SaveMenu } from './saveMenu';
import { useFormDesigner } from '@/providers/formDesigner';
import { useShaRouting, useSheshaApplication } from '@/providers';
import { PublishButton } from './publishButton';
import { DebugButton } from './debugButton';
import { UndoRedoButtons } from './undoRedoButtons';
import { PreviewButton } from './previewButton';
import { FormSettingsButton } from './formSettingsButton';
import { useStyles } from '../styles/styles';
import { DeskTopButton } from './desktopButton';
import { MobileButton } from './mobileButton';
import { TabletButton } from './tabletButton';
import { DialogButton } from './dialogButton';

export interface IProps { }

export const FormDesignerToolbar: FC<IProps> = () => {
  const { routes } = useSheshaApplication();
  const { router } = useShaRouting(false) ?? {};
  const { readOnly } = useFormDesigner();
  const { styles } = useStyles();

  const onVersionCreated = (newVersion: FormConfigurationDto) => {
    const url = `${routes.formsDesigner}?id=${newVersion.id}`;
    if (router)
      router.push(url);
    else
      console.log('router not available, url: ', url);

    message.info('New version created successfully', 3);
  };

  return (
    <div className={styles.shaDesignerToolbar}>
      <div className={styles.shaDesignerToolbarLeft}>
        {!readOnly && (
          <SaveMenu />
        )}
        <CreateNewVersionButton onSuccess={onVersionCreated} />
        <PublishButton />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: '1.5rem', margin: '0 20%'}}>
      <DeskTopButton/>
      <MobileButton/>
      <TabletButton/>
      <DialogButton/>


      </div>
      <div className={styles.shaDesignerToolbarRight}>
        <FormSettingsButton />
        <PreviewButton />
        <DebugButton />

        {!readOnly && (<UndoRedoButtons />)}
      </div>
    </div>
  );
};